import { inngest } from "./client";
import { createAgent, createNetwork, createState, gemini, type Message, TextMessage, Tool } from '@inngest/agent-kit';
import Sandbox from "@e2b/code-interpreter"
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import { z } from 'zod';
import { createTool } from "@inngest/agent-kit";
import { PROMPT } from "./prompt";
import { db } from "@/lib/db";
import { searchUnsplashPhoto } from "@/lib/unsplash";
import { UnsplashAttribution } from "@/lib/unsplash";
import { channel, topic } from "@inngest/realtime";

interface CodeAgentState {
    summary: string;
    files: Record<string, string>;
}

export const userChannel = channel("project").addTopic(
    topic("projectInfo").type<string>(),
);


const TIMEOUT_MS = 60 * 60 * 1000

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/codeAgent.run" },
    async ({ event, step, publish }) => {

        const sandboxId = await step.run('get-or-create-sandbox', async () => {
            const project = await db.project.findUnique({
                where: {
                    id: event.data.projectId
                },
                select: {
                    sandboxId: true
                }
            })

            if (!project) {
                throw new Error("Project not found")
            }

            if (project?.sandboxId) {
                const sandbox = await Sandbox.connect(project.sandboxId,{
                    timeoutMs: TIMEOUT_MS
                })
                return sandbox.sandboxId
            }

            const sb = await Sandbox.create("23eg105j66/vibecreation-v1",{
                timeoutMs: TIMEOUT_MS
            })

            await db.project.update({
                where: {
                    id: event.data.projectId
                },
                data: {
                    sandboxId: sb.sandboxId
                }
            })

            return sb.sandboxId
        })

        const getPrevMsg = await step.run('get-prev-messages',async()=>{
            const messages = await db.message.findMany({
                where: {
                    projectId: event.data.projectId
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                take: 10
            })
            
            const latestMessages = messages.map(message=>{
                return {
                    type:'text',
                    role : message.role === 'ASSISTANT' ? 'assistant' : 'user',
                    content: message.content
                }
            }).reverse()

            return latestMessages as Message[]
        })

        const getPrevCodefiles = await step.run('get-prev-code-files',async()=>{
            const lastMessage = await db.message.findFirst({
                where: {
                    projectId: event.data.projectId,
                    codeFragment:{
                        isNot:null
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                include:{
                    codeFragment:true
                }
            })
            return (lastMessage?.codeFragment?.files as Record<string,string>)||{}
        })

        const codingAgentState = createState<CodeAgentState>({
            summary:"",
            files:getPrevCodefiles
        },{
            messages:getPrevMsg
        })



        const codeAgent = createAgent<CodeAgentState>({
            name: 'Coding Agent',
            system: PROMPT,
            description: 'An expert coding agent',
            model: gemini({
                model: 'gemini-2.0-flash'
            }),
            tools: [
                createTool({
                    name: 'terminal',
                    description: 'use terminal to run commands',
                    parameters: z.object({
                        command: z.string()
                    }),
                    handler: async ({ command }) => {
                        console.log("[Realtime] Publishing terminal status...");
                        await publish(
                            await userChannel().projectInfo(
                                "Running terminal command...",
                            ),
                        );
                        console.log("[Realtime] Terminal status published.");
                        const buffers = { stdout: "", stderr: "" }
                        try {
                            const sandbox = await getSandbox(sandboxId)
                            const result = await sandbox.commands.run(command, {
                                onStdout: (data) => {
                                    buffers.stdout += data
                                },
                                onStderr: (data) => {
                                    buffers.stderr += data
                                }
                            })
                            return result.stdout;
                        } catch (err) {
                            console.error(`command failed ${err} \nstdout:${buffers.stdout}\nstderr:${buffers.stderr}`)
                            return `command failed ${err} \nstdout:${buffers.stdout}\nstderr:${buffers.stderr}`
                        }
                    }
                }),
                createTool({
                    name: 'createOrUpdateFiles',
                    description: 'create or update files in the sandbox',
                    parameters: z.object({
                        files: z.array(z.object({
                            path: z.string(),
                            content: z.string()
                        }))
                    }),
                    handler: async ({ files }, { step, network }: Tool.Options<CodeAgentState>) => {
                        console.log("[Realtime] Publishing file status...");
                        await publish(
                            await userChannel().projectInfo(
                                "Generating project files...",
                            ),
                        );
                        console.log("[Realtime] File status published.");
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {}
                                const sandbox = await getSandbox(sandboxId)
                                for (const file of files) {
                                    const fullPath = toProjectPath(file.path)
                                    await sandbox.files.write(fullPath, file.content)
                                    updatedFiles[file.path] = file.content
                                }
                                return updatedFiles;
                            } catch (err) {
                                return "Error: " + err
                            }
                        })
                        if (newFiles && typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                            return `Successfully updated ${files.length} files.`;
                        }
                    }
                }),
                createTool({
                    name: 'readFiles',
                    description: 'Read Files from the sandbox',
                    parameters: z.object({ files: z.array(z.string()) }),
                    handler: async ({ files }, { step }) => {
                        console.log("[Realtime] Publishing read status...");
                        await publish(
                            await userChannel().projectInfo(
                                "Reading files...",
                            ),
                        );
                        console.log("[Realtime] Read status published.");
                        return await step?.run("readFiles", async () => {
                            try {
                                const contents: Record<string, string>[] = []
                                const sandbox = await getSandbox(sandboxId)
                                for (const file of files) {
                                    const fullPath = toProjectPath(file)
                                    const content = await sandbox.files.read(fullPath)
                                    contents.push({ path: file, content: content })
                                }
                                return JSON.stringify(contents)
                            } catch (e) {
                                return "Error: " + e
                            }
                        })
                    }
                }),
                createTool({
                    name: "unsplashImage",
                    description:
                        "Search Unsplash and download an image into /public/assets/unsplash. Return local public path and attributions.",
                    parameters: z.object({
                        query: z.string().min(2),
                        orientation: z
                            .enum(["landscape", "portrait", "squarish"])
                            .default("landscape"),
                        purpose: z
                            .enum([
                                "hero",
                                "feature",
                                "testimonial",
                                "background",
                                "listing",
                                "generic",
                            ])
                            .default("generic"),
                        filenameHint: z.string().default(""),
                    }),
                    handler: async ({ query, orientation, purpose, filenameHint }) => {
                        console.log("[Realtime] Publishing unsplash status...");
                        await publish(
                            await userChannel().projectInfo(
                                "Downloading images from Unsplash...",
                            ),
                        );
                        console.log("[Realtime] Unsplash status published.");
                        const accessKey = process.env.UNSPLASH_API_KEY;

                        if (!accessKey) {
                            throw new Error("Missing Unsplash API Key");
                        }

                        const sandbox = await getSandbox(sandboxId);

                        const search = await searchUnsplashPhoto({
                            accessKey,
                            query,
                            orientation,
                        });

                        const photo = search.results[0];
                        if (!photo)
                            throw new Error(`No Unsplash result for query: ${query}`);

                        const imageUrl =
                            (purpose === "background"
                                ? photo.urls.full
                                : photo.urls.regular) ?? photo.urls.regular;

                        if (!imageUrl)
                            throw new Error("Unsplash result missing usable image URL");

                        const safeSlug = String(filenameHint ?? photo.id ?? query)
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                            .slice(0, 60);

                        const publicDir = "/home/user/project/public/assets/unsplash";
                        const localFile = `${publicDir}/${safeSlug}.jpg`;
                        const publicPath = `/assets/unsplash/${safeSlug}.jpg`;

                        await sandbox.commands.run(`mkdir -p "${publicDir}"`);

                        const cmd = `curl -L --fail --silent --show-error "${imageUrl}" -o "${localFile}"`;
                        const result = await sandbox.commands.run(cmd);

                        if (result.exitCode !== 0) {
                            const msg = (result.stderr || result.stdout || "").slice(0, 800);
                            throw new Error(`Failed to download Unsplash image: ${msg}`);
                        }

                        const photographerName = photo.user.name ?? null;
                        const photographerUsername = photo.user.username ?? null;
                        const photoUrl = photo.links.html ?? null;

                        const attributionUrl =
                            photoUrl !== null
                                ? `${photoUrl}?utm_source=vibeCreation&utm_medium=referral`
                                : null;

                        const attribution: UnsplashAttribution = {
                            photographerName,
                            photographerUsername,
                            photoUrl,
                            attributionUrl,
                        };

                        return { publicPath, localFile, attribution };
                    },
                }),
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    console.log("[onResponse] Processing result:", JSON.stringify(result.output.map(m => ({ role: m.role, type: m.type })), null, 2))
                    const lastMessage = result.output.findLastIndex(
                        (message) => message.role === "assistant",
                    );

                    const message =
                        (result.output[lastMessage] as TextMessage) || undefined;

                    const lastTextMessage = message?.content
                        ? typeof message.content === "string"
                            ? message.content
                            : message.content.map((c) => c.text).join("")
                        : undefined;

                    if (lastTextMessage && network) {
                        console.log("[onResponse] Last text message:", lastTextMessage.substring(0, 100));
                        if (lastTextMessage.includes("<task_summary>")) {
                            console.log("[onResponse] Found task summary, setting state");
                            network.state.data.summary = lastTextMessage;
                        }
                    }

                    return result;
                },
            },
        })

        const network = createNetwork<CodeAgentState>({
            name: "coding-agent-network",
            agents: [codeAgent],
            router: ({ network }) => {
                if (network.state.data.summary) {
                    return undefined
                }
                return codeAgent
            },
            maxIter: 20,
            defaultState:codingAgentState
        })

        let result;
        try {
            result = await network.run(event.data.message, {state:codingAgentState})
        } catch (error: any) {
            console.error('[Network Error]', error)
            // Create a fallback result
            result = {
                state: {
                    data: {
                        summary: `I encountered an error: ${error.message}. Please try rephrasing your request.`,
                        files: {}
                    }
                }
            }
        }

        const sandboxUrl = await step.run('get-sandbox-url', async () => {
            const sandbox = await getSandbox(sandboxId)
            const host = sandbox.getHost(3000)
            return `https://${host}`
        })

        await step.run('save-result', async () => {
            console.log("[Realtime] Publishing save status...");
            await publish(
                await userChannel().projectInfo(
                    "Saving files to database...",
                ),
            );
            console.log("[Realtime] Save status published.");
            const assistantMessage = await db.message.create({
                data: {
                    content: result.state.data.summary || "Here is your updated project.",
                    role: "ASSISTANT",
                    type: "RESULT",
                    projectId: event.data.projectId
                }
            })

            if (result.state.data.files && Object.keys(result.state.data.files).length > 0) {
                await db.codeFragment.create({
                    data: {
                        messageId: assistantMessage.id,
                        sandboxUrl,
                        sandboxId,
                        title: 'Code Fragment',
                        files: result.state.data.files
                    }
                })
            }
        })

        return {
            sandboxUrl,
            title: 'Code Fragment',
            files: result.state.data.files,
            summary: result.state.data.summary
        }
    },
);

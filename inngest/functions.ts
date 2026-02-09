import { inngest } from "./client";
import { createAgent, createNetwork, gemini, TextMessage, Tool } from '@inngest/agent-kit';
import Sandbox from "@e2b/code-interpreter"
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import { z } from 'zod';
import { createTool } from "@inngest/agent-kit";
import { PROMPT } from "./prompt";
import { db } from "@/lib/db";

interface CodeAgentState {
    summary: string;
    files: Record<string, string>;
}

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/codeAgent.run" },
    async ({ event, step }) => {

        const sandboxId = await step.run('get-or-create-sandbox', async () => {
            const sb = await Sandbox.create("23eg105j66/vibecreation-v1")
            return sb.sandboxId
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
                })
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
        })

        let result;
        try {
            result = await network.run(event.data.message, {
                state: {
                    summary: "",
                    files: {}
                }
            })
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
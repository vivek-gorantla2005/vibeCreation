import { db } from "@/lib/db";
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import Elysia, { t } from "elysia";
import { createSandbox } from "@/lib/sandbox";

export const fragments = new Elysia({ prefix: "/fragments" }).patch(
    "/:fragmentId",
    async ({ body, params }) => {
        try {
            console.log(`[Fragments API] Patching fragment ${params.fragmentId}`, { projectId: body.projectId })

            const existingFragment = await db.codeFragment.findUnique({
                where: { id: params.fragmentId },
                select: {
                    files: true,
                    sandboxId: true,
                }
            })

            if (!existingFragment) {
                console.log(`[Fragments API] Fragment not found: ${params.fragmentId}`)
                return new Response("Fragment not found", { status: 404 })
            }

            const sandboxId = existingFragment.sandboxId ?? body.sandboxId
            if (!sandboxId) {
                console.log(`[Fragments API] Sandbox ID missing for fragment: ${params.fragmentId}`)
                return new Response("Sandbox not found", { status: 404 })
            }

            let currentSandboxId = sandboxId;
            let currentSandboxUrl: string | undefined = undefined;

            // Prepare the full set of files first (existing + updates)
            const existingFiles = (existingFragment.files && typeof existingFragment.files === 'object')
                ? existingFragment.files as Record<string, string>
                : {};

            const updatedFiles = {
                ...existingFiles,
                ...body.files
            }

            try {
                console.log(`[Fragments API] Connecting to sandbox: ${sandboxId}`)
                const sandbox = await getSandbox(sandboxId)

                const entries = Object.entries(body.files)
                console.log(`[Fragments API] Writing ${entries.length} updated files to sandbox`)

                for (const [path, content] of entries) {
                    const fullPath = toProjectPath(path)
                    await sandbox.files.write(fullPath, content)
                }
            } catch (sandboxError) {
                console.warn(`[Fragments API] Failed to update sandbox (possibly expired). Creating new sandbox...`, sandboxError)

                try {
                    const newSandbox = await createSandbox();
                    currentSandboxId = newSandbox.sandboxId;
                    currentSandboxUrl = `https://3000-${currentSandboxId}`;
                    console.log(`[Fragments API] Created new (recovery) sandbox: ${currentSandboxId}, URL: ${currentSandboxUrl}`)

                    // Write ALL files to the new sandbox
                    const allEntries = Object.entries(updatedFiles);
                    console.log(`[Fragments API] Writing all ${allEntries.length} files to new sandbox`)

                    for (const [path, content] of allEntries) {
                        const fullPath = toProjectPath(path)
                        await newSandbox.files.write(fullPath, content)
                    }

                    console.log(`[Fragments API] Starting development server in new sandbox...`)
                    // Run npm install and dev server in background
                    await newSandbox.commands.run("nohup sh -c 'npm install && npm run dev' > /dev/null 2>&1 &")
                } catch (newSandboxError) {
                    console.error(`[Fragments API] Failed to create new sandbox:`, newSandboxError);
                }
            }

            console.log(`[Fragments API] Updating database for fragment: ${params.fragmentId}`)
            const updatedFragment = await db.codeFragment.update({
                where: { id: params.fragmentId },
                data: {
                    files: updatedFiles,
                    sandboxId: currentSandboxId,
                    ...(currentSandboxUrl ? { sandboxUrl: currentSandboxUrl } : {}),
                }
            })

            console.log(`[Fragments API] Success`)
            return updatedFragment
        } catch (error) {
            console.error(`[Fragments API] Error patching fragment:`, error)
            return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
        }
    }, {
    body: t.Object({
        files: t.Record(t.String(), t.String()),
        projectId: t.String({ minLength: 3 }),
        sandboxId: t.Optional(t.String()),
    })
}
).get("/", async ({ query }) => {
    try {
        const { projectId } = query
        console.log(`[Fragments API] Getting latest fragment for project: ${projectId}`)

        const fragment = await db.codeFragment.findFirst({
            where: {
                message: {
                    projectId: projectId
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                files: true,
                sandboxId: true,
                sandboxUrl: true,
            }
        })

        if (!fragment) {
            console.log(`[Fragments API] Fragment not found for project: ${projectId}`)
            return new Response("Fragment not found", { status: 404 })
        }

        console.log(`[Fragments API] Success`)
        return fragment
    } catch (error) {
        console.error(`[Fragments API] Error getting fragment:`, error)
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
    }
}, {
    query: t.Object({
        projectId: t.String()
    })
})
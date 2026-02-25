import Elysia from "elysia";
import { z } from "zod"
import { db } from "@/lib/db"
import { getSandbox, toProjectPath } from "@/lib/sandbox";
import { clerkPlugin } from "elysia-clerk";
import { auth } from "@clerk/nextjs/server";

export const fragments = new Elysia({ prefix: '/fragments' })
    .patch("/:fragmentId", async ({ body, params, set }) => {
        const { userId } = await auth()

        if (!userId) {
            set.status = 401
            return { error: "Unauthorized" }
        }
        const existingFragment = await db.codeFragment.findUnique({
            where: {
                id: params.fragmentId
            }, include: {
                message: {
                    select: {
                        projectId: true,
                        project: {
                            select: {
                                userId: true
                            }
                        }
                    }
                }
            }
        })
        if (!existingFragment) {
            set.status = 404
            return { error: "Fragment not found" }
        }

        if (existingFragment.userId !== userId) {
            set.status = 403
            return { error: "Forbidden: You don't have permission to edit this fragment" }
        }

        const sandboxId = existingFragment.sandboxId || body.sandboxId

        if (!sandboxId) {
            throw new Error("Sandbox id is required")
        }

        const sandbox = await getSandbox(sandboxId)

        const entries = Object.entries(body.files)

        for (const [path, content] of entries) {
            const fullPath = toProjectPath(path)
            await sandbox.files.write(fullPath, content)
        }

        const updatedFiles = {
            ...(existingFragment.files as Record<string, string>),
            ...body.files
        }

        const updatedFragment = await db.codeFragment.update({
            where: {
                id: params.fragmentId
            },
            data: {
                files: updatedFiles
            }
        })

        return updatedFragment

    }, {
        body: z.object({
            files: z.record(z.string(), z.string()),
            projectId: z.string().min(3, 'project id is required'),
            sandboxId: z.string().optional()
        }),
        params: z.object({
            fragmentId: z.string().min(3, 'fragment id is required')
        })
    })
    .get("/", async ({ query, set }) => {
        const { userId } = await auth()

        if (!userId) {
            set.status = 401
            return { error: "Unauthorized" }
        }

        const project = await db.project.findFirst({
            where: {
                id: query.projectId,
                userId: userId
            }
        })

        if (!project) {
            set.status = 403
            return { error: "Forbidden: You don't have access to this project" }
        }

        const fragment = await db.codeFragment.findFirst({
            where: {
                userId: userId,
                message: {
                    projectId: query.projectId
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                files: true,
                sandboxId: true,
                sandboxUrl: true,
            }
        })
        return fragment
    }, {
        query: z.object({
            projectId: z.string().min(3, 'project id is required')
        })
    })
    .get("/:fragmentId", async ({ params, set }) => {
        const { userId } = await auth()

        if (!userId) {
            set.status = 401
            return { error: "Unauthorized" }
        }
        const fragment = await db.codeFragment.findUnique({
            where: {
                id: params.fragmentId
            },
            include: {
                message: {
                    include: {
                        project: true
                    }
                }
            }
        })
        if (!fragment) {
            set.status = 404
            return { error: "Fragment not found" }
        }

        if (fragment.userId !== userId) {
            set.status = 403
            return { error: "Forbidden: You don't have access to this fragment" }
        }
        return fragment
    }, {
        params: z.object({
            fragmentId: z.string().min(3, 'fragment id is required')
        })
    })
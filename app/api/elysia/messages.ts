import Elysia, { t } from "elysia";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkPlugin } from "elysia-clerk";

export const messages = new Elysia({ prefix: '/messages' })
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

        const messages = await db.message.findMany({
            where: {
                projectId: query.projectId,
                userId: userId
            },
            orderBy: { createdAt: "asc" },
            include: {
                codeFragment: true
            }
        })
        return messages
    }, {
        query: t.Object({
            projectId: t.String({ minLength: 1, maxLength: 100 })
        })
    })
    .post("/", async ({ body, set }) => {
        try {
            const { userId } = await auth()

            if (!userId) {
                set.status = 401
                return { error: "Unauthorized" }
            }

            // Verify project ownership before allowing message creation
            const project = await db.project.findFirst({
                where: {
                    id: body.projectId,
                    userId: userId
                }
            })

            if (!project) {
                set.status = 403
                return { error: "Forbidden: You cannot post to this project" }
            }
            console.log('[Messages API] Creating message:', { body })
            const Createdmessage = await db.message.create({
                data: {
                    content: body.message,
                    role: "USER",
                    type: "RESULT",
                    projectId: body.projectId,
                    userId: userId
                }
            })
            console.log('[Messages API] Message created:', Createdmessage.id)
            await inngest.send({
                name: "code-agent/codeAgent.run",
                data: {
                    projectId: body.projectId,
                    message: Createdmessage.content,
                    userId: userId
                }
            })
            return Createdmessage
        } catch (error: any) {
            console.error('[Messages API] Error posting message:', error)
            set.status = 500
            return { error: error.message || "Failed to post message" }
        }
    }, {
        body: t.Object({
            message: t.String({ minLength: 1 }),
            projectId: t.String({ minLength: 1 })
        })
    });
import Elysia, { t } from "elysia";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";

export const messages = new Elysia({ prefix: '/messages' })
    .get("/", async ({ query }) => {
        const messages = await db.message.findMany({
            where: { projectId: query.projectId },
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
    .post("/", async ({ body }) => {
        console.log('[Messages API] Creating message:', { body })
        const Createdmessage = await db.message.create({
            data: {
                content: body.message,
                role: "USER",
                type: "RESULT",
                projectId: body.projectId
            }
        })
        console.log('[Messages API] Message created:', Createdmessage.id)
        await inngest.send({
            name: "code-agent/codeAgent.run",
            data: {
                projectId: body.projectId,
                message: Createdmessage.content
            }
        })
        return Createdmessage
    }, {
        body: t.Object({
            message: t.String({ minLength: 3, maxLength: 1000 }),
            projectId: t.String({ minLength: 1 })
        })
    });
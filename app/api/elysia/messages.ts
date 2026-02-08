import Elysia, { t } from "elysia";
import { inngest } from "@/inngest/client";
import z from "zod";
export const messages = new Elysia({ prefix: '/messages' })
    .get("/", async () => {})
    .post("/", async ({ body }) => {
        await inngest.send({
            name: "code-agent/codeAgent.run",
            data: {
                message: body.message
            }
        })
    }, {
        body:z.object({
            message: z.string().min(3, "Message must be at least 3 characters long").max(1000, "Message must be at most 1000 characters long")
        })
    });
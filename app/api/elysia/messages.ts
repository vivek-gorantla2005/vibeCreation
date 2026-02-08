import Elysia, { t } from "elysia";

export const messages = new Elysia({ prefix: '/messages' })
    .get("/", () => {
        return "Hello World";
    })
    .post("/", ({ body }) => {
        console.log("Received message:", body);
        return { success: true };
    }, {
        body: t.Object({
            projectId: t.String(),
            content: t.String(),
            image: t.Optional(t.String())
        })
    });
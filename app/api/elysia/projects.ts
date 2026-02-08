import Elysia, { t } from "elysia";

export const projects = new Elysia({ prefix: '/projects' }).post("/", () => {
    return { id: Math.random().toString(36).substring(7) };
});
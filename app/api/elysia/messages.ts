import Elysia from "elysia";

export const messages = new Elysia({prefix:'/messages'}).get("/", () => {
    return "Hello World";
});
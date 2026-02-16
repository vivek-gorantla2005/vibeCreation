import Elysia, { t } from "elysia";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";

export const projects = new Elysia({ prefix: '/projects' }).post(
    "/",
    async ({ body }) => {
        console.log('[Projects API] Creating project:', { body })
        const createdProject = await db.project.create({
            data: {
                name: `Project-${Date.now()}`,
                messages: {
                    create: {
                        content: body.message,
                        role: "USER",
                        type: "RESULT"
                    }
                }
            },
            include: {
                messages: true
            }
        })
        console.log('[Projects API] Project created:', createdProject.id)


        await inngest.send({
            name: "code-agent/codeAgent.run",
            data: {
                projectId: createdProject.id,
                message: body.message
            }
        })

        return createdProject
    },
    {
        body: t.Object({
            message: t.String({ minLength: 1, maxLength: 1000 })
        })
    }
).get(
    "/",
    async () => {
        console.log('[Projects API] Fetching projects')
        const projects = await db.project.findMany({
            include: {
                messages: true
            }
        })
        console.log('[Projects API] Found projects:', projects.length)
        return projects
    }
);
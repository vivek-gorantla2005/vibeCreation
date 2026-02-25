import Elysia, { t } from "elysia";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
export const projects = new Elysia({ prefix: '/projects' }).post(
    "/",
    async ({ body, set }) => {
        try {
            const { userId } = await auth()

            if (!userId) {
                set.status = 401
                return { error: "Unauthorized" }
            }
            console.log('[Projects API] Creating project for user:', userId, { body })
            const createdProject = await db.project.create({
                data: {
                    name: `Project-${Date.now()}`,
                    userId: userId,
                    messages: {
                        create: {
                            content: body.message,
                            role: "USER",
                            type: "RESULT",
                            userId: userId
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
                    message: body.message,
                    userId: userId
                }
            })

            return createdProject
        } catch (error: any) {
            console.error('[Projects API] Error creating project:', error)
            set.status = 500
            return { error: error.message || "Failed to create project" }
        }
    },
    {
        body: t.Object({
            message: t.String({ minLength: 1 })
        })
    }
).get(
    "/",
    async ({ set }) => {
        const { userId } = await auth()

        if (!userId) {
            set.status = 401
            return { error: "Unauthorized" }
        }

        console.log('[Projects API] Fetching projects for user:', userId)
        const projects = await db.project.findMany({
            where: {
                userId: userId
            },
            include: {
                messages: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        console.log('[Projects API] Found projects:', projects.length)
        return projects
    }
);
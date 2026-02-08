import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
import Sandbox from "@e2b/code-interpreter"
import { getSandbox } from "@/lib/sandbox";
export const codeAgent = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/codeAgent.run" },
    async ({ event, step }) => {
        const sandboxId = await step.run('get-or-create-sandbox',async()=>{
            const {sandboxId} = await Sandbox.create("23eg105j66/vibecreation-v1")
            return sandboxId
        })
        const summarizerAgent = createAgent({
            name: 'Summarizer',
            description: 'You Summarize long professional docs',
            system:
                `
                You are a professional summarizer. 
                You only provide summaries of long professional documents in one line.
                `,
            model: gemini({
                model:'gemini-2.0-flash-lite'
            }),
        });

        const {output} = await summarizerAgent.run(`summarize the below text: ${event.data.message}`)

        const sandboxUrl = await step.run('get-sandbox-url',async()=>{
            const sandbox = await getSandbox(sandboxId)
            const host = sandbox.getHost(3000)
            return `https://${host}`
        })
        return {output,sandboxUrl}
    },
);
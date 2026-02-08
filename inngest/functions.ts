import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
export const codeAgent = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/codeAgent.run" },
    async ({ event, step }) => {
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
        return {output}
    },
);
import {
    GoogleGenerativeAI,
    SchemaType,
} from "@google/generative-ai";
import { DESIGN_PROMPT } from "@/inngest/prompt";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const DesignSpecSchema = z.object({
    meta: z.object({
        title: z.string(),
        mode: z.enum(["match_layout", "modernize"]),
        uncertainties: z.array(z.string()),
    }),
    theme: z.object({
        primaryColorHex: z.string().nullable(),
        backgroundColorHex: z.string().nullable(),
        textColorHex: z.string().nullable(),
        radius: z.enum(["sm", "md", "lg", "xl"]),
        fontStyle: z.enum(["modern_sans", "classic_sans", "serif"]).nullable(),
    }),
    pages: z.array(
        z.object({
            route: z.string(),
            sections: z.array(
                z.object({
                    type: z.string(),
                    layout: z.object({
                        container: z.enum(["sm", "md", "lg"]),
                        columns: z.number().int().min(1).max(6),
                        align: z.enum(["left", "center"]),
                    }),
                    content: z.object({
                        heading: z.string().nullable(),
                        subheading: z.string().nullable(),
                        body: z.string().nullable(),
                        buttons: z.array(
                            z.object({
                                label: z.string(),
                                variant: z.enum(["default", "outline", "secondary"]),
                            })
                        ),
                        items: z.array(
                            z.object({
                                title: z.string().nullable(),
                                description: z.string().nullable(),
                            })
                        ),
                    }),
                    media: z.array(
                        z.object({
                            kind: z.literal("image_placeholder"),
                            aspect: z.enum(["square", "video", "wide"]),
                            alt: z.string().nullable(),
                        })
                    ),
                })
            ),
        })
    ),
});

export async function extractDesignSpec(params: { imageUrl: string, userHint: string | null }) {
    const { imageUrl, userHint } = params;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    try {
        const imageResp = await fetch(imageUrl);
        const imageBuffer = await imageResp.arrayBuffer();

        const promptParts = [
            { text: DESIGN_PROMPT },
            { text: userHint ?? "Extract the design specification from this image." },
            {
                inlineData: {
                    mimeType: "image/png",
                    data: Buffer.from(imageBuffer).toString("base64"),
                },
            },
        ];

        const result = await model.generateContent(promptParts);
        const textResponse = result.response.text();

        const rawJson = JSON.parse(textResponse);
        const validatedData = DesignSpecSchema.parse(rawJson);

        console.log("Successfully validated design spec:", validatedData.meta.title);

        return validatedData;

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Schema validation failed:", error);
        } else {
            console.error("AI Generation failed:", error);
        }
        throw error;
    }
}
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    const { text } = await req.json();

    // Create a response using the new Responses API
    const response = await client.responses.create({
        model: "gpt-4.1-mini", // smaller, faster model for parsing
        input: `Parse this baby naming request into JSON with keys:
            gender, syllables, deity, sources[], startLetters[], vibe:
            ${text}`,
    });

    // Extract plain text from the response
    const content = response.output_text ?? "";

    // Try to parse JSON from the model output safely
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch {
        parsed = { rawText: content };
    }

    return NextResponse.json(parsed);
}

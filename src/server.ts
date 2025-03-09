import * as utils from "./utils.ts";
import OpenAI from "@openai/openai";

export async function handler(
    req: Request,
    fakeModel: ModelInfo,
    openai: OpenAI,
    model: string,
): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/") {
        return new Response("Ollama is running", {
            headers: { "Content-Type": "text/plain" }
        });
    }

    if (req.method === "GET" && url.pathname === "/api/tags") {
        return new Response(JSON.stringify({ models: [fakeModel] }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
        const body = await req.json() as OpenAIRequest;

        const stream = await openai.chat.completions.create({
            model: "o3-mini-2025-01-31",
            messages: body.messages.map(msg => ({
                role: msg.role as "user" | "assistant" | "system",
                content: Array.isArray(msg.content)
                    ? msg.content.map(c => c.text).join(" ")
                    : msg.content
            })),
            stream: true
        });

        return new Response(utils.transformToOllamaFormat(stream, model), {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        });
    }

    return new Response("Method not allowed", { status: 405 });
}

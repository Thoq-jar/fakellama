import { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import OpenAI from "openai";
import { Stream } from "openai/streaming";
import {AIRequest, ModelInfo, Models} from "../interface";
import {transformOAIToOllamaFormat} from "../utils";

export async function handler(
    req: IncomingMessage,
    res: ServerResponse,
    fakeModel: ModelInfo,
    openai: OpenAI,
    modelName: string,
    modelId: Models,
    reason: boolean,
    reasoningEffort: OpenAI.Chat.Completions.ChatCompletionReasoningEffort,
): Promise<void> {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    console.log(`${req.method} ${url.pathname}`);

    if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Ollama is running");
        return;
    }

    if (req.method === "POST" && url.pathname === "/api/show") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(fakeModel));
        return;
    }

    if (req.method === "GET" && url.pathname === "/api/tags") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ models: [fakeModel] }));
        return;
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
        try {
            const body = await getJSONBody<AIRequest>(req);
            let stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;

            const messages = body.messages.map((msg) => ({
                role: msg.role,
                content: Array.isArray(msg.content)
                    ? msg.content.map((c) => c.text).join(" ")
                    : msg.content,
            })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];


            if (reason) {
                stream = await openai.chat.completions.create({
                    model: modelId,
                    messages,
                    reasoning_effort: reasoningEffort,
                    stream: true,
                });
            } else {
                stream = await openai.chat.completions.create({
                    model: modelId,
                    messages,
                    stream: true,
                });
            }

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            });

            const transformedStream = transformOAIToOllamaFormat(stream, modelName);
            for await (const chunk of transformedStream) {
                res.write(chunk);
            }
            res.end();

        } catch (error) {
            console.error("Error handling /api/chat:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
        return;
    }

    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method not allowed");
}

function getJSONBody<T>(req: IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", (err) => {
            reject(err);
        });
    });
}
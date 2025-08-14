import { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import { genAI } from "../main";
import {
    AIRequest,
    ModelInfo,
} from "../interface";

async function getBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on("error", (err) => {
            reject(err);
        });
    });
}

function isAIRequest(body: unknown): body is AIRequest {
    if (typeof body !== 'object' || body === null) {
        return false;
    }
    const req = body as Record<string, unknown>;
    return 'messages' in req && Array.isArray(req.messages) && req.messages.every(msg => {
        if (typeof msg !== 'object' || msg === null) return false;
        const message = msg as Record<string, unknown>;
        const hasRole = 'role' in message && typeof message.role === 'string';
        const hasContent = 'content' in message;
        if (!hasRole || !hasContent) return false;

        const content = message.content;
        if (typeof content === 'string') {
            return true;
        } else if (Array.isArray(content)) {
            return content.every(c => typeof c === 'object' && c !== null && 'text' in c && typeof c.text === 'string');
        }
        return false;
    });
}

export async function handler(
    req: IncomingMessage,
    res: ServerResponse,
    fakeModel: ModelInfo,
    modelName: string,
    modelId: string,
): Promise<void> {
    const url = new URL(req.url!, `http://${req.headers.host}`);
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
            const body = await getBody(req);

            if (!isAIRequest(body)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid request body format." }));
                return;
            }

            const chatHistory = body.messages.map(msg => ({
                role: msg.role,
                parts: [{
                    text: typeof msg.content === 'string' ? msg.content :
                        (msg.content as { text: string }[]).map(c => c.text).join(" ")
                }]
            }));

            const model = genAI.getGenerativeModel({ model: modelId });

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            });

            try {
                const result = await model.generateContent({
                    contents: chatHistory,
                });

                const response = result.response;
                const text = response.text();

                if (text) {
                    const ollamaChunk = {
                        model: modelName,
                        created_at: new Date().toISOString(),
                        message: {
                            role: "model",
                            content: text,
                        },
                        done: false,
                    };
                    res.write(JSON.stringify(ollamaChunk) + "\n");
                }

                const final = {
                    model: modelName,
                    created_at: new Date().toISOString(),
                    message: { role: "model", content: "" },
                    done_reason: "stop",
                    done: true,
                    total_duration: 0,
                    load_duration: 0,
                    prompt_eval_count: 0,
                    prompt_eval_duration: 0,
                    eval_count: 0,
                    eval_duration: 0,
                };
                res.write(JSON.stringify(final) + "\n");
                res.end();
            } catch (error) {
                console.error("Error generating content:", error);
                if (res.writableEnded) return;
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error occurred"
                }));
            }
        } catch (error) {
            console.error("Handler error:", error);
            if (res.writableEnded) return;
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error occurred"
            }));
        }
    } else {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method not allowed");
    }
}

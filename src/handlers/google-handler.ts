import { ModelInfo, AIRequest } from "../interface.ts";
import { genAI } from "../main.ts";

export async function handler(
    req: Request,
    fakeModel: ModelInfo,
    modelName: string,
    modelId: string,
): Promise<Response> {
    const url = new URL(req.url);
    console.log(`${req.method} ${url.pathname}`);

    if (req.method === "GET" && url.pathname === "/") {
        return new Response("Ollama is running", {
            headers: { "Content-Type": "text/plain" },
        });
    }

    if (req.method === "POST" && url.pathname === "/api/show") {
        return new Response(JSON.stringify(fakeModel), {
            headers: { "Content-Type": "application/json" },
        });
    }

    if (req.method === "GET" && url.pathname === "/api/tags") {
        return new Response(JSON.stringify({ models: [fakeModel] }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
        try {
            const body = await req.json() as AIRequest;

            const chatHistory = body.messages.map(msg => ({
                role: msg.role,
                parts: [{ text: typeof msg.content === 'string' ? msg.content :
                        msg.content.map(c => c.text).join(" ") }]
            }));

            const model = genAI.getGenerativeModel({ model: modelId });

            const stream = new ReadableStream({
                async start(controller) {
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
                                    role: "assistant",
                                    content: text,
                                },
                                done: false,
                            };
                            controller.enqueue(new TextEncoder().encode(JSON.stringify(ollamaChunk) + "\n"));
                        }

                        const final = {
                            model: modelName,
                            created_at: new Date().toISOString(),
                            message: { role: "assistant", content: "" },
                            done_reason: "stop",
                            done: true,
                            total_duration: 0,
                            load_duration: 0,
                            prompt_eval_count: 0,
                            prompt_eval_duration: 0,
                            eval_count: 0,
                            eval_duration: 0,
                        };
                        controller.enqueue(new TextEncoder().encode(JSON.stringify(final) + "\n"));
                        controller.close();
                    } catch (error) {
                        console.error("Error generating content:", error);

                        const errorFinal = {
                            model: modelName,
                            created_at: new Date().toISOString(),
                            message: {
                                role: "assistant",
                                content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
                            },
                            done_reason: "error",
                            done: true,
                            total_duration: 0,
                            load_duration: 0,
                            prompt_eval_count: 0,
                            prompt_eval_duration: 0,
                            eval_count: 0,
                            eval_duration: 0,
                        };
                        controller.enqueue(new TextEncoder()
                            .encode(JSON.stringify(errorFinal) + "\n")
                        );
                        controller.close();
                    }
                }
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        } catch (error) {
            console.error("Handler error:", error);
            if (error instanceof Error) {
                return new Response(JSON.stringify({
                    error: error.message || "Unknown error occurred"
                }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                return new Response(JSON.stringify({
                    error: "Unknown error occurred"
                }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }
    }

    return new Response("Method not allowed", { status: 405 });
}

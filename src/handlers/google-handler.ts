import * as utils from "../utils.ts";
import { ModelInfo, AIRequest } from "../interface.ts";
import { genAI } from "../main.ts";

export async function handler(
  req: Request,
  fakeModel: ModelInfo,
  modelName: string,
  modelId: string,
): Promise<Response> {
  const url = new URL(req.url);
  console.log(`${req.method} ${req.url}`);

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
    const body = await req.json() as AIRequest;
    
    const messages = body.messages.map(msg => {
        if (Array.isArray(msg.content)) {
            return msg.content.map(c => c.text).join(" ");
        }
        return msg.content;
    }).join("\n");

    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(messages);
    const response = await result.response;
    const stream = response.text();

    return new Response(utils.transformGoogleToOllamaFormat(stream, modelName), {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

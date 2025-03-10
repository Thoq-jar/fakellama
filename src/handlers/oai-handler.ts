import * as utils from "../utils.ts";
import OpenAI from "@openai/openai";
import { ModelInfo, Models, AIRequest } from "../interface.ts";

export async function handler(
  req: Request,
  fakeModel: ModelInfo,
  openai: OpenAI,
  modelName: string,
  modelId: Models,
  reason: boolean,
  reasoningEffort: OpenAI.ChatCompletionReasoningEffort,
): Promise<Response> {
  const url = new URL(req.url);
  console.log(`${req.method} ${req.url}`);

  if (req.method === "GET" && url.pathname === "/") {
    return new Response("Ollama is running", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (req.method === "POST" && url.pathname === '/api/show') {
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
    let stream;

    if(reason) {
      stream = await openai.chat.completions.create({
        model: modelId,
        messages: body.messages.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: Array.isArray(msg.content)
              ? msg.content.map((c) => c.text).join(" ")
              : msg.content,
        })),
        reasoning_effort: reasoningEffort,
        stream: true,
      });
    } else {
      stream = await openai.chat.completions.create({
        model: modelId,
        messages: body.messages.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: Array.isArray(msg.content)
              ? msg.content.map((c) => c.text).join(" ")
              : msg.content,
        })),
        stream: true,
      });
    }

    return new Response(utils.transformOAIToOllamaFormat(stream, modelName), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

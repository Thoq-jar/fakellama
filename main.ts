import OpenAI from "@openai/openai";

interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: string;
    content: Array<{ type: string; text: string }> | string;
  }>;
  response_format?: {
    type: string;
  };
  reasoning_effort?: string;
}

interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

interface ModelInfo {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

interface TagsResponse {
  models: ModelInfo[];
}

const fakeModel: ModelInfo = {
  name: "o3-mini-high",
  model: "o3-mini-high",
  modified_at: new Date().toISOString(),
  size: 4920753328,
  digest: "46e0c10c039e019119339687c3c1757cc81b9da49709a3b3924863ba87ca666e",
  details: {
    parent_model: "",
    format: "gguf",
    family: "o3",
    families: ["o3"],
    parameter_size: "7B",
    quantization_level: "Q4_K_M"
  }
};

const openai = new OpenAI({
  apiKey: Deno.env.get("SK_FAKELLAMA_API_KEY"),
  baseURL: "https://api.openai.com/v1"
});

async function* transformToOllamaFormat(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      const ollamaChunk = {
        model: "o3-mini-high",
        created_at: new Date().toISOString(),
        message: {
          role: "assistant",
          content
        },
        done: false
      };
      yield new TextEncoder().encode(JSON.stringify(ollamaChunk) + "\n");
    }
  }

  const final = {
    model: "o3-mini-high",
    created_at: new Date().toISOString(),
    message: { role: "assistant", content: "" },
    done_reason: "stop",
    done: true,
    total_duration: 0,
    load_duration: 0,
    prompt_eval_count: 0,
    prompt_eval_duration: 0,
    eval_count: 0,
    eval_duration: 0
  };
  yield new TextEncoder().encode(JSON.stringify(final) + "\n");
}

async function handler(req: Request, _info: Deno.ServeHandlerInfo): Promise<Response> {
  const url = new URL(req.url);

  // Root endpoint for status check
  if (req.method === "GET" && url.pathname === "/") {
    return new Response("Ollama is running", {
      headers: { "Content-Type": "text/plain" }
    });
  }

  // Models listing endpoint
  if (req.method === "GET" && url.pathname === "/api/tags") {
    return new Response(JSON.stringify({ models: [fakeModel] }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Chat completion endpoint
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

    return new Response(transformToOllamaFormat(stream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

Deno.serve({ port: 9595 }, handler);

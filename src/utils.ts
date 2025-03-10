import OpenAI from "@openai/openai";
import { GenerateContentResponse } from "@google/generative-ai";

async function* transformOAIToOllamaFormat(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  model: string,
) {
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      const ollamaChunk = {
        model: model,
        created_at: new Date().toISOString(),
        message: {
          role: "assistant",
          content,
        },
        done: false,
      };
      yield new TextEncoder().encode(JSON.stringify(ollamaChunk) + "\n");
    }
  }

  const final = {
    model,
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
  yield new TextEncoder().encode(JSON.stringify(final) + "\n");
}

async function* transformGoogleToOllamaFormat(
  response: GenerateContentResponse,
  model: string,
) {
  if( !response.candidates || response.candidates.length === 0) {
    console.log("Error: No candidates found in the response.");
    return;
  }

  const content = response.candidates[0]?.content?.parts || "";
  
  const chunks = [content];
  
  for (const chunk of chunks) {
    if (chunk) {
      const ollamaChunk = {
        model: model,
        created_at: new Date().toISOString(),
        message: {
          role: "assistant",
          content: chunk,
        },
        done: false,
      };
      yield new TextEncoder().encode(JSON.stringify(ollamaChunk) + "\n");
    }
  }

  const final = {
    model,
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
  yield new TextEncoder().encode(JSON.stringify(final) + "\n");
}

export { transformOAIToOllamaFormat, transformGoogleToOllamaFormat };

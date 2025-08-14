import OpenAI from "openai";
import {Models, ReasoningEffort} from "./interface";

function toReasoningEffort(reasoningEffort: string): ReasoningEffort {
    switch(reasoningEffort) {
        case "high":
            return "high";
        case "medium":
            return "medium";
        case "low":
            return "low";
        case "minimal":
            return "low"
        default:
            return null;
    }
}

function toModel(model: string): Models {
    return model as Models;
}

async function* transformOAIToOllamaFormat(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    model: string,
) {
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if(content) {
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
        message: {role: "assistant", content: ""},
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

export {
    transformOAIToOllamaFormat,
    toReasoningEffort,
    toModel,
};

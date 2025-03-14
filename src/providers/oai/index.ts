import OpenAI from "@openai/openai";
import * as oaiHandler from '../../handlers/oai-handler.ts';
import {Models, Providers} from "../../interface.ts";
import {configure, hostname, openai, port} from "../../main.ts";

export function oaiProvider(
    model: Models,
    provider: Providers,
    reasoningEffortArg: OpenAI.ChatCompletionReasoningEffort,
) {
    let modelName: string = model;
    let reasoningEffort: string = "medium";
    let reason: boolean = false;
    if (model == "o3-mini") {
        reason = true;
    }

    switch (reasoningEffortArg) {
        case "high": {
            reasoningEffort = "High";
            break;
        }
        case "medium": {
            reasoningEffort = "Medium";
            break;
        }
        case "low": {
            reasoningEffort = "Low";
            break;
        }
    }

    switch (model) {
        case "o3-mini": {
            modelName = `o3 Mini (${reasoningEffort})`;
            break;
        }
        case "gpt-4o": {
            modelName = "GPT-4o";
            break;
        }
        case "gpt-4o-mini": {
            modelName = "GPT-4o Mini";
            break;
        }
        case "gpt-3.5-turbo": {
            modelName = "GPT-3.5 Turbo";
            break;
        }
        case "chatgpt-4o-latest": {
            modelName = "GPT-4o (Latest)";
            break;
        }
    }

    const fakeModel = configure(provider, modelName);

    Deno.serve(
        {
            hostname: hostname,
            port: port,
            onListen: () => console.log(`Fakellama is running @ :${port}`),
        },
        (req: Request) =>
            oaiHandler.handler(
                req,
                fakeModel,
                openai,
                modelName,
                model,
                reason,
                reasoningEffortArg,
            ),
    );
}

export { oaiHandler };

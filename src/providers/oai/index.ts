import OpenAI from "@openai/openai";
import * as oaiHandler from '../../handlers/oai-handler.ts';
import {Providers} from "../../interface.ts";
import {configure, hostname, openai, port} from "../../main.ts";

export function oaiProvider(
    model: OpenAI.ChatModel,
    provider: Providers,
    reasoningEffortArg: OpenAI.ChatCompletionReasoningEffort,
) {
    let modelName: string = model;
    let reasoningEffort: string = "medium";
    let reason: boolean = false;
    if (model == "o3-mini" || "o1" || "o1-mini") {
        reason = true;
    }

    if (model === "o3-mini" && !reasoningEffortArg) {
        console.log("Please specify a reasoning effort.");
        console.log("Usage: fakellama openai o3-mini [high|medium|low]");
        Deno.exit(1);
    }

    if (model != "o1" && reasoningEffortArg) {
        console.warn("This model doesnt support reasoning effort!");
        console.warn("Ignoring...");
    } else if (model != "o1-mini" && reasoningEffortArg) {
        console.warn("This model doesnt support reasoning effort!");
        console.warn("Ignoring...");
    } else if (model != "o3-mini" && reasoningEffortArg) {
        console.warn("This model doesnt support reasoning effort!");
        console.warn("Ignoring...");
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

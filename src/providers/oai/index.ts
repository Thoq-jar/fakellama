import http from "http";
import * as oai from '../../handlers/oai-handler';
import { configure, hostname, openai, port } from "../../main";
import {toModel, toReasoningEffort} from "../../utils";

export function oaiProvider(
    model: string,
    provider: string,
    reasoningEffortArg: string,
) {
    let modelName = model;
    let reasoningEffort = "medium";
    let reason = false;
    if (model === "o3-mini") {
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
        case "chatgpt-4o-latest": {
            modelName = "GPT-4o (Latest)";
            break;
        }
    }

    const fakeModel = configure(provider, modelName);

    const server = http.createServer((req, res) => {
        oai.handler(
            req,
            res,
            fakeModel,
            openai,
            modelName,
            toModel(model),
            reason,
            toReasoningEffort(reasoningEffortArg),
        ).then();
    });

    server.listen(port, hostname, () => {
        console.log(`Fakellama is running @ :${port}`);
    });
}

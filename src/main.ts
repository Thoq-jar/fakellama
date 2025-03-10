import OpenAI from "@openai/openai";
import * as oai from "./handlers/oai-handler.ts";
import { ModelInfo, Models, Providers } from "./interface.ts";
import { LLAMA_ART } from "./ascii-art.ts";

const port = 9595;
const hostname = "127.0.0.1";

const openai = new OpenAI({
  apiKey: Deno.env.get("SK_FAKELLAMA_API_KEY"),
  baseURL: "https://api.openai.com/v1",
});

function configure(provider: Providers, model: string) {
  switch (provider) {
    case "openai": {
      const fakeModel: ModelInfo = {
        name: model,
        model: model,
        modified_at: new Date().toISOString(),
        size: 4920753328,
        digest:
          "46e0c10c039e019119339687c3c1757cc81b9da49709a3b3924863ba87ca666e",
        details: {
          parent_model: "",
          format: "gguf",
          family: "OpenAI",
          families: ["OpenAI"],
          parameter_size: "32B",
          quantization_level: "Q4_K_M",
        },
      };

      return fakeModel;
    }
  }
}

const officiallySupportedModels: { [provider in Providers]: Models[] } = {
  openai: [
    "o3-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "chatgpt-4o-latest",
  ],
};

function printAvailableModels() {
  console.log(
    "The following models are going to be properly named, " +
      "any other model will work but the name will just be the id of model.",
  );
  console.log("Officially supported models and providers:");
  for (const provider in officiallySupportedModels) {
    console.log(`Provider: ${provider}`);
    officiallySupportedModels[provider as Providers].forEach((model) => {
      console.log(`  Model: ${model}`);
    });
  }
}

function main(args: string[]) {
  if (args.length < 2) {
    console.log("Usage: fakellama [provider] [model]");
    printAvailableModels();
    Deno.exit(1);
  }

  const provider: Providers = args[0] as Providers;
  const model: Models = args[1] as Models;
  const reasoningEffortArg = args[2] as OpenAI.ChatCompletionReasoningEffort;

  console.log(LLAMA_ART);
  console.log("Welcome to Fakellama v1!");
  console.log("Press Ctrl+C to quit.");

  let modelName: string = "Unknown";
  let reasoningEffort = "medium";
  let reason: boolean = false;

  if (model === "o3-mini" && !reasoningEffortArg) {
    console.log("Please specify a reasoning effort.");
    console.log("Usage: fakellama openai o3-mini [high|medium|low]");
    Deno.exit(1);
  }

  if (model != "o3-mini" && reasoningEffortArg) {
    console.warn("This model doesnt support reasoning effort!");
    console.warn("Ignoring...");
  }

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

  switch (provider) {
    case "openai": {
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
          oai.handler(
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
  }
}

main(Deno.args);

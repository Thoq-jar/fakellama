import OpenAI from "@openai/openai";
import * as oai from "./providers/oai/index.ts";
import { ModelInfo, Models, Providers } from "./interface.ts";
import { LLAMA_ART } from "./ascii-art.ts";

export const port = 9595;
export const hostname = "127.0.0.1";

export const openai = new OpenAI({
  apiKey: Deno.env.get("SK_FAKELLAMA_API_KEY"),
  baseURL: "https://api.openai.com/v1",
});

export function configure(provider: Providers, model: string) {
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
    officiallySupportedModels[provider as Providers]
      .forEach((model) => {
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

  switch (provider) {
    case "openai": {
      oai.oaiProvider(model, provider, reasoningEffortArg);
      break;
    }
  }
}

main(Deno.args);

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as oai from "./providers/oai/index";
import * as google from "./providers/google/index";
import { ModelInfo, Models, Providers } from "./interface";
import { LLAMA_ART } from "./ascii-art";

export const port = 9595;
export const hostname = "127.0.0.1";
const API_KEY = process.env.SK_FAKELLAMA_API_KEY || ""
export const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://api.openai.com/v1",
});
export const genAI = new GoogleGenerativeAI(API_KEY);

export function configure(provider: string, model: string) {
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

    case "google": {
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
          family: "Gemini",
          families: ["Google", "Gemini"],
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
    "chatgpt-4o-latest",
  ],
  google: [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
  ]
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

function printHelp(exit: boolean, reason?: boolean) {
  console.log(`Usage: fakellama [provider] [model] ${reason ? '[low|medium|high]' : ""}`);
  printAvailableModels();
  if (exit) process.exit(1);
}

function main(args: string[]) {
  args = args.slice(2);
  console.log(args);

  if (args.length < 2) {
    printHelp(true);
  }

  const provider: Providers = args[0] as Providers;
  const model: Models = args[1] as Models;
  const reasoningEffortArg = args[2] as OpenAI.ChatCompletionReasoningEffort;

  if (!provider) printHelp(true);
  if (!model) printHelp(true);

  console.log(LLAMA_ART);
  console.log("Welcome to Fakellama v1!");
  console.log("Press Ctrl+C to quit.");

  switch (provider) {
    case "openai": {
      console.log(`Using ${model} ${reasoningEffortArg ? `${reasoningEffortArg}` : ""}`);
      oai.oaiProvider(model, provider, reasoningEffortArg);
      break;
    }
    case "google": {
      console.log(`Using ${model}`);
      google.googleProvider(model, provider)
    }
  }
}

main(process.argv);


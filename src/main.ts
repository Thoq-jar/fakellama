import OpenAI from "@openai/openai";
import * as serverModule from "./server.ts";
import { ModelInfo } from "./interface.ts";
import { LLAMA_ART } from "./ascii-art.ts";

const modelName = "o3 Mini (High)";
const modelId = "o3-mini-2025-01-31";
const port = 9595;
const hostname = "127.0.0.1";

const fakeModel: ModelInfo = {
  name: modelName,
  model: modelName,
  modified_at: new Date().toISOString(),
  size: 4920753328,
  digest: "46e0c10c039e019119339687c3c1757cc81b9da49709a3b3924863ba87ca666e",
  details: {
    parent_model: "",
    format: "gguf",
    family: "o3",
    families: ["o3"],
    parameter_size: "32B",
    quantization_level: "Q4_K_M",
  },
};

const openai = new OpenAI({
  apiKey: Deno.env.get("SK_FAKELLAMA_API_KEY"),
  baseURL: "https://api.openai.com/v1",
});

function main() {
  console.log(LLAMA_ART);
  console.log("Welcome to Fakellama v1!");
  console.log("Press Ctrl+C to quit.");

  // noinspection JSUnusedGlobalSymbols
  Deno.serve(
    {
      hostname: hostname,
      port: port,
      onListen: () => console.log(`Fakellama is running @ :${port}`),
    },
    (req: Request) =>
      serverModule.handler(req, fakeModel, openai, modelName, modelId),
  );
}

main();

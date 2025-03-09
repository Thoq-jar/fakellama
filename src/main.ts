import OpenAI from "@openai/openai";
import * as server from "./server.ts";

const model = "o3-mini-high";

const fakeModel: ModelInfo = {
  name: model,
  model: model,
  modified_at: new Date().toISOString(),
  size: 4920753328,
  digest: "46e0c10c039e019119339687c3c1757cc81b9da49709a3b3924863ba87ca666e",
  details: {
    parent_model: "",
    format: "gguf",
    family: "o3",
    families: ["o3"],
    parameter_size: "7B",
    quantization_level: "Q4_K_M",
  },
};

const openai = new OpenAI({
  apiKey: Deno.env.get("SK_FAKELLAMA_API_KEY"),
  baseURL: "https://api.openai.com/v1",
});

Deno.serve(
  { port: 9595 },
  (req: Request) => server.handler(req, fakeModel, openai, model),
);

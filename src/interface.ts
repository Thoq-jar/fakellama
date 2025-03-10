import OpenAI from "@openai/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIRequest {
  model: string;
  messages: Array<{
    role: string;
    content: Array<{ type: string; text: string }> | string;
  }>;
  response_format?: {
    type: string;
  };
  reasoning_effort?: string;
}

interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

interface ModelInfo {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

type Providers = "openai" | "google";
type Models = OpenAI.Chat.ChatModel | "gemini-2.0-flash";

export {
  type Models,
  type ModelDetails,
  type ModelInfo,
  type AIRequest,
  type Providers,
};

import OpenAI from "@openai/openai";

interface OpenAIRequest {
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

type Providers = "openai";
type Models = OpenAI.Chat.ChatModel;

export {
  type Models,
  type ModelDetails,
  type ModelInfo,
  type OpenAIRequest,
  type Providers,
};

export type AIModel = {
  value: string;
  label: string;
};

export type AIModelInfo = {
  description: string;
  provider: string;
};

export enum AIModels {
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  O3_MINI = "o3-mini",
  GPT_4_1 = "gpt-4.1",
  GPT_4_O = "gpt-4o",
  DEEP_SEEK_R1 = "deep-seek-r1",
  OLLAMA_MISTRAL = "ollama-mistral", 
}

export const toAIModelEnum = (value: string): AIModels | undefined => {
  return Object.values(AIModels).includes(value as AIModels)
    ? (value as AIModels)
    : undefined;
}

export enum AIProviders {
  OPEN_AI = "open-ai",
  DEEP_SEEK = "deep-seek"
}

const AIModelInfos: Record<string, AIModelInfo> = {
  [AIModels.GPT_3_5_TURBO]: {description: "gpt 3.5 turbo", provider: AIProviders.OPEN_AI},
  [AIModels.O3_MINI]: {description: "o3 mini", provider: AIProviders.OPEN_AI},
  [AIModels.GPT_4_1]: {description: "gpt 4.1", provider: AIProviders.OPEN_AI},
  [AIModels.GPT_4_O]: {description: "gpt 4o", provider: AIProviders.OPEN_AI},
  [AIModels.DEEP_SEEK_R1]: {description: "deep seek r1", provider: AIProviders.DEEP_SEEK},
}

export default AIModelInfos;

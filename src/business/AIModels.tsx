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
  DEEP_SEEK_R1 = "r1",
}

export enum AIProviders {
  OPEN_AI = "open-ai",
  DEEP_SEEK = "deep-seek"
}

const AIModelInfos: Record<string, AIModelInfo> = {
  [AIModels.GPT_3_5_TURBO]: {description: "gpt 3.5 turbo", provider: AIProviders.OPEN_AI},
  [AIModels.O3_MINI]: {description: "o3 mini", provider: AIProviders.OPEN_AI},
  [AIModels.GPT_4_1]: {description: "gpt 4.1", provider: AIProviders.OPEN_AI},
  [AIModels.DEEP_SEEK_R1]: {description: "deep seek r1", provider: AIProviders.DEEP_SEEK},
}

export default AIModelInfos;

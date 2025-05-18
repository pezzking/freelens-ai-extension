export type AIModel = {
  value: string;
  label: string;
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

export const AIModelProviders: Record<string, AIProviders> = {
  [AIModels.GPT_3_5_TURBO]: AIProviders.OPEN_AI,
  [AIModels.O3_MINI]: AIProviders.OPEN_AI,
  [AIModels.GPT_4_1]: AIProviders.OPEN_AI,
  [AIModels.DEEP_SEEK_R1]: AIProviders.DEEP_SEEK,
}

const AIModelDescriptions: Record<string, string> = {
  [AIModels.GPT_3_5_TURBO]: "gpt 3.5 turbo",
  [AIModels.O3_MINI]: "o3 mini",
  [AIModels.GPT_4_1]: "gpt 4.1",
  [AIModels.DEEP_SEEK_R1]: "deep seek r1",
}

export default AIModelDescriptions;

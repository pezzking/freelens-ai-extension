export interface AIModelInfo {
  description: string;
  provider: string;
  requiresBaseUrl?: boolean;
}

export enum AIModelsEnum {
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  O3_MINI = "o3-mini",
  GPT_4_1 = "gpt-4.1",
  GPT_4_O = "gpt-4o",
  GPT_5 = "gpt-5",
  GEMINI_2_FLASH = "gemini-2.0-flash",
  CUSTOM_OPENAI = "custom-openai",
  LMSTUDIO = "lmstudio",
  OLLAMA = "ollama",
}

export const toAIModelEnum = (value: AIModelsEnum) => {
  return Object.values(AIModelsEnum).includes(value) ? value : undefined;
};

export enum AIProviders {
  OPEN_AI = "open-ai",
  GOOGLE = "google",
  CUSTOM_OPENAI = "custom-openai",
  LMSTUDIO = "lmstudio",
  OLLAMA = "ollama",
}

export const AIModelInfos: Record<string, AIModelInfo> = {
  [AIModelsEnum.GPT_3_5_TURBO]: { description: "GPT 3.5 Turbo", provider: AIProviders.OPEN_AI },
  [AIModelsEnum.O3_MINI]: { description: "O3 Mini", provider: AIProviders.OPEN_AI },
  [AIModelsEnum.GPT_4_1]: { description: "GPT 4.1", provider: AIProviders.OPEN_AI },
  [AIModelsEnum.GPT_4_O]: { description: "GPT 4o", provider: AIProviders.OPEN_AI },
  [AIModelsEnum.GPT_5]: { description: "GPT 5", provider: AIProviders.OPEN_AI },
  [AIModelsEnum.GEMINI_2_FLASH]: { description: "Gemini 2.0 Flash", provider: AIProviders.GOOGLE },
  [AIModelsEnum.CUSTOM_OPENAI]: { description: "Custom OpenAI Endpoint", provider: AIProviders.CUSTOM_OPENAI, requiresBaseUrl: true },
  [AIModelsEnum.LMSTUDIO]: { description: "LM Studio", provider: AIProviders.LMSTUDIO, requiresBaseUrl: true },
  [AIModelsEnum.OLLAMA]: { description: "Ollama", provider: AIProviders.OLLAMA, requiresBaseUrl: true },
};

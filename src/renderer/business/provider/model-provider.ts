import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { PreferencesStore } from "../../../common/store";
import { AIModelsEnum } from "./ai-models";

/**
 * Normalizes a base URL to ensure it ends with /v1
 * This ensures consistency between model fetching and actual usage
 */
const normalizeBaseUrl = (baseUrl: string): string => {
  if (!baseUrl) return baseUrl;

  // Remove trailing slash if present
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // Add /v1 if not already present
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
};

/**
 * LocalChatOpenAI extends ChatOpenAI to provide a consistent interface for local models
 * (LM Studio, Ollama, Custom OpenAI endpoints)
 */
class LocalChatOpenAI extends ChatOpenAI {
  constructor(config: { baseURL: string; apiKey: string; model: string }) {
    super({
      model: config.model,
      apiKey: config.apiKey,
      configuration: {
        baseURL: config.baseURL,
      },
      streamUsage: false,
      maxRetries: 0,
    });
  }
}

export const useModelProvider = () => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstanceOrCreate<PreferencesStore>();

  const getModel = () => {
    switch (preferencesStore.selectedModel) {
      case AIModelsEnum.GPT_3_5_TURBO:
      case AIModelsEnum.O3_MINI:
      case AIModelsEnum.GPT_4_1:
      case AIModelsEnum.GPT_4_O:
      case AIModelsEnum.GPT_5:
        const openAiApiKey = process.env.OPENAI_API_KEY || preferencesStore.openAIKey;
        return new ChatOpenAI({ model: preferencesStore.selectedModel, apiKey: openAiApiKey });

      case AIModelsEnum.CUSTOM_OPENAI:
        const customOpenAIKey = process.env.CUSTOM_OPENAI_API_KEY || preferencesStore.customOpenAIKey;
        const customOpenAIBaseUrl = process.env.CUSTOM_OPENAI_BASE_URL || preferencesStore.customOpenAIBaseUrl;
        const customOpenAIModelName = process.env.CUSTOM_OPENAI_MODEL_NAME || preferencesStore.customOpenAIModelName;

        if (!customOpenAIBaseUrl) {
          throw new Error("Custom OpenAI base URL is required. Please configure it in settings.");
        }

        return new LocalChatOpenAI({
          baseURL: normalizeBaseUrl(customOpenAIBaseUrl),
          apiKey: customOpenAIKey || "not-needed-for-some-endpoints",
          model: customOpenAIModelName,
        });

      case AIModelsEnum.LMSTUDIO:
        const lmStudioBaseUrl = process.env.LMSTUDIO_BASE_URL || preferencesStore.lmStudioBaseUrl;
        const lmStudioModelName = process.env.LMSTUDIO_MODEL_NAME || preferencesStore.lmStudioModelName;

        if (!lmStudioBaseUrl) {
          throw new Error("LM Studio base URL is required. Please configure it in settings.");
        }

        return new LocalChatOpenAI({
          baseURL: normalizeBaseUrl(lmStudioBaseUrl),
          apiKey: "lm-studio",
          model: lmStudioModelName,
        });

      case AIModelsEnum.OLLAMA:
        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || preferencesStore.ollamaBaseUrl;
        const ollamaModelName = process.env.OLLAMA_MODEL_NAME || preferencesStore.ollamaModelName;

        if (!ollamaBaseUrl) {
          throw new Error("Ollama base URL is required. Please configure it in settings.");
        }

        return new LocalChatOpenAI({
          baseURL: normalizeBaseUrl(ollamaBaseUrl),
          apiKey: "ollama",
          model: ollamaModelName,
        });

      case AIModelsEnum.GEMINI_2_FLASH:
        const googleApiKey = process.env.GOOGLE_API_KEY || preferencesStore.googleAIKey;
        return new ChatGoogleGenerativeAI({
          model: preferencesStore.selectedModel,
          temperature: 0,
          apiKey: googleApiKey,
          streamUsage: false,
        });

      default:
        throw new Error(`Unsupported model: ${preferencesStore.selectedModel}`);
    }
  };

  return { getModel };
};

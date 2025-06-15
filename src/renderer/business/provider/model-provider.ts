import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import {AIModels, AIModelsEnum} from "./ai-models";

const FREELENS_OLLAMA_HOST = process.env.FREELENS_OLLAMA_HOST || "http://127.0.0.1";
const FREELENS_OLLAMA_PORT = process.env.FREELENS_OLLAMA_PORT || "9898";

type ModelStrategy = {
  modelName: AIModels;
  apiKey: string;
};

export const useModelProvider = () => {
  const getModel = ({ modelName, apiKey }: ModelStrategy) => {
    switch (modelName) {
      case AIModelsEnum.GPT_3_5_TURBO:
      case AIModelsEnum.O3_MINI:
      case AIModelsEnum.GPT_4_1:
      case AIModelsEnum.GPT_4_O:
        const openAiApiKey = process.env.OPENAI_API_KEY || apiKey;
        return new ChatOpenAI({ model: modelName, apiKey: openAiApiKey });
      // case AIModelsEnum.DEEP_SEEK_R1:
      //   return null;
      case AIModelsEnum.OLLAMA_LLAMA32_1B:
      case AIModelsEnum.OLLAMA_MISTRAL_7B:
        let headers = new Headers();
        headers.set("Origin", FREELENS_OLLAMA_HOST);
        return new ChatOllama({
          model: modelName,
          temperature: 0,
          headers: headers,
          baseUrl: `${FREELENS_OLLAMA_HOST}:${FREELENS_OLLAMA_PORT}`,
        });
      case AIModelsEnum.GEMINI_2_FLASH:
        const googleApiKey = process.env.GOOGLE_API_KEY || apiKey;
        return new ChatGoogleGenerativeAI({
          model: modelName,
          temperature: 0,
          apiKey: googleApiKey,
        });
      default:
        throw new Error(`Unsupported model: ${modelName}`);
    }
  };

  return { getModel };
};


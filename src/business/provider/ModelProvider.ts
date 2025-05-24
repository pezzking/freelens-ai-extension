import { ChatOpenAI } from "@langchain/openai";
import { AIModels } from "./AIModels";

type ModelStrategy = {
  modelName: AIModels;
  apiKey: string;
};


export const useModelProvider = () => {
  const getModel = ({ modelName, apiKey }: ModelStrategy) => {
    switch (modelName) {
      case "gpt-3.5-turbo":
      case "o3-mini":
      case "gpt-4.1":
      case "gpt-4o":
        return new ChatOpenAI({ model: modelName, apiKey });
      case "deep-seek-r1":
        return null;
      case "ollama-mistral":
        return null;
      default:
        throw new Error(`Unsupported model: ${modelName}`);
    }
  };

  return { getModel };
};
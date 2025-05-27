import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { AIModels } from "./AIModels";

const FREELENS_OLLAMA_BASE_URL = process.env.FREELENS_OLLAMA_BASE_URL || "http://127.0.0.1:9898";

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
      case "llama3.2:1b":
      case "mistral:7b":
        let headers = new Headers();
        headers.set("Origin", "http://127.0.0.1");
        return new ChatOllama({
          model: modelName,
          temperature: 0,
          headers: headers,
          baseUrl: FREELENS_OLLAMA_BASE_URL,
        });
      default:
        throw new Error(`Unsupported model: ${modelName}`);
    }
  };

  return { getModel };
};
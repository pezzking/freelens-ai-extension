import {ChatOpenAI} from "@langchain/openai";

export const useModelProvider = () => {

  const getModel = (modelName: string, modelApiKey: string) => {
    return new ChatOpenAI({model: modelName, apiKey: modelApiKey});
  }

  return {getModel}

};

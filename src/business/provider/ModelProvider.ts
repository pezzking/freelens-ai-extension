import { ChatOpenAI } from "@langchain/openai";



export const useModelProvider = () => {

    const getModel = (modelName: string, modelApiKey: string) => {
        const model = new ChatOpenAI({ model: modelName, apiKey: modelApiKey });
        return model;
    }

    return {getModel}

};
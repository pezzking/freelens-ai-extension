import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ANALYSIS_PROMPT_TEMPLATE } from "./PromptTemplateProvider";

interface AiAnalysisService {
    analyze: (message: string, apiKey: string) => AsyncGenerator<string, void, unknown>;
}

const useAiAnalysisService = (): AiAnalysisService => {
    const analyze = async function* (message: string, apiKey: string) {
        if (!message) {
            throw new Error("No message provided for analysis.");
        }

        if (!apiKey) {
            throw new Error("API key is required. Use the settings to register it.");
        }

        const model = new ChatOpenAI({ model: "gpt-4", apiKey });
        const chain = ChatPromptTemplate.fromTemplate(ANALYSIS_PROMPT_TEMPLATE).pipe(model);
        const streamResponse = await chain.stream({ message });

        for await (const chunk of streamResponse) {
            if (chunk?.content) {
                yield String(chunk.content);
            }
        }
    };

    return { analyze };
};

export default useAiAnalysisService;
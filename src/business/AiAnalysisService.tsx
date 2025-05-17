import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ANALYSIS_PROMPT_TEMPLATE } from "./provider/PromptTemplateProvider";
import { PreferencesStore } from "../store/PreferencesStore";
import { useModelProvider } from "./provider/ModelProvider";


export interface AiAnalysisService {
    analyze: (message: string) => AsyncGenerator<string, void, unknown>;
}

const useAiAnalysisService = (preferencesStore: PreferencesStore): AiAnalysisService => {
    const analyze = async function* (message: string) {
        console.log("Starting AI analysis for message: ", message);

        if (!message) {
            throw new Error("No message provided for analysis.");
        }

        if (!preferencesStore.modelApiKey) {
            throw new Error("API key is required. Use the settings to register it.");
        }

        const model = useModelProvider().getModel("gpt-3.5-turbo", preferencesStore.modelApiKey);
        const chain = ChatPromptTemplate.fromTemplate(ANALYSIS_PROMPT_TEMPLATE).pipe(model);
        const streamResponse = await chain.stream({ context: message });

        for await (const chunk of streamResponse) {
            if (chunk?.content) {
                yield String(chunk.content);
            }
        }
    };

    return { analyze };
};

export default useAiAnalysisService;
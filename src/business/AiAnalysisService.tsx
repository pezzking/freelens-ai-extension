import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ANALYSIS_PROMPT_TEMPLATE } from "./provider/PromptTemplateProvider";
import { PreferencesStore } from "../store/PreferencesStore";
import { useModelProvider } from "./provider/ModelProvider";
import AIModelInfos, {AIProviders} from "./AIModels";


export interface AiAnalysisService {
    analyze: (message: string) => AsyncGenerator<string, void, unknown>;
}

const useAiAnalysisService = (preferencesStore: PreferencesStore): AiAnalysisService => {
    const analyze = async function* (message: string) {
        console.log("Starting AI analysis for message: ", message);

        if (!message) {
            throw new Error("No message provided for analysis.");
        }

        if (!preferencesStore.openAIApiKey) {
            throw new Error("API key is required. Use the settings to register it.");
        }

        const provider = AIModelInfos[preferencesStore.selectedModel].provider
        const apiKey = AIProviders.OPEN_AI === provider ? preferencesStore.openAIApiKey : preferencesStore.deepSeekApiKey;
        const model = useModelProvider().getModel(preferencesStore.selectedModel, apiKey);
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

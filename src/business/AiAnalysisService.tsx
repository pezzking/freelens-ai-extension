import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ANALYSIS_PROMPT_TEMPLATE } from "./PromptTemplateProvider";
import { PreferencesStore } from "../store/PreferencesStore";
import { Renderer } from "@freelensapp/extensions";


interface AiAnalysisService {
    analyze: (message: string) => AsyncGenerator<string, void, unknown>;
}

const useAiAnalysisService = (preferencesStore: PreferencesStore): AiAnalysisService => {
    const analyze = async function* (message: string) {

        // const podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi) as Renderer.K8sApi.PodsStore;
        // console.log("Load pods: ", podsStore);
        // console.log(JSON.stringify(podsStore));

        if (!message) {
            throw new Error("No message provided for analysis.");
        }

        if (!preferencesStore.modelApiKey) {
            throw new Error("API key is required. Use the settings to register it.");
        }

        const model = new ChatOpenAI({ model: "gpt-3.5-turbo", apiKey: preferencesStore.modelApiKey });
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
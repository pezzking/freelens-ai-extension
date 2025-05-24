import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AIModels } from "../provider/AIModels";
import { useModelProvider } from "../provider/ModelProvider";
import { CONCLUSIONS_AGENT_PROMPT_TEMPLATE } from "../provider/PromptTemplateProvider";

export const useConclusionsAgent = (modelName: AIModels, modelApiKey: string) => {
    const model = useModelProvider().getModel({ modelName: modelName, apiKey: modelApiKey });

    const getAgent = () => {
        return createReactAgent({
            llm: model,
            tools: [],
            stateModifier: CONCLUSIONS_AGENT_PROMPT_TEMPLATE
        });
    }

    return { getAgent };
}
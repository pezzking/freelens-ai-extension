import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { useModelProvider } from "../provider/ModelProvider";
import { GENERAL_PURPOSE_AGENT_PROMPT_TEMPLATE } from "../provider/PromptTemplateProvider";

export const useGeneralPurposeAgent = (modelName: string, modelApiKey: string) => {
    const model = useModelProvider().getModel(modelName, modelApiKey);

    const getAgent = () => {
        return createReactAgent({
            llm: model,
            tools: [],
            stateModifier: GENERAL_PURPOSE_AGENT_PROMPT_TEMPLATE
        });
    }

    return { getAgent };
}
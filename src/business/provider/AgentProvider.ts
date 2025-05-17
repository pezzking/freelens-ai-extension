import { getNamespaces, getWarningEventsByNamespace } from "../agent/Tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AGENT_PROMPT_TEMPLATE } from "../provider/PromptTemplateProvider";
import { useModelProvider } from "../provider/ModelProvider";

export const useAgentAnalyzer = (modelName: string, modelApiKey: string) => {
    const model = useModelProvider().getModel(modelName, modelApiKey);
    
    const getAgent = () => {
        return createReactAgent({
            llm: model,
            tools: [getNamespaces, getWarningEventsByNamespace],
            stateModifier: AGENT_PROMPT_TEMPLATE
        });
    }

    return { getAgent };
}
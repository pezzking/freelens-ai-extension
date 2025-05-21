import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getNamespaces, getWarningEventsByNamespace } from "./tools/Tools";
import { useModelProvider } from "../provider/ModelProvider";
import { AGENT_ANALYZER_PROMPT_TEMPLATE } from "../provider/PromptTemplateProvider";


export const useAgentAnalyzer = (modelName: string, modelApiKey: string) => {
    const model = useModelProvider().getModel(modelName, modelApiKey);

    const getAgent = () => {
        return createReactAgent({
            llm: model,
            tools: [getNamespaces, getWarningEventsByNamespace],
            stateModifier: AGENT_ANALYZER_PROMPT_TEMPLATE
        });
    }

    return { getAgent };
}

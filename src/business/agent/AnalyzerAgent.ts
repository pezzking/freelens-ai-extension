import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AIModels } from "../provider/AIModels";
import { useModelProvider } from "../provider/ModelProvider";
import { AGENT_ANALYZER_PROMPT_TEMPLATE } from "../provider/PromptTemplateProvider";
import { getNamespaces, getWarningEventsByNamespace } from "./tools/Tools";


export const useAgentAnalyzer = (modelName: AIModels, modelApiKey: string) => {
    const model = useModelProvider().getModel({ modelName: modelName, apiKey: modelApiKey });

    const getAgent = () => {
        return createReactAgent({
            llm: model,
            tools: [getNamespaces, getWarningEventsByNamespace],
            stateModifier: AGENT_ANALYZER_PROMPT_TEMPLATE
        });
    }

    return { getAgent };
}

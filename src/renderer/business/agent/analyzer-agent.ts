import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { useModelProvider } from "../provider/model-provider";
import { AGENT_ANALYZER_PROMPT_TEMPLATE } from "../provider/prompt-template-provider";
import { getNamespaces, getWarningEventsByNamespace } from "./tools/tools";

export const useAgentAnalyzer = () => {
  const model = useModelProvider().getModel();

  const getAgent = () => {
    return (
      model &&
      createReactAgent({
        llm: model,
        tools: [getNamespaces, getWarningEventsByNamespace],
        stateModifier: AGENT_ANALYZER_PROMPT_TEMPLATE,
      })
    );
  };

  return { getAgent };
};

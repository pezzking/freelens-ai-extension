import { AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { useModelProvider } from "../provider/model-provider";
import { KUBERNETES_OPERATOR_PROMPT_TEMPLATE } from "../provider/prompt-template-provider";
import {
  createDeployment,
  createPod,
  createService,
  deleteDeployment,
  deletePod,
  deleteService,
  getDeployments,
  getPods,
  getServices,
} from "./tools/tools";

export const useAgentKubernetesOperator = () => {
  const model = useModelProvider().getModel();

  const getAgent = () => {
    if (!model) {
      return;
    }

    const tools = [
      createPod,
      createDeployment,
      deletePod,
      deleteDeployment,
      createService,
      deleteService,
      getPods,
      getDeployments,
      getServices,
    ];
    const toolNode = new ToolNode(tools);
    const boundModel = model.bindTools(tools);

    const shouldContinue = ({ messages }: { messages: AIMessage[] }) => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      return "__end__";
    };

    const callModel = async (state: { messages: AIMessage[] }) => {
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", KUBERNETES_OPERATOR_PROMPT_TEMPLATE],
        new MessagesPlaceholder("messages"),
      ]);
      const response = await prompt.pipe(boundModel).invoke({ messages: state.messages });
      return { messages: [response] };
    };

    return new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addEdge("__start__", "agent")
      .addNode("tools", toolNode)
      .addEdge("tools", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .compile();
  };

  return { getAgent };
};

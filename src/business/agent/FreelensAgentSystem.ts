import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { Annotation, Command, MemorySaver, type Messages, messagesStateReducer, StateGraph } from "@langchain/langgraph";
import { useAgentAnalyzer } from "./AnalyzerAgent";
import { useAgentKubernetesOperator } from "./KubernetesOperatorAgent";
import { useAgentSupervisor } from "./SupervisorAgent";

/**
 * Multi-agent system for Freelens
 * @returns the multi-agent system invokable
 */
export const useFreelensAgentSystem = () => {

    const GraphState = Annotation.Root({
        modelName: Annotation<string>,
        modelApiKey: Annotation<string>,
        messages: Annotation<BaseMessage[], Messages>({
            reducer: messagesStateReducer,
        }),
    });

    const supervisorAgentNode = async (state: typeof GraphState.State) => {
        console.log("Supervisor agent - calling agent supervisor with input: ", state);

        const subAgents = ["agentAnalyzer", "kubernetesOperator"];
        const subAgentResponsibilities = [
            "agentAnalyzer: Reads cluster events and find for warnings and errors",
            "kubernetesOperator: Operates on the cluster in write mode (for example apply changes) and then exits",
        ];
        const agentSupervisor = await useAgentSupervisor(state.modelName, state.modelApiKey).getAgent(subAgents, subAgentResponsibilities);

        const response = await agentSupervisor.invoke({ messages: state.messages });
        console.log("Supervisor agent - supervisor response", response);

        // handoff
        return new Command({ goto: response.goto });
    }

    const agentAnalyzerNode = async (state: typeof GraphState.State) => {
        console.log("Agent analyzer - calling agent analyzer with input: ", state);
        const agentAnalyzer = useAgentAnalyzer(state.modelName, state.modelApiKey).getAgent();
        const result = await agentAnalyzer.invoke(state);
        const lastMessage = result.messages[result.messages.length - 1];
        console.log("Agent analyzer - analysis result: ", result);
        return {
            messages: [
                new HumanMessage({ content: lastMessage.content }),
            ],
        };
    }

    const kubernetesOperatorNode = async (state: typeof GraphState.State) => {
        console.log("Kubernetes Operator - called with input: ", state);
        const agentKubernetesOperator = useAgentKubernetesOperator(state.modelName, state.modelApiKey).getAgent();
        const result = await agentKubernetesOperator.invoke(state);
        const lastMessage = result.messages[result.messages.length - 1];
        console.log("Kubernetes Operator - k8s operator result: ", result);
        return {
            messages: [
                new HumanMessage({ content: lastMessage.content }),
            ],
        };
    }

    const buildMultiAgentSystem = () => {
        return new StateGraph(GraphState)
            .addNode(
                "supervisorAgent",
                RunnableLambda.from(supervisorAgentNode).withConfig({ tags: ["nostream"] }),
                { ends: ["agentAnalyzer", "kubernetesOperator"] }
            )
            .addNode("agentAnalyzer", agentAnalyzerNode)
            .addNode("kubernetesOperator", kubernetesOperatorNode)
            .addEdge("__start__", "supervisorAgent")
            .addEdge("agentAnalyzer", "supervisorAgent")
            .addEdge("kubernetesOperator", "__end__")
            .compile({ checkpointer: new MemorySaver() });
    }

    return { buildMultiAgentSystem };
}
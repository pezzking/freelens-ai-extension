import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { Annotation, Command, CompiledStateGraph, MemorySaver, type Messages, messagesStateReducer, StateGraph } from "@langchain/langgraph";
import { AIModels } from "../provider/AIModels";
import { useAgentAnalyzer } from "./AnalyzerAgent";
import { useGeneralPurposeAgent } from "./GeneralPurposeAgent";
import { useAgentKubernetesOperator } from "./KubernetesOperatorAgent";
import { useAgentSupervisor } from "./SupervisorAgent";
import { useConclusionsAgent } from "./ConclusionsAgent";

/**
 * Multi-agent system for Freelens
 * @returns the multi-agent system invokable
 */
export const useFreelensAgentSystem = () => {
    const subAgents = ["agentAnalyzer", "kubernetesOperator", "generalPurposeAgent"];
    const conclusionAgentName = "conclusionsAgent";
    const subAgentResponsibilities = [
        "agentAnalyzer: Reads cluster events and find for warnings and errors",
        "kubernetesOperator: Operates on the cluster in write mode (for example apply changes) and then exits",
        "generalPurposeAgent: Handles general queries including but not limited to: Kubernetes conceptual explanations, best practices, architecture patterns, and non-Kubernetes technical questions. This agent doesn't interact with the live cluster but provides comprehensive knowledge-based responses.",
    ];

    const GraphState = Annotation.Root({
        modelName: Annotation<AIModels>,
        modelApiKey: Annotation<string>,
        messages: Annotation<BaseMessage[], Messages>({
            reducer: messagesStateReducer,
        }),
    });

    const supervisorAgentNode = async (state: typeof GraphState.State) => {
        console.log("Supervisor agent - calling agent supervisor with input: ", state);
        const agentSupervisor = await useAgentSupervisor(state.modelName, state.modelApiKey)
            .getAgent(subAgents, subAgentResponsibilities);
        const response = await agentSupervisor.invoke({ messages: state.messages });
        console.log("Supervisor agent - supervisor response", response);

        // handoff
        if (response.goto === "__end__") {
            response.goto = conclusionAgentName;
        }
        return new Command({ goto: response.goto });
    }

    const agentAnalyzerNode = async (state: typeof GraphState.State) => {
        console.log("Analyzer Agent - calling agent analyzer with input: ", state);
        const agentAnalyzer = useAgentAnalyzer(state.modelName, state.modelApiKey).getAgent();
        const result = await agentAnalyzer.invoke(state);
        const lastMessage = result.messages[result.messages.length - 1];
        console.log("Analyzer Agent - analysis result: ", result);
        return {
            messages: [
                new HumanMessage({ content: lastMessage.content }),
            ],
        };
    }

    const kubernetesOperatorNode = async (state: typeof GraphState.State) => {
        console.log("Kubernetes Operator Agent - called with input: ", state);
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

    const generalPurposeAgentNode = async (state: typeof GraphState.State) => {
        console.log("General Purpose Agent - called with input: ", state);
        const generalPurposeAgent = useGeneralPurposeAgent(state.modelName, state.modelApiKey).getAgent();
        const result = await generalPurposeAgent.invoke(state);
        const lastMessage = result.messages[result.messages.length - 1];
        console.log("General Purpose Agent - response: ", result);
        return {
            messages: [
                new HumanMessage({ content: lastMessage.content }),
            ],
        };
    }

    const conclusionsAgentNode = async (state: typeof GraphState.State) => {
        console.log("Conclusions Agent - called with input: ", state);
        const conclusionsAgent = useConclusionsAgent(state.modelName, state.modelApiKey).getAgent();
        const result = await conclusionsAgent.invoke(state);
        const lastMessage = result.messages[result.messages.length - 1];
        console.log("Conclusions Agent - conclusions: ", result);
        return {
            messages: [
                new HumanMessage({ content: lastMessage.content }),
            ],
        };
    }

    const buildMultiAgentSystem = (): CompiledStateGraph<object, object, string, any, any, any> => {
        return new StateGraph(GraphState)
            .addNode(
                "supervisorAgent",
                RunnableLambda.from(supervisorAgentNode).withConfig({ tags: ["nostream"] }),
                { ends: [...subAgents, conclusionAgentName] }
            )
            .addNode("agentAnalyzer", agentAnalyzerNode)
            .addNode("kubernetesOperator", kubernetesOperatorNode)
            .addNode("generalPurposeAgent", generalPurposeAgentNode)
            .addNode(conclusionAgentName, conclusionsAgentNode)
            .addEdge("__start__", "supervisorAgent")
            .addEdge("agentAnalyzer", "supervisorAgent")
            .addEdge("kubernetesOperator", "__end__")
            .addEdge("generalPurposeAgent", "__end__")
            .addEdge(conclusionAgentName, "__end__")
            .compile({ checkpointer: new MemorySaver() });
    }

    return { buildMultiAgentSystem };
}
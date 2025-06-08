import { AIMessage } from "@langchain/core/messages";
import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { useModelProvider } from "../provider/ModelProvider";
import { GraphState } from "./state/GraphState";
import { teardownNode } from "./nodes/Teardown";

export const useMcpAgent = (mcpConfiguration: string) => {

    const parseMcpConfiguration = (mcpConfiguration: string) => {
        try {
            if (!mcpConfiguration || typeof mcpConfiguration !== "string") {
                console.warn("No MCP configuration provided or invalid type. Returning empty configuration.");
                return {};
            }

            const parsedMcpConfiguration = JSON.parse(mcpConfiguration);
            if (!parsedMcpConfiguration.mcpServers) {
                throw new Error("Invalid MCP configuration: 'mcpServers' property is missing.");
            }
            return parsedMcpConfiguration.mcpServers;
        } catch (error) {
            console.error("Failed to parse MCP configuration:", error);
            return {};
        }
    }

    const loadMcpTools = async (mcpConfiguration: string) => {
        const mcpServers = parseMcpConfiguration(mcpConfiguration);

        const client = new MultiServerMCPClient({
            throwOnLoadError: true,
            prefixToolNameWithServerName: false,
            additionalToolNamePrefix: "",
            useStandardContentBlocks: true,
            mcpServers: mcpServers
        });

        const mcpTools = await client.getTools();
        mcpTools.forEach(tool => {
            console.log("Loading MCP tool with name: %s, description: %s", tool.name, tool.description);
        });
        return mcpTools;
    }

    const buildAgentSystem = async () => {
        const mcpTools = await loadMcpTools(mcpConfiguration);
        const toolNode = new ToolNode(mcpTools);

        const shouldContinue = ({ messages }: typeof GraphState.State) => {
            const lastMessage = messages[messages.length - 1] as AIMessage;
            if (lastMessage.tool_calls?.length) {
                return "tools";
            }
            return "teardownNode";
        }

        const callModel = async (state: typeof GraphState.State) => {
            console.log("MCP Agent - called with input: ", state);
            const model = useModelProvider().getModel({ modelName: state.modelName, apiKey: state.modelApiKey });
            const boundModel = model.bindTools(mcpTools);
            const response = await boundModel.invoke(state.messages);
            console.log("MCP Agent - response: ", response);
            return { messages: [response] };
        }

        return new StateGraph(GraphState)
            .addNode("agent", callModel)
            .addNode("tools", toolNode)
            .addNode("teardownNode", teardownNode)
            .addEdge("__start__", "agent")
            .addEdge("tools", "agent")
            .addConditionalEdges("agent", shouldContinue)
            .addEdge("teardownNode", "__end__")
            .compile({ checkpointer: new MemorySaver() });
    }


    return { buildAgentSystem };
}
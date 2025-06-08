import { AIMessage } from "@langchain/core/messages";
import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { useModelProvider } from "../provider/ModelProvider";
import { GraphState } from "./state/GraphState";

const client = new MultiServerMCPClient({
    throwOnLoadError: true,
    prefixToolNameWithServerName: false,
    additionalToolNamePrefix: "",
    useStandardContentBlocks: true,
    mcpServers: {
        kubernetes: {
            transport: "stdio",
            command: "npx",
            args: ["mcp-server-kubernetes"],
            restart: {
                enabled: true,
                maxAttempts: 3,
                delayMs: 1000,
            },
        },
    },
});

const loadMcpTools = async () => {
    const mcpTools = await client.getTools();
    mcpTools.forEach(tool => {
        console.log("Loading MCP tool with name: %s, description: %s", tool.name, tool.description);
    });
    return mcpTools;
}

export const useMcpAgent = () => {

    const buildAgentSystem = async () => {
        const mcpTools = await loadMcpTools();
        const toolNode = new ToolNode(mcpTools);

        const shouldContinue = ({ messages }: typeof GraphState.State) => {
            const lastMessage = messages[messages.length - 1] as AIMessage;
            if (lastMessage.tool_calls?.length) {
                return "tools";
            }
            return "__end__";
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
            .addEdge("__start__", "agent")
            .addNode("tools", toolNode)
            .addEdge("tools", "agent")
            .addConditionalEdges("agent", shouldContinue)
            .compile({ checkpointer: new MemorySaver() });
    }


    return { buildAgentSystem };
}
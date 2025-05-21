import { isAIMessageChunk } from "@langchain/core/messages";
import { Interrupt } from "@langchain/langgraph";
import { useFreelensAgentSystem } from "../agent/FreelensAgentSystem";

export interface AgentService {
    run(humanMessage: string, conversationId: string): AsyncGenerator<string | Interrupt, void, unknown>;
}

/**
 * Function responsible for running the agent and handling the response logic
 * @param modelName 
 * @param modelApiKey 
 * @returns 
 */
export const useAgentService = (modelName: string, modelApiKey: string): AgentService => {
    const freelensAgent = useFreelensAgentSystem();

    const run = async function* (humanMessage: string, conversationId: string) {
        console.log("Starting Freelens Agent run for message: ", humanMessage);
        const graph = freelensAgent.buildMultiAgentSystem();

        let config = { thread_id: conversationId };
        const streamResponse = await graph.stream(
            { modelName: modelName, modelApiKey: modelApiKey, messages: [{ role: "user", content: humanMessage }], },
            { streamMode: "messages", configurable: config },
        );

        // streams LLM token by token to the UI
        for await (const [message, _metadata] of streamResponse) {
            if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
                // console.log(`${message.getType()} MESSAGE TOOL CALL CHUNK: ${message.tool_call_chunks[0].args}`);
            } else {
                if (message.getType() === "ai") {
                    yield String(message.content);
                }
            }
        }
        yield "\n";

        // checks the agent state for any interrupts
        const agentState = await graph.getState({ configurable: config });
        console.log("Agent state: ", agentState);
        if (agentState.next) {
            console.log("Agent state next: ", agentState.next);
            for (const task of agentState.tasks) {
                if (task.interrupts) {
                    console.log("Agent state task interrupts: ", task.interrupts);
                    for (const interrupt of task.interrupts) {
                        console.log("Agent state task interrupt: ", interrupt);
                        yield interrupt;
                    }
                }
            }
        }
    }

    return { run };

}
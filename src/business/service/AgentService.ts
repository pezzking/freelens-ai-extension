import { isAIMessageChunk } from "@langchain/core/messages";
import { Command, CompiledStateGraph, Interrupt } from "@langchain/langgraph";

export interface AgentService {
    run(agentInput: object | Command, conversationId: string): AsyncGenerator<string | Interrupt, void, unknown>;
}

/**
 * Function responsible for running the agent and handling the response logic
 * @param modelName 
 * @param modelApiKey 
 * @returns 
 */
export const useAgentService = (agent: CompiledStateGraph<object, object, string, any, any, any>): AgentService => {

    const run = async function* (agentInput: object | Command, conversationId: string) {
        console.log("Starting Freelens Agent run for message: ", agentInput);

        let config = { thread_id: conversationId };
        const streamResponse = await agent.stream(agentInput, { streamMode: "messages", configurable: config });

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
        const agentState = await agent.getState({ configurable: config });
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
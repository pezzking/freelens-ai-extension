import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { AGENT_PROMPT_TEMPLATE } from "./PromptTemplateProvider";
import { isAIMessageChunk } from "@langchain/core/messages";

export interface AgentService {
    run (humanMessage: string): AsyncGenerator<string, void, unknown>;
}


export const useAgentService = (modelName: string, modelApiKey: string): AgentService => {
    const model = new ChatOpenAI({ model: modelName, apiKey: modelApiKey });
    const agent = createReactAgent({
        llm: model,
        tools: [],
        stateModifier: AGENT_PROMPT_TEMPLATE
    });

    const run = async function* (humanMessage: string) {
        console.log("Starting Freelens Agent run for message: ", humanMessage);

        const streamResponse = await agent.stream(
            { messages: [{ role: "user", content: humanMessage }], },
            { streamMode: "messages" }
        );

        for await (const [message, _metadata] of streamResponse) {
            if (isAIMessageChunk(message) && message.tool_call_chunks?.length) {
                console.log(`${message.getType()} MESSAGE TOOL CALL CHUNK: ${message.tool_call_chunks[0].args}`);
            } else {
                console.log(`${message.getType()} MESSAGE CONTENT: ${message.content}`);
                yield String(message.content);
            }
        }
    }

    return { run };

}
import { GraphState } from "../state/GraphState";
import { RemoveMessage } from "@langchain/core/messages";

const HISTORY_SIZE = 5;

export function teardownNode(state: typeof GraphState.State) {
    console.log("Teardown Node - called with input: ", state);
    const messages = state.messages;
    if (messages.length > HISTORY_SIZE) {
    return { messages: messages.slice(0, -HISTORY_SIZE).map(m => new RemoveMessage({ id: m.id })) };
  }
    return {};
}
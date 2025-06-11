import {MessageType} from "./MessageType";
import {Interrupt} from "@langchain/langgraph";

export function getTextMessage(message: string, sent: boolean) {
  return {
    type: MessageType.MESSAGE,
    text: message,
    sent: sent
  };
}

export function getInterruptMessage(chunk: Interrupt, sent: boolean) {
  return {
    type: MessageType.INTERRUPT,
    text: chunk.value.requestString,
    options: chunk.value.options,
    sent: sent
  };
}

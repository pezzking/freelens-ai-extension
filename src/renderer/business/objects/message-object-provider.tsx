import { Interrupt } from "@langchain/langgraph";
import { MessageObject } from "./message-object";
import { MessageType } from "./message-type";

export function getTextMessage(message: string, sent: boolean): MessageObject {
  return {
    type: MessageType.MESSAGE,
    text: message,
    sent: sent,
  };
}

export function getExplainMessage(message: string): MessageObject {
  return {
    type: MessageType.EXPLAIN,
    text: message,
    sent: true,
  };
}

export function getInterruptMessage(chunk: Interrupt, sent: boolean): MessageObject {
  return {
    type: MessageType.INTERRUPT,
    action: chunk.value.actionToApprove.action,
    text: chunk.value.requestString,
    options: chunk.value.options,
    sent: sent,
  };
}

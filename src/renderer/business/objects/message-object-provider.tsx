import { Interrupt } from "@langchain/langgraph";
import { generateUuid } from "../../../common/utils/uuid";
import { MessageObject } from "./message-object";
import { MessageType } from "./message-type";

export function getTextMessage(message: string, sent: boolean): MessageObject {
  return {
    messageId: generateUuid(),
    type: MessageType.MESSAGE,
    text: message,
    sent: sent,
  };
}

export function getExplainMessage(message: string): MessageObject {
  return {
    messageId: generateUuid(),
    type: MessageType.EXPLAIN,
    text: message,
    sent: true,
  };
}

export function getInterruptMessage(chunk: Interrupt, sent: boolean): MessageObject {
  return {
    messageId: generateUuid(),
    type: MessageType.INTERRUPT,
    action: chunk.value.actionToApprove.action,
    question: chunk.value.question,
    text: chunk.value.requestString,
    options: chunk.value.options,
    approved: null,
    sent: sent,
  };
}

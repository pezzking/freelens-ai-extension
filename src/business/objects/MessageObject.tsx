import {MessageType} from "./MessageType";

export type MessageObject = {
  type: MessageType,
  text: string;
  action?: string;
  options?: string[];
  sent: boolean;
};

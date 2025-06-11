import {MessageType} from "./MessageType";

export type MessageObject = {
  type: MessageType,
  text: string;
  options?: string[];
  sent: boolean;
};

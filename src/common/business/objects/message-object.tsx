import { MessageType } from "./message-type";

export type MessageObject = {
  type: MessageType;
  text: string;
  action?: string;
  options?: string[];
  sent: boolean;
};

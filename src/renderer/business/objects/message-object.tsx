import { MessageType } from "./message-type";

export interface MessageObject {
  type: MessageType;
  text: string;
  question?: string;
  action?: string;
  options?: string[];
  sent: boolean;
}

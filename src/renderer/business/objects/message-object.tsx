import { MessageType } from "./message-type";

export interface MessageObject {
  type: MessageType;
  text: string;
  action?: string;
  options?: string[];
  sent: boolean;
}

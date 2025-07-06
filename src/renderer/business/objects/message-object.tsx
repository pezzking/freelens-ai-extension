import { MessageType } from "./message-type";

export interface MessageObject {
  messageId: string;
  type: MessageType;
  text: string;
  question?: string;
  action?: string;
  options?: string[];
  approved?: boolean | null;
  sent: boolean;
}

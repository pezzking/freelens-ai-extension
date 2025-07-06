// @ts-ignore
import React from "react";

import { MessageObject } from "../../business/objects/message-object";
import { getTextMessage } from "../../business/objects/message-object-provider";
import { MessageType } from "../../business/objects/message-type";
import { useChatHook } from "../chat";
import Interrupt from "../interrupt/interrupt";
import { MarkdownViewer } from "../markdown-viewer";
import styleInline from "./message.scss?inline";

export interface MessageProps {
  message: MessageObject;
}

export const Message = ({ message }: MessageProps) => {
  const sentMessageClassName = message.sent ? "message-bubble sent" : "message-bubble";
  const chatHook = useChatHook();

  if (message.sent) {
    return (
      <>
        <style>{styleInline}</style>
        <div className={sentMessageClassName}>{message.text}</div>
      </>
    );
  } else {
    if (MessageType.INTERRUPT === message.type) {
      return (
        <>
          <style>{styleInline}</style>
          <Interrupt
            header={message.action!}
            question={message.question!}
            text={message.text}
            options={message.options!}
            onAction={(option) => chatHook.sendMessageToAgent(getTextMessage(option, true))}
          />
        </>
      );
    } else {
      return (
        <div>
          <style>{styleInline}</style>
          <MarkdownViewer content={message.text} />
        </div>
      );
    }
  }
};

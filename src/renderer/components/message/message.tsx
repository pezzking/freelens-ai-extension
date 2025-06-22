// @ts-ignore
import React from "react";

import { Renderer } from "@freelensapp/extensions";
import { MessageObject } from "../../business/objects/message-object";
import { getTextMessage } from "../../business/objects/message-object-provider";
import { MessageType } from "../../business/objects/message-type";
import { useChatHook } from "../chat";
import { MarkdownViewer } from "../markdown-viewer";
import styleInline from "./message.scss?inline";

const {
  Component: { Button },
} = Renderer;

export interface MessageProps {
  message: MessageObject;
}

export const Message = ({ message }: MessageProps) => {
  const sentMessageClassName = message.sent ? "message-bubble sent" : "message-bubble";
  const buttonsOptionsClassName = "message-buttons-options";
  const chatHook = useChatHook();

  const renderOptions = (options?: string[]) => {
    return (
      options &&
      options.map((option) => (
        <Button label={option} onClick={() => chatHook.sendMessageToAgent(getTextMessage(option, true))} />
      ))
    );
  };

  return (
    <>
      <style>{styleInline}</style>
      {message.sent ? (
        <div className={sentMessageClassName}>{message.text}</div>
      ) : (
        <div>
          <MarkdownViewer content={message.text} />
          <div className={buttonsOptionsClassName}>
            {MessageType.INTERRUPT === message.type && renderOptions(message.options)}
          </div>
        </div>
      )}
    </>
  );
};

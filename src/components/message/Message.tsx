import React from "react";
import "./Message.scss";
import MarkdownViewer from "../markdownViewer/MarkdownViewer";
import {MessageObject} from "../../business/objects/MessageObject";
import {MessageType} from "../../business/objects/MessageType";
import {Renderer} from "@freelensapp/extensions";
import {PreferencesStore} from "../../store/PreferencesStore";
import useChatHook from "../chat/ChatHook";
import {getTextMessage} from "../../business/objects/MessageObjectProvider";

const {Component: {Button}} = Renderer;

export type MessageProps = {
  message: MessageObject;
  preferencesStore: PreferencesStore;
};

const Message = ({message, preferencesStore}: MessageProps) => {
  const sentMessageClassName = message.sent ? "message-bubble sent" : "message-bubble";
  const buttonsOptionsClassName = "message-buttons-options";
  const chatHook = useChatHook(preferencesStore);

  const renderOptions = (options: string[]) => {
    return options.map(option =>
      <Button label={option} onClick={() =>
        chatHook.sendMessageToAgent(getTextMessage(option, true))
      }/>
    )
  }

  if (message.sent) {
    return (
      <div className={sentMessageClassName}>
        {message.text}
      </div>
    )
  } else {
    return (
      <div>
        <MarkdownViewer content={message.text}/>
        <div className={buttonsOptionsClassName}>
          {MessageType.INTERRUPT === message.type && renderOptions(message.options)}
        </div>
      </div>
    )
  }
}

export default Message;

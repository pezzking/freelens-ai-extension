import React from "react";
import "./Message.scss";
import MarkdownViewer from "../markdownViewer/MarkdownViewer";
import {MessageObject} from "../../business/objects/MessageObject";
import {MessageType} from "../../business/objects/MessageType";
import {PreferencesStore} from "../../store/PreferencesStore";
import useChatHook from "../chat/ChatHook";
import Interrupt from "../interrupt/Interrupt";
import {getTextMessage} from "../../business/objects/MessageObjectProvider";

export type MessageProps = {
  message: MessageObject;
  preferencesStore: PreferencesStore;
};

const Message = ({message, preferencesStore}: MessageProps) => {
  const sentMessageClassName = message.sent ? "message-bubble sent" : "message-bubble";
  const chatHook = useChatHook(preferencesStore);

  if (message.sent) {
    return (
      <div className={sentMessageClassName}>
        {message.text}
      </div>
    )
  } else {
    if (MessageType.INTERRUPT === message.type) {
      return <Interrupt header={message.action} text={message.text} options={message.options}
                        onAction={(option) => chatHook.sendMessageToAgent(getTextMessage(option, true))}/>
    } else {
      return (
        <div>
          <MarkdownViewer content={message.text}/>
        </div>
      )
    }
  }
}

export default Message;

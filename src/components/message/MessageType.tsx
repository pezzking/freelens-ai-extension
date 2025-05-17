import React from "react";
import "./Message.scss";
import MarkdownViewer from "../markdownViewer/MarkdownViewer";

export type MessageType = {
  text: string;
  sent: boolean;
};

export type MessageProps = {
  message: MessageType;
};

const Message = ({message}: MessageProps) => {
  const className = message.sent ? "message-bubble sent" : "message-bubble";

  if (message.sent) {
    return (
      <div className={className}>
        {message.text}
      </div>
    )
  } else {
    return (
      <MarkdownViewer content={message.text}/>
    )
  }
}

export default Message;

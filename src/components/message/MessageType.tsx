import React from "react";
import "./Message.scss";

export type MessageType = {
  sent: boolean;
  text: string;
};

export type MessageProps = {
  message: MessageType;
};

const Message = ({message}: MessageProps) => {
  const className = message.sent ? "message-bubble sent" : "message-bubble";

  return (
    <div className={className}>
      {message.text}
    </div>
  )

}

export default Message;

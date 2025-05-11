import React from 'react'
import './Chat.scss'
import TextInput from "../textInput/TextInput";
import Message from "../message/MessageType";
import useChatHook from "./ChatHook";

const Chat: React.FC = () => {
  const chatHook = useChatHook();

  return (
    <div className="chat-container">
      <div className="messagesContainer">
        {chatHook.messages.map((msg, index) => (
          <Message key={index} message={msg}/>
        ))}
      </div>

      <TextInput onSend={chatHook.sendMessage}/>
    </div>
  )
}

export default Chat

import React, {useEffect, useRef} from 'react'
import './Chat.scss'
import TextInput from "../textInput/TextInput";
import Message, {MessageType} from "../message/Message";
import useChatHook from "./ChatHook";
import {observer} from "mobx-react";
import {PreferencesStore} from "../../store/PreferencesStore";

const Chat = observer(() => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();
  const chatHook = useChatHook(preferencesStore);

  return (
    <div className="chat-container">
      <div className="messagesContainer" ref={chatHook.containerRef}>
        {preferencesStore.chatMessages.map((msg: MessageType, index: number) => (
          <Message key={index} message={msg}/>
        ))}
      </div>

      <TextInput onSend={chatHook.sendMessageToAgent}/>
    </div>
  )
})

export default Chat

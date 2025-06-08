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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#d32f2f', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={async () => preferencesStore.clearChat()}
        >
          Clear Chat
        </button>
      </div>
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

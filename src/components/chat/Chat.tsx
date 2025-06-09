import React, {useEffect, useRef} from 'react'
import './Chat.scss'
import TextInput from "../textInput/TextInput";
import Message, {MessageType} from "../message/Message";
import useChatHook from "./ChatHook";
import {observer} from "mobx-react";
import {PreferencesStore} from "../../store/PreferencesStore";
import { Loader2 } from "lucide-react";

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

        {/* Spinner that executes while the agent is running */}
        {preferencesStore.isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
            <Loader2 size={32} className="chat-loading-spinner" />
          </div>
        )}
      </div>

      <TextInput onSend={chatHook.sendMessageToAgent}/>
    </div>
  )
})

export default Chat

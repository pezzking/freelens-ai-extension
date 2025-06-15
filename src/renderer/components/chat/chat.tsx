// @ts-ignore
import React from "react";

import { Loader2 } from "lucide-react";
import { observer } from "mobx-react";
import { PreferencesStore } from "../../../common/store";
import { Message } from "../message";
import { TextInput } from "../text-input";
import { useChatHook } from "./chat-hook";
import styleInline from "./chat.scss?inline";
import {MessageObject} from "../../business/objects/message-object";
import {getTextMessage} from "../../business/objects/message-object-provider";

export const Chat = observer(() => {
  const preferencesStore = PreferencesStore.getInstance();
  const chatHook = useChatHook(preferencesStore);

  return (
    <>
      <style>{styleInline}</style>
      <div className="chat-container">
        <div className="messages-container" ref={chatHook.containerRef}>
          {preferencesStore.chatMessages.map((msg: MessageObject, index: number) => (
            <Message key={index} message={msg} preferencesStore={preferencesStore} />
          ))}

          {/* Spinner that executes while the agent is running */}
          {preferencesStore.isLoading && (
            <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
              <Loader2 size={32} className="chat-loading-spinner" />
            </div>
          )}
        </div>

        <TextInput onSend={(text) => chatHook.sendMessageToAgent(getTextMessage(text, true))} />
      </div>
    </>
  );
});

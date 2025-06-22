// @ts-ignore
import React, { useEffect } from "react";

import { Loader2 } from "lucide-react";
import { MessageObject } from "../../business/objects/message-object";
import { getTextMessage } from "../../business/objects/message-object-provider";
import { useApplicationStatusStore } from "../../context/application-context";
import { Message } from "../message";
import { TextInput } from "../text-input";
import { useChatHook } from "./chat-hook";
import styleInline from "./chat.scss?inline";

export const Chat = () => {
  const applicationStatusStore = useApplicationStatusStore();
  const chatHook = useChatHook();

  return (
    <>
      <style>{styleInline}</style>
      <div className="chat-container">
        <div className="messages-container" ref={chatHook.containerRef}>
          {applicationStatusStore.chatMessages.map((msg: MessageObject, index: number) => (
            <Message key={index} message={msg} />
          ))}

          {/* Spinner that executes while the agent is running */}
          {applicationStatusStore.isLoading && (
            <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
              <Loader2 size={32} className="chat-loading-spinner" />
            </div>
          )}
        </div>

        <TextInput onSend={(text) => chatHook.sendMessageToAgent(getTextMessage(text, true))} />
      </div>
    </>
  );
};

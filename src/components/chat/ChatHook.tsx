import { useEffect, useRef } from "react";
import useAiAnalysisService from "../../business/AiAnalysisService";
import { PreferencesStore } from "../../store/PreferencesStore";
import { MessageType } from "../message/MessageType";

const useChatHook = (preferencesStore: PreferencesStore) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    processResponse();
    scrollToBottom(false);
  }, []);

  const processResponse = async () => {
    const messagesNumber = preferencesStore.chatMessages.length;
    if (messagesNumber > 0) {
      const lastMessage = preferencesStore.chatMessages.at(messagesNumber - 1);
      if (lastMessage.sent) {
        try {
          analyzeEvent(lastMessage);
        } catch (error) {
          console.error("Error in AI analysis: ", error);
          sendMessage("Error in AI analysis: " + error.message, false);
        }
      }
    }
  }

  async function analyzeEvent(lastMessage: MessageType) {
    try {
      const analisysSvc = useAiAnalysisService();
      const analysisResultStream = analisysSvc.analyze(lastMessage.text, preferencesStore.modelApiKey);
      let aiResult = "";
      sendMessage(aiResult, false);
      for await (const chunk of analysisResultStream) {
        console.log("Streaming to UI chunk: ", chunk);
        preferencesStore.updateLastMessage(chunk);
      }
    } catch (error) {
      console.error("Error in AI analysis: ", error);
      sendMessage("Error in AI analysis: " + error.message, false);
    }
  }

  const sendMessage = (message: string, sent: boolean = true) => {
    preferencesStore.addMessage(message, sent);
    scrollToBottom();
    processResponse();
  }

  const scrollToBottom = (withDelay: boolean = true) => {
    const el = containerRef.current;
    if (el) {
      const delay = withDelay ? 10 : 0;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, delay);
    }
  }

  return { containerRef, sendMessage }

}

export default useChatHook;

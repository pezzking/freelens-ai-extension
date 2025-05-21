import { useEffect, useRef } from "react";
import getAPiKey from "../../business/provider/AIApiKeyProvider";
import { AgentService, useAgentService } from "../../business/service/AgentService";
import useAiAnalysisService, { AiAnalysisService } from "../../business/service/AiAnalysisService";
import { PreferencesStore } from "../../store/PreferencesStore";
import { MessageType } from "../message/Message";

const useChatHook = (preferencesStore: PreferencesStore) => {
  const apiKey = getAPiKey(preferencesStore);
  const aiAnalisysService: AiAnalysisService = useAiAnalysisService(preferencesStore);
  const agentService: AgentService = useAgentService(preferencesStore.selectedModel, apiKey);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    processResponse();
    scrollToBottom(false);
  }, []);

  const sendMessage = (message: string, sent: boolean = true) => {
    preferencesStore.addMessage(message, sent);
    scrollToBottom();
    processResponse();
  }

  const sendMessageToAgent = (message: string, sent: boolean = true) => {
    console.log("Send message to agent: ", message);
    preferencesStore.addMessage(message, sent);
    scrollToBottom();

    const messagesNumber = preferencesStore.chatMessages.length;
    if (messagesNumber > 0) {
      const lastMessage = preferencesStore.chatMessages.at(messagesNumber - 1);
      if (lastMessage.sent) {
        runAgent(lastMessage);
      }
    }
  }

  const processResponse = async () => {
    const messagesNumber = preferencesStore.chatMessages.length;
    if (messagesNumber > 0) {
      const lastMessage = preferencesStore.chatMessages.at(messagesNumber - 1);
      if (lastMessage.sent) {
        analyzeEvent(lastMessage);
      }
    }
  }

  const analyzeEvent = async (lastMessage: MessageType) => {
    try {
      const analysisResultStream = aiAnalisysService.analyze(lastMessage.text);
      let aiResult = "";
      sendMessage(aiResult, false);
      for await (const chunk of analysisResultStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        preferencesStore.updateLastMessage(chunk);
      }
    } catch (error) {
      console.error("Error in AI analysis: ", error);
      sendMessage("Error in AI analysis: " + error.message, false);
    }
  }

  const runAgent = async (lastMessage: MessageType) => {
    try {
      const agentResponseStream = agentService.run(lastMessage.text, preferencesStore.conversationId);
      let aiResult = "";
      sendMessage(aiResult, false);
      for await (const chunk of agentResponseStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        if (typeof chunk === "string") {
          preferencesStore.updateLastMessage(chunk);
        }

        // check if the chunk is an interrupt, handle it
        if (typeof chunk === "object" && chunk.value) {
          console.log("Agent interrupt: ", chunk);
          sendMessage("Agent interrupt: " + chunk, false);
        }
      }
    } catch (error) {
      console.error("Error while running Freelens Agent: ", error);
      sendMessage("Error while running Freelens Agent: " + error.message, false);
    }
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

  return { containerRef, sendMessage, sendMessageToAgent }

}

export default useChatHook;

import {useEffect, useRef} from "react";
import useAiAnalysisService from "../../business/AiAnalysisService";
import { AiAnalysisService } from "../../business/AiAnalysisService";
import {PreferencesStore} from "../../store/PreferencesStore";
import {MessageType} from "../message/Message";
import { useAgentService, AgentService } from "../../business/agent/AgentService";
import {AIModels} from "../../business/AIModels";

const useChatHook = (preferencesStore: PreferencesStore) => {
  const aiAnalisysService: AiAnalysisService = useAiAnalysisService(preferencesStore);
  const agentService: AgentService = useAgentService(AIModels.GPT_4_O, preferencesStore.openAIApiKey);
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
      const agentResponseStream = agentService.run(lastMessage.text);
      let aiResult = "";
      sendMessage(aiResult, false);
      for await (const chunk of agentResponseStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        preferencesStore.updateLastMessage(chunk);
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

  return {containerRef, sendMessage, sendMessageToAgent }

}

export default useChatHook;

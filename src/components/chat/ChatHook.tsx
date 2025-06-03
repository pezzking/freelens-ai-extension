import { Command } from "@langchain/langgraph";
import { useEffect, useRef } from "react";
import { AgentService, useAgentService } from "../../business/service/AgentService";
import useAiAnalysisService, { AiAnalysisService } from "../../business/service/AiAnalysisService";
import { PreferencesStore } from "../../store/PreferencesStore";
import { MessageType } from "../message/Message";

interface ApprovalInterrupt {
  question: string;
  options: string[];
  actionToApprove: any; // You might want to type this more specifically
  requestString: string;
}

function isApprovalInterrupt(value: unknown): value is ApprovalInterrupt {
  return (
    typeof value === "object" && value !== null &&
    'question' in value &&
    'options' in value &&
    'actionToApprove' in value &&
    'requestString' in value
  );
}

const useChatHook = (preferencesStore: PreferencesStore) => {
  const aiAnalisysService: AiAnalysisService = useAiAnalysisService(preferencesStore);
  const agentService: AgentService = useAgentService(preferencesStore.freelensAgent);
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
        if (preferencesStore.isConversationInterrupted()) {
          console.log("Conversation is interrupted, resuming...");
          preferencesStore.conversationIsNotInterrupted();
          runAgent(new Command({ resume: lastMessage.text }));
        } else {
          const agentInput = {
            modelName: preferencesStore.selectedModel,
            modelApiKey: preferencesStore.apiKey,
            messages: [{ role: "user", content: lastMessage.text }],
          };
          runAgent(agentInput);
        }
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

  const runAgent = async (agentInput: object | Command) => {
    try {
      const agentResponseStream = agentService.run(agentInput, preferencesStore.conversationId);
      let aiResult = "";
      sendMessage(aiResult, false);
      for await (const chunk of agentResponseStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        if (typeof chunk === "string") {
          preferencesStore.updateLastMessage(chunk);
        }

        // check if the chunk is an approval interrupt
        if (typeof chunk === "object" && isApprovalInterrupt(chunk.value)) {
          console.log("Approval interrupt received: ", chunk);
          sendMessage(chunk.value.requestString, false);
          preferencesStore.conversationIsInterrupted();
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

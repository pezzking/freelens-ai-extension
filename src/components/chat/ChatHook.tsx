import {Command} from "@langchain/langgraph";
import {useEffect, useRef} from "react";
import {AgentService, useAgentService} from "../../business/service/AgentService";
import useAiAnalysisService, {AiAnalysisService} from "../../business/service/AiAnalysisService";
import {PreferencesStore} from "../../store/PreferencesStore";
import {getInterruptMessage, getTextMessage} from "../../business/objects/MessageObjectProvider";
import {MessageObject} from "../../business/objects/MessageObject";

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
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = (message: MessageObject) => {
    preferencesStore.addMessage(message);
    scrollToBottom();
  }

  const sendMessageToAgent = (message: string, sent: boolean = true) => {
    console.log("Send message to agent: ", message);
    sendMessage(getTextMessage(message, sent));

    const messagesNumber = preferencesStore.chatMessages.length;
    if (messagesNumber > 0) {
      const lastMessage = preferencesStore.chatMessages.at(messagesNumber - 1);
      if (lastMessage.sent) {
        if (preferencesStore.isConversationInterrupted()) {
          console.log("Conversation is interrupted, resuming...");
          preferencesStore.conversationIsNotInterrupted();
          runAgent(new Command({resume: lastMessage.text}));
        } else {
          const agentInput = {
            modelName: preferencesStore.selectedModel,
            modelApiKey: preferencesStore.apiKey,
            messages: [{role: "user", content: lastMessage.text}],
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
        analyzeEvent(lastMessage)
          .finally(() => scrollToBottom(false))
      }
    }
  }

  processResponse();

  const analyzeEvent = async (lastMessage: MessageObject) => {
    try {
      const analysisResultStream = aiAnalisysService.analyze(lastMessage.text);
      let aiResult = "";
      sendMessage(getTextMessage(aiResult, false));
      for await (const chunk of analysisResultStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        preferencesStore.updateLastMessage(chunk);
      }
    } catch (error) {
      console.error("Error in AI analysis: ", error);
      sendMessage(getTextMessage("Error in AI analysis: " + error.message, false));
    }
  }

  const runAgent = async (agentInput: object | Command) => {
    try {
      preferencesStore.isLoading = true;
      const activeAgent = await preferencesStore.getActiveAgent();
      const agentService: AgentService = useAgentService(activeAgent);
      const agentResponseStream = agentService.run(agentInput, preferencesStore.conversationId);
      let aiResult = "";
      sendMessage(getTextMessage(aiResult, false));
      for await (const chunk of agentResponseStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        if (typeof chunk === "string") {
          preferencesStore.updateLastMessage(chunk);
        }

        // check if the chunk is an approval interrupt
        if (typeof chunk === "object" && isApprovalInterrupt(chunk.value)) {
          console.log("Approval interrupt received: ", chunk);
          sendMessage(getInterruptMessage(chunk, false));
          preferencesStore.conversationIsInterrupted();
        }
      }
    } catch (error) {
      console.error("Error while running Freelens Agent: ", error);

      sendMessage(getTextMessage("Error while running Freelens Agent: " + error.message, false));
    } finally {
      preferencesStore.isLoading = false;
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

  return {containerRef, sendMessage, sendMessageToAgent}

}

export default useChatHook;

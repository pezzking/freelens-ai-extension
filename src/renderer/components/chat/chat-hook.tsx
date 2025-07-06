import { Main } from "@freelensapp/extensions";
import { Command } from "@langchain/langgraph"; // @ts-ignore
import React, { useEffect, useRef } from "react";
import { MessageObject } from "../../business/objects/message-object";
import { getInterruptMessage, getTextMessage } from "../../business/objects/message-object-provider";
import { MessageType } from "../../business/objects/message-type";
import { AgentService, useAgentService } from "../../business/service/agent-service";
import { AiAnalysisService, useAiAnalysisService } from "../../business/service/ai-analysis-service";
import { useApplicationStatusStore } from "../../context/application-context";

export interface ActionToApprove {
  action: string;
  name?: string;
  namespace?: string;
  data?: Main.K8sApi.KubeObject;
}

export interface ApprovalInterrupt {
  question: string;
  options: string[];
  actionToApprove: ActionToApprove;
  requestString: string;
}

function isApprovalInterrupt(value: unknown): value is ApprovalInterrupt {
  return (
    typeof value === "object" &&
    value !== null &&
    "question" in value &&
    "options" in value &&
    "actionToApprove" in value &&
    "requestString" in value
  );
}

export const useChatHook = () => {
  const applicationStatusStore = useApplicationStatusStore();
  const aiAnalysisService: AiAnalysisService = useAiAnalysisService(applicationStatusStore);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // On load scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Perform EXPLAIN when an explain message is sent
  useEffect(() => {
    const explainMessage = applicationStatusStore.explainEvent;
    if (explainMessage && MessageType.EXPLAIN === explainMessage.type) {
      sendMessageToAgent(explainMessage);
      applicationStatusStore.setExplainEvent({} as MessageObject);
    }
  }, [applicationStatusStore.explainEvent]);

  const sendMessage = (message: MessageObject) => {
    applicationStatusStore.addMessage(message);
    scrollToBottom();
  };

  const sendMessageToAgent = (message: MessageObject) => {
    console.log("Send message to agent: ", message);
    sendMessage(message);

    if (message.sent) {
      if (MessageType.EXPLAIN === message.type) {
        analyzeEvent(message).finally(() => scrollToBottom());
      } else if (applicationStatusStore.isConversationInterrupted) {
        console.log("Conversation is interrupted, resuming...");
        applicationStatusStore.setConversationInterrupted(false);
        runAgent(new Command({ resume: message.text })).finally(() => null);
      } else {
        const agentInput = {
          modelName: applicationStatusStore.selectedModel,
          modelApiKey: applicationStatusStore.apiKey,
          messages: [{ role: "user", content: message.text }],
        };
        runAgent(agentInput).finally(() => null);
      }
    } else {
      console.error("You cannot call sendMessageToAgent with 'sent: false'");
    }
  };

  const analyzeEvent = async (lastMessage: MessageObject) => {
    try {
      const analysisResultStream = aiAnalysisService.analyze(lastMessage.text);
      // let aiResult = "";
      // sendMessage(getTextMessage(aiResult, false));
      for await (const chunk of analysisResultStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        applicationStatusStore.updateLastMessage(chunk);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error in AI analysis: ", error);
      sendMessage(getTextMessage(`Error in AI analysis: ${error instanceof Error ? error.message : error}`, false));
    }
  };

  const runAgent = async (agentInput: object | Command) => {
    try {
      applicationStatusStore.setLoading(true);
      const activeAgent = await applicationStatusStore.getActiveAgent();
      const agentService: AgentService = useAgentService(activeAgent);
      const agentResponseStream = agentService.run(agentInput, applicationStatusStore.conversationId);
      for await (const chunk of agentResponseStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        if (typeof chunk === "string") {
          applicationStatusStore.updateLastMessage(chunk);
        }

        // check if the chunk is an approval interrupt
        if (typeof chunk === "object" && isApprovalInterrupt(chunk.value)) {
          console.log("Approval interrupt received: ", chunk);
          sendMessage(getInterruptMessage(chunk, false));
          applicationStatusStore.setConversationInterrupted(true);
        }
      }
    } catch (error) {
      console.error("Error while running Freelens Agent: ", error);

      sendMessage(
        getTextMessage(`Error while running Freelens Agent: ${error instanceof Error ? error.message : error}`, false),
      );
    } finally {
      applicationStatusStore.setLoading(false);
    }
  };

  const scrollToBottom = (withDelay: boolean = true) => {
    const el = containerRef.current;
    if (el) {
      const delay = withDelay ? 10 : 0;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, delay);
    }
  };

  return { containerRef, sendMessage, sendMessageToAgent };
};

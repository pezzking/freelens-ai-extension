import { Command } from "@langchain/langgraph";
import { MessageObject } from "../../renderer/business/objects/message-object";
import { getInterruptMessage, getTextMessage } from "../../renderer/business/objects/message-object-provider";
import { MessageType } from "../../renderer/business/objects/message-type";
import { AgentService, useAgentService } from "../../renderer/business/service/agent-service";
import { AiAnalysisService, useAiAnalysisService } from "../../renderer/business/service/ai-analysis-service";
import { ActionToApprove } from "../../renderer/components/chat";
import { useApplicationStatusStore } from "../../renderer/context/application-context";

export interface ApprovalInterrupt {
  question: string;
  options: string[];
  actionToApprove: ActionToApprove;
  requestString: string;
}

const useChatService = () => {
  const applicationStatusStore = useApplicationStatusStore();
  const aiAnalysisService: AiAnalysisService = useAiAnalysisService(applicationStatusStore);

  const _sendMessage = (message: MessageObject) => {
    applicationStatusStore.addMessage(message);
  };

  const sendMessageToAgent = (message: MessageObject) => {
    try {
      applicationStatusStore.setLoading(true);
      console.log("Send message to agent: ", message);
      _sendMessage(message);

      if (message.sent) {
        if (MessageType.EXPLAIN === message.type) {
          analyzeEvent(message).finally(() => applicationStatusStore.setLoading(false));
        } else if (applicationStatusStore.isConversationInterrupted) {
          console.log("Conversation is interrupted, resuming...");
          runAgent(new Command({ resume: message.text })).finally(() => {
            applicationStatusStore.setConversationInterrupted(false);
            applicationStatusStore.setLoading(false);
          });
        } else {
          const agentInput = {
            modelName: applicationStatusStore.selectedModel,
            modelApiKey: applicationStatusStore.apiKey,
            messages: [{ role: "user", content: message.text }],
          };
          runAgent(agentInput).finally(() => applicationStatusStore.setLoading(false));
        }
      } else {
        console.error("You cannot call sendMessageToAgent with 'sent: false'");
      }
    } catch {
      applicationStatusStore.setLoading(false);
    }
  };

  const changeInterruptStatus = (id: string, status: boolean) => {
    applicationStatusStore.changeInterruptStatus(id, status);
  };

  const analyzeEvent = async (lastMessage: MessageObject) => {
    try {
      const analysisResultStream = aiAnalysisService.analyze(lastMessage.text);
      for await (const chunk of analysisResultStream) {
        // console.log("Streaming to UI chunk: ", chunk);
        applicationStatusStore.updateLastMessage(chunk);
      }
    } catch (error) {
      console.error("Error in AI analysis: ", error);
      _sendMessage(getTextMessage(`Error in AI analysis: ${error instanceof Error ? error.message : error}`, false));
    }
  };

  const isApprovalInterrupt = (value: unknown): value is ApprovalInterrupt => {
    return (
      typeof value === "object" &&
      value !== null &&
      "question" in value &&
      "options" in value &&
      "actionToApprove" in value &&
      "requestString" in value
    );
  };

  const runAgent = async (agentInput: object | Command) => {
    try {
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
          _sendMessage(getInterruptMessage(chunk, false));
          applicationStatusStore.setConversationInterrupted(true);
        }
      }
    } catch (error) {
      console.error("Error while running Freelens Agent: ", error);

      _sendMessage(
        getTextMessage(`Error while running Freelens Agent: ${error instanceof Error ? error.message : error}`, false),
      );
    }
  };

  return { sendMessageToAgent, changeInterruptStatus };
};

export default useChatService;

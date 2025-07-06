import { RemoveMessage } from "@langchain/core/messages";
import { CompiledStateGraph } from "@langchain/langgraph";
import { observer } from "mobx-react";
import { createContext, useContext, useEffect, useState } from "react";
import { PreferencesStore } from "../../common/store";
import { useFreeLensAgentSystem } from "../business/agent/freelens-agent-system";
import { useMcpAgent } from "../business/agent/mcp-agent";
import { MessageObject } from "../business/objects/message-object";
import { AIModelsEnum } from "../business/provider/ai-models";

export interface AppContextType {
  apiKey: string;
  selectedModel: AIModelsEnum;
  mcpEnabled: boolean;
  mcpConfiguration: string;
  explainEvent: MessageObject;
  conversationId: string;
  isLoading: boolean;
  isConversationInterrupted: boolean;
  chatMessages: MessageObject[];
  // TODO replace any with the correct types
  freeLensAgent: CompiledStateGraph<object, object, any, any, any, any> | null;
  // TODO replace any with the correct types
  mcpAgent: CompiledStateGraph<object, object, any, any, any, any> | null;
  setLoading: (isLoading: boolean) => void;
  setConversationInterrupted: (isConversationInterrupted: boolean) => void;
  addMessage: (message: MessageObject) => void;
  updateLastMessage: (newText: string) => void;
  clearChat: () => void;
  getActiveAgent: () => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateConversationId = () => {
  console.log("Generating conversation ID");
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const ApplicationContextProvider = observer(({ children }: { children: React.ReactNode }) => {
  const [preferencesStore, _setPreferenceStore] = useState(PreferencesStore.getInstance());
  const [conversationId, _setConversationId] = useState("");
  const [isLoading, _setLoading] = useState(false);
  const [isConversationInterrupted, _setConversationInterrupted] = useState(false);
  const [chatMessages, _setChatMessages] = useState<MessageObject[]>([]);
  const [freeLensAgent, setFreeLensAgent] = useState<CompiledStateGraph<object, object, any, any, any, any> | null>(
    null,
  );
  const [mcpAgent, setMcpAgent] = useState<CompiledStateGraph<object, object, any, any, any, any> | null>(null);

  const mcpAgentSystem = useMcpAgent();
  const freeLensAgentSystem = useFreeLensAgentSystem();

  // Init variables
  useEffect(() => {
    _setLoading(window.sessionStorage.getItem("isLoading") === "true");
    _setConversationInterrupted(window.sessionStorage.getItem("isConversationInterrupted") === "true");

    getConversationId();

    const stringMessages = window.sessionStorage.getItem("chatMessages");
    stringMessages ? _setChatMessages(JSON.parse(stringMessages)) : _setChatMessages([]);

    initMcpAgent(false).then();
    initFreeLensAgent();
  }, []);

  // Recreate MCP server when MCP configuration change
  useEffect(() => {
    updateMcpConfiguration().then();
  }, [preferencesStore.mcpConfiguration]);

  useEffect(() => {
    console.log("MCP Agent initialized: ", mcpAgent);
  }, [mcpAgent]);

  useEffect(() => {
    console.log("Freelens Agent initialized: ", freeLensAgent);
  }, [freeLensAgent]);

  const getConversationId = () => {
    const storedConversationId = window.sessionStorage.getItem("conversationId");
    if (storedConversationId) {
      _setConversationId(storedConversationId);
      console.log("Using stored conversation ID: ", storedConversationId);
    } else {
      const newConverstionId = generateConversationId();
      _setConversationId(newConverstionId);
      window.sessionStorage.setItem("conversationId", newConverstionId);
      console.log("No stored conversation ID found, generating a new one.");
    }
  };

  const setLoading = (isLoading: boolean) => {
    _setLoading(isLoading);
    window.sessionStorage.setItem("isLoading", String(isLoading));
  };

  const setConversationInterrupted = (isConversationInterrupted: boolean) => {
    _setConversationInterrupted(isConversationInterrupted);
    window.sessionStorage.setItem("isConversationInterrupted", String(isConversationInterrupted));
  };

  const addMessage = (message: MessageObject) => {
    _setChatMessages((prev) => {
      const updated = [...prev, message];
      window.sessionStorage.setItem("chatMessages", JSON.stringify(updated));
      return updated;
    });
  };

  const updateLastMessage = (newText: string) => {
    _setChatMessages((prev) => {
      if (prev.length === 0) return prev;

      const lastIndex = prev.length - 1;
      const messagesCopy = [...prev];
      let lastMessage = messagesCopy[lastIndex];
      messagesCopy[lastIndex] = {
        ...lastMessage,
        text: lastMessage.text + newText,
      };

      window.sessionStorage.setItem("chatMessages", JSON.stringify(messagesCopy));
      return messagesCopy;
    });
  };

  const clearChat = async () => {
    if (freeLensAgent) {
      await cleanAgentMessageHistory(freeLensAgent);
    }
    if (mcpAgent) {
      await cleanAgentMessageHistory(mcpAgent);
    }
    _setChatMessages([]);
    window.sessionStorage.setItem("chatMessages", JSON.stringify([]));
  };

  // TODO replace any with the correct types
  const cleanAgentMessageHistory = async (agent: CompiledStateGraph<object, object, any, any, any, any>) => {
    console.log("Cleaning agent message history for agent: ", agent);
    if (!agent) {
      console.warn("No agent provided to clean message history.");
      return;
    }

    const config = { configurable: { thread_id: conversationId } };

    const messages = (await agent.getState(config)).values.messages;
    console.log("Messages to remove: ", messages);
    if (!messages || messages.length === 0) {
      console.log("No messages to remove.");
      return;
    }

    for (const msg of messages) {
      await agent.updateState(config, { messages: new RemoveMessage({ id: msg.id }) });
    }
  };

  const initMcpAgent = async (forceInitialization: boolean = false) => {
    if (mcpAgent === null || forceInitialization) {
      setMcpAgent(await mcpAgentSystem.buildAgentSystem(preferencesStore.mcpConfiguration));
    } else {
      console.log("MCP Agent was already initialized: ", mcpAgent);
    }
  };

  const initFreeLensAgent = () => {
    if (freeLensAgent === null) {
      setFreeLensAgent(freeLensAgentSystem.buildAgentSystem());
    } else {
      console.log("Freelens Agent was already initialized: ", freeLensAgent);
    }
  };

  const getActiveAgent = async () => {
    if (preferencesStore.mcpEnabled) {
      if (mcpAgent == null) {
        setMcpAgent(await mcpAgentSystem.buildAgentSystem(preferencesStore.mcpConfiguration));
      }
      return mcpAgent;
    }

    if (freeLensAgent == null) {
      setFreeLensAgent(freeLensAgentSystem.buildAgentSystem());
      console.log("Freelens Agent initialized: ", freeLensAgent);
    }
    return freeLensAgent;
  };

  const updateMcpConfiguration = async () => {
    await initMcpAgent(true);
    console.log("MCP Agent configuration updated: ", preferencesStore.mcpConfiguration);
  };

  return (
    <AppContext.Provider
      value={{
        apiKey: preferencesStore.apiKey,
        selectedModel: preferencesStore.selectedModel,
        mcpEnabled: preferencesStore.mcpEnabled,
        mcpConfiguration: preferencesStore.mcpConfiguration,
        explainEvent: preferencesStore.explainEvent,
        conversationId,
        isLoading,
        isConversationInterrupted,
        chatMessages,
        mcpAgent,
        freeLensAgent,
        setLoading,
        setConversationInterrupted,
        addMessage,
        updateLastMessage,
        clearChat,
        getActiveAgent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
});

export const useApplicationStatusStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApplicationStatusStore must be used within ApplicationContextProvider");
  return context;
};

import { Common } from "@freelensapp/extensions";
import { CompiledStateGraph } from "@langchain/langgraph";
import { makeObservable, observable, toJS } from "mobx";
import { useFreelensAgentSystem } from "../business/agent/FreelensAgentSystem";
import { useMcpAgent } from "../business/agent/McpAgent";
import { AIModels } from "../business/provider/AIModels";
import { MessageType } from "../components/message/Message";

export type PreferencesModel = {
  apiKey: string;
  selectedModel: AIModels;
  mcpEnabled: boolean;
};

const generateConversationId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export class PreferencesStore extends Common.Store.ExtensionStore<PreferencesModel> {
  @observable conversationId: string = generateConversationId();
  @observable _conversationInterrupted: boolean = false;
  @observable apiKey: string = "";
  @observable selectedModel: AIModels = AIModels.GPT_3_5_TURBO;
  @observable private _chatMessages: MessageType[] = [];

  @observable freelensAgent: CompiledStateGraph<object, object, string, any, any, any> = null;
  @observable mcpAgent: CompiledStateGraph<object, object, string, any, any, any> = null;
  @observable mcpEnabled: boolean = false;

  constructor() {
    super({
      configName: "freelens-ai-preferences-store",
      defaults: {
        apiKey: "",
        selectedModel: AIModels.GPT_3_5_TURBO,
        mcpEnabled: false
      }
    });
    this.initMcpAgent();
    this.initFreelensAgent();
    makeObservable(this);
  }

  async initMcpAgent() {
    this.mcpAgent = await useMcpAgent().buildAgentSystem();
    console.log("MCP Agent initialized: ", this.mcpAgent);
  }

  initFreelensAgent() {
    this.freelensAgent = useFreelensAgentSystem().buildAgentSystem();
    console.log("Freelens Agent initialized: ", this.freelensAgent);
  }

  get chatMessages(): MessageType[] {
    return this._chatMessages;
  }

  addMessage = (message: string, sent: boolean = true) => {
    this._chatMessages.push({ text: message, sent: sent });
  }

  updateLastMessage = (newText: string) => {
    if (this._chatMessages.length > 0) {
      const lastMessage = this._chatMessages.pop();
      this._chatMessages.push({ text: lastMessage.text + newText, sent: lastMessage.sent });
    }
  }


  conversationIsInterrupted = () => { this._conversationInterrupted = true; }
  conversationIsNotInterrupted = () => { this._conversationInterrupted = false; }
  isConversationInterrupted = () => this._conversationInterrupted;

  getActiveAgent = async () => {
    if (this.mcpEnabled) {
      if (this.mcpAgent == null) {
        this.mcpAgent = await useMcpAgent().buildAgentSystem();
      }
      return this.mcpAgent;
    }

    if (this.freelensAgent == null) {
      this.freelensAgent = useFreelensAgentSystem().buildAgentSystem();
    }
    return this.freelensAgent;
  }

  protected fromStore = (preferencesModel: PreferencesModel): void => {
    this.apiKey = preferencesModel.apiKey;
    this.selectedModel = preferencesModel.selectedModel;
    this.mcpEnabled = preferencesModel.mcpEnabled;
  }

  toJSON = (): PreferencesModel => {
    const value: PreferencesModel = {
      apiKey: this.apiKey,
      selectedModel: this.selectedModel,
      mcpEnabled: this.mcpEnabled
    };
    return toJS(value);
  }
}

import { Common } from "@freelensapp/extensions";
import { makeObservable, observable, toJS } from "mobx";
import { useFreelensAgentSystem } from "../business/agent/FreelensAgentSystem";
import { AIModels } from "../business/provider/AIModels";
import { MessageType } from "../components/message/Message";

export type PreferencesModel = {
  apiKey: string;
  selectedModel: AIModels;
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
  @observable freelensAgent = useFreelensAgentSystem().buildMultiAgentSystem();

  constructor() {
    super({
      configName: "freelens-ai-preferences-store",
      defaults: {
        apiKey: "",
        selectedModel: AIModels.GPT_3_5_TURBO
      }
    });
    makeObservable(this);
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

  protected fromStore = (preferencesModel: PreferencesModel): void => {
    this.apiKey = preferencesModel.apiKey;
    this.selectedModel = preferencesModel.selectedModel;
  }

  conversationIsInterrupted = () => { this._conversationInterrupted = true; }
  conversationIsNotInterrupted = () => { this._conversationInterrupted = false; }
  isConversationInterrupted = () => this._conversationInterrupted;

  toJSON = (): PreferencesModel => {
    const value: PreferencesModel = {
      apiKey: this.apiKey,
      selectedModel: this.selectedModel,
    };

    return toJS(value);
  }
}

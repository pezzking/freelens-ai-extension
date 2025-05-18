import { Common } from "@freelensapp/extensions";
import { makeObservable, observable, toJS } from "mobx";
import { MessageType } from "../components/message/Message";
import { AIModels } from "../business/AIModels";

export type PreferencesModel = {
  openAIApiKey: string;
  deepSeekApiKey: string;
  selectedModel: string;
};

export class PreferencesStore extends Common.Store.ExtensionStore<PreferencesModel> {
  @observable openAIApiKey: string = "";
  @observable deepSeekApiKey: string = "";
  @observable selectedModel: string = AIModels.GPT_3_5_TURBO;
  @observable private _chatMessages: MessageType[] = [];

  constructor() {
    super({
      configName: "freelens-ai-preferences-store",
      defaults: {
        modelApiKey: "",
        deepSeekApiKey: "",
        selectedModel: AIModels.GPT_3_5_TURBO
      }
    });
    makeObservable(this);
  }

  get chatMessages(): MessageType[] {
    return this._chatMessages;
  }

  addMessage = (message: string, sent: boolean = true) => {
    this._chatMessages.push({text: message, sent: sent});
  }

  updateLastMessage = (newText: string) => {
    if (this._chatMessages.length > 0) {
      const lastMessage = this._chatMessages.pop();
      this._chatMessages.push({text: lastMessage.text + newText, sent: lastMessage.sent});
    }
  }

  protected fromStore = (preferencesModel: PreferencesModel): void => {
    this.openAIApiKey = preferencesModel.openAIApiKey;
    this.deepSeekApiKey = preferencesModel.deepSeekApiKey;
    this.selectedModel = preferencesModel.selectedModel;
  }

  toJSON = (): PreferencesModel => {
    const value: PreferencesModel = {
      openAIApiKey: this.openAIApiKey,
      deepSeekApiKey: this.deepSeekApiKey,
      selectedModel: this.selectedModel,
    };

    return toJS(value);
  }
}

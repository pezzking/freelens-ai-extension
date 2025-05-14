import {Common} from "@freelensapp/extensions";
import {makeObservable, observable, toJS} from "mobx";
import {MessageType} from "../components/message/MessageType";

export type PreferencesModel = {
  isChatGptApiKeySelected: boolean;
  chatGptApiKey: string;
};

export class PreferencesStore extends Common.Store.ExtensionStore<PreferencesModel> {
  @observable isChatGptApiKeySelected = true;
  @observable chatGptApiKey = "";
  @observable private _chatMessages: MessageType[] = [];

  constructor() {
    super({
      configName: "freelens-ai-preferences-store",
      defaults: {
        isChatGptApiKeySelected: true,
        chatGptApiKey: ""
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

  protected fromStore = (preferencesModel: PreferencesModel): void => {
    this.isChatGptApiKeySelected = preferencesModel.isChatGptApiKeySelected;
    this.chatGptApiKey = preferencesModel.chatGptApiKey;
  }

  toJSON = (): PreferencesModel => {
    const value: PreferencesModel = {
      isChatGptApiKeySelected: this.isChatGptApiKeySelected,
      chatGptApiKey: this.chatGptApiKey,
    };

    return toJS(value);
  }
}

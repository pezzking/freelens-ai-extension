import { Common } from "@freelensapp/extensions";
import { makeObservable, observable, toJS } from "mobx";
import { MessageObject } from "../../renderer/business/objects/message-object";
import { AIModelsEnum } from "../../renderer/business/provider/ai-models";

export interface PreferencesModel {
  openAIEnabled: boolean;
  openAIKey: string;
  googleAIEnabled: boolean;
  googleAIKey: string;
  selectedModel: AIModelsEnum;
  mcpEnabled: boolean;
  mcpConfiguration: string;
  customOpenAIEnabled: boolean;
  customOpenAIBaseUrl: string;
  customOpenAIKey: string;
  customOpenAIModelName: string;
  lmStudioEnabled: boolean;
  lmStudioBaseUrl: string;
  lmStudioModelName: string;
  ollamaEnabled: boolean;
  ollamaBaseUrl: string;
  ollamaModelName: string;
}

export class PreferencesStore extends Common.Store.ExtensionStore<PreferencesModel> {
  // Persistent
  @observable accessor openAIEnabled: boolean = true;
  @observable accessor openAIKey: string = "";
  @observable accessor googleAIEnabled: boolean = true;
  @observable accessor googleAIKey: string = "";
  @observable accessor selectedModel: AIModelsEnum = AIModelsEnum.GPT_3_5_TURBO;
  @observable accessor mcpEnabled: boolean = false;
  @observable accessor mcpConfiguration: string = "";
  @observable accessor customOpenAIEnabled: boolean = false;
  @observable accessor customOpenAIBaseUrl: string = "";
  @observable accessor customOpenAIKey: string = "";
  @observable accessor customOpenAIModelName: string = "";
  @observable accessor lmStudioEnabled: boolean = false;
  @observable accessor lmStudioBaseUrl: string = "";
  @observable accessor lmStudioModelName: string = "";
  @observable accessor ollamaEnabled: boolean = false;
  @observable accessor ollamaBaseUrl: string = "";
  @observable accessor ollamaModelName: string = "";

  // Not persistent
  @observable accessor explainEvent: MessageObject = {} as MessageObject;

  constructor() {
    super({
      configName: "freelens-ai-preferences-store",
      defaults: {
        openAIEnabled: true,
        openAIKey: "",
        googleAIEnabled: true,
        googleAIKey: "",
        selectedModel: AIModelsEnum.GPT_3_5_TURBO,
        mcpEnabled: false,
        mcpConfiguration: JSON.stringify(
          {
            mcpServers: {
              kubernetes: {
                command: "npx",
                args: ["mcp-server-kubernetes"],
              },
            },
          },
          null,
          2,
        ),
        customOpenAIEnabled: false,
        customOpenAIBaseUrl: "",
        customOpenAIKey: "",
        customOpenAIModelName: "gpt-4o",
        lmStudioEnabled: false,
        lmStudioBaseUrl: "http://127.0.0.1:1234",
        lmStudioModelName: "local-model",
        ollamaEnabled: false,
        ollamaBaseUrl: "http://127.0.0.1:11434",
        ollamaModelName: "llama3.2",
      },
    });
    makeObservable(this);
  }

  updateMcpConfiguration = async (newMcpConfiguration: string) => {
    this.mcpConfiguration = newMcpConfiguration;
  };

  fromStore = (preferencesModel: PreferencesModel): void => {
    this.openAIEnabled = preferencesModel.openAIEnabled ?? true;
    this.openAIKey = preferencesModel.openAIKey;
    this.googleAIEnabled = preferencesModel.googleAIEnabled ?? true;
    this.googleAIKey = preferencesModel.googleAIKey;
    this.selectedModel = preferencesModel.selectedModel;
    this.mcpEnabled = preferencesModel.mcpEnabled;
    this.mcpConfiguration = preferencesModel.mcpConfiguration;
    this.customOpenAIEnabled = preferencesModel.customOpenAIEnabled;
    this.customOpenAIBaseUrl = preferencesModel.customOpenAIBaseUrl;
    this.customOpenAIKey = preferencesModel.customOpenAIKey;
    this.customOpenAIModelName = preferencesModel.customOpenAIModelName;
    this.lmStudioEnabled = preferencesModel.lmStudioEnabled;
    this.lmStudioBaseUrl = preferencesModel.lmStudioBaseUrl;
    this.lmStudioModelName = preferencesModel.lmStudioModelName;
    this.ollamaEnabled = preferencesModel.ollamaEnabled;
    this.ollamaBaseUrl = preferencesModel.ollamaBaseUrl;
    this.ollamaModelName = preferencesModel.ollamaModelName;
  };

  toJSON = (): PreferencesModel => {
    const value: PreferencesModel = {
      openAIEnabled: this.openAIEnabled,
      openAIKey: this.openAIKey,
      googleAIEnabled: this.googleAIEnabled,
      googleAIKey: this.googleAIKey,
      selectedModel: this.selectedModel,
      mcpEnabled: this.mcpEnabled,
      mcpConfiguration: this.mcpConfiguration,
      customOpenAIEnabled: this.customOpenAIEnabled,
      customOpenAIBaseUrl: this.customOpenAIBaseUrl,
      customOpenAIKey: this.customOpenAIKey,
      customOpenAIModelName: this.customOpenAIModelName,
      lmStudioEnabled: this.lmStudioEnabled,
      lmStudioBaseUrl: this.lmStudioBaseUrl,
      lmStudioModelName: this.lmStudioModelName,
      ollamaEnabled: this.ollamaEnabled,
      ollamaBaseUrl: this.ollamaBaseUrl,
      ollamaModelName: this.ollamaModelName,
    };
    return toJS(value);
  };
}

import { Common } from "@freelensapp/extensions";
import { makeObservable, observable, toJS } from "mobx";
import { MessageObject } from "../../renderer/business/objects/message-object";
import { AIModelsEnum } from "../../renderer/business/provider/ai-models";

export interface PreferencesModel {
  openAIKey: string;
  googleAIKey: string;
  selectedModel: AIModelsEnum;
  mcpEnabled: boolean;
  mcpConfiguration: string;
  customOpenAIBaseUrl: string;
  customOpenAIKey: string;
  customOpenAIModelName: string;
  lmStudioBaseUrl: string;
  lmStudioModelName: string;
  ollamaBaseUrl: string;
  ollamaModelName: string;
}

export class PreferencesStore extends Common.Store.ExtensionStore<PreferencesModel> {
  // Persistent
  @observable accessor openAIKey: string = "";
  @observable accessor googleAIKey: string = "";
  @observable accessor selectedModel: AIModelsEnum = AIModelsEnum.GPT_3_5_TURBO;
  @observable accessor mcpEnabled: boolean = false;
  @observable accessor mcpConfiguration: string = "";
  @observable accessor customOpenAIBaseUrl: string = "";
  @observable accessor customOpenAIKey: string = "";
  @observable accessor customOpenAIModelName: string = "";
  @observable accessor lmStudioBaseUrl: string = "";
  @observable accessor lmStudioModelName: string = "";
  @observable accessor ollamaBaseUrl: string = "";
  @observable accessor ollamaModelName: string = "";

  // Not persistent
  @observable accessor explainEvent: MessageObject = {} as MessageObject;

  constructor() {
    super({
      configName: "freelens-ai-preferences-store",
      defaults: {
        openAIKey: "",
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
        customOpenAIBaseUrl: "",
        customOpenAIKey: "",
        customOpenAIModelName: "gpt-4o",
        lmStudioBaseUrl: "http://127.0.0.1:1234/v1",
        lmStudioModelName: "local-model",
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
    this.openAIKey = preferencesModel.openAIKey;
    this.googleAIKey = preferencesModel.googleAIKey;
    this.selectedModel = preferencesModel.selectedModel;
    this.mcpEnabled = preferencesModel.mcpEnabled;
    this.mcpConfiguration = preferencesModel.mcpConfiguration;
    this.customOpenAIBaseUrl = preferencesModel.customOpenAIBaseUrl;
    this.customOpenAIKey = preferencesModel.customOpenAIKey;
    this.customOpenAIModelName = preferencesModel.customOpenAIModelName;
    this.lmStudioBaseUrl = preferencesModel.lmStudioBaseUrl;
    this.lmStudioModelName = preferencesModel.lmStudioModelName;
    this.ollamaBaseUrl = preferencesModel.ollamaBaseUrl;
    this.ollamaModelName = preferencesModel.ollamaModelName;
  };

  toJSON = (): PreferencesModel => {
    const value: PreferencesModel = {
      openAIKey: this.openAIKey,
      googleAIKey: this.googleAIKey,
      selectedModel: this.selectedModel,
      mcpEnabled: this.mcpEnabled,
      mcpConfiguration: this.mcpConfiguration,
      customOpenAIBaseUrl: this.customOpenAIBaseUrl,
      customOpenAIKey: this.customOpenAIKey,
      customOpenAIModelName: this.customOpenAIModelName,
      lmStudioBaseUrl: this.lmStudioBaseUrl,
      lmStudioModelName: this.lmStudioModelName,
      ollamaBaseUrl: this.ollamaBaseUrl,
      ollamaModelName: this.ollamaModelName,
    };
    return toJS(value);
  };
}

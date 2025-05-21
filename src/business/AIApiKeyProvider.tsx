import AIModelInfos, {AIProviders} from "./AIModels";
import {PreferencesStore} from "../store/PreferencesStore";

const getaPiKey = (preferencesStore: PreferencesStore) => {
  const provider = AIModelInfos[preferencesStore.selectedModel].provider
  return AIProviders.OPEN_AI === provider ? preferencesStore.openAIApiKey : preferencesStore.deepSeekApiKey;
}

export default getaPiKey;

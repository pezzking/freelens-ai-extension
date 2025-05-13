import {PreferencesStore} from "../../store/PreferencesStore";
import {Renderer} from "@freelensapp/extensions";

const {
  Navigation: {navigate}
} = Renderer;

const useMenuEntryHook = (preferencesStore: PreferencesStore) => {

  const openTab = (message: string) => {
    const prompt = "Could you explain this message?\n\n";
    preferencesStore.addMessage(`${prompt}${message}`, true);
    navigate("/extension/freelensapp--freelens-ai/freelens-ai-page");
  }

  return {openTab}
}

export default useMenuEntryHook;

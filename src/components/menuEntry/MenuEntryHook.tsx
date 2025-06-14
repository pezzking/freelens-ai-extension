import {PreferencesStore} from "../../store/PreferencesStore";
import {Renderer} from "@freelensapp/extensions";
import {getExplainMessage} from "../../business/objects/MessageObjectProvider";
import useChatHook from "../chat/ChatHook";

const {
  Navigation: {navigate}
} = Renderer;

const useMenuEntryHook = (preferencesStore: PreferencesStore) => {
  const chatHook = useChatHook(preferencesStore)

  const openTab = (message: string) => {
    const prompt = "Could you explain this message?\n\n";
    chatHook.sendMessageToAgent(getExplainMessage(`${prompt}${message}`));
    navigate("/extension/freelensapp--freelens-ai/freelens-ai-page");
  }

  return {openTab}
}

export default useMenuEntryHook;

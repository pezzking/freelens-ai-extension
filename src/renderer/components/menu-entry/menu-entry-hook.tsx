import { Renderer } from "@freelensapp/extensions";
import { getExplainMessage } from "../../business/objects/message-object-provider";

import type { PreferencesStore } from "../../../common/store";

const {
  Navigation: { navigate },
} = Renderer;

export const useMenuEntryHook = (preferencesStore: PreferencesStore) => {
  const openTab = (message: string) => {
    const prompt = "Could you explain this message?\n\n";
    preferencesStore.explainEvent = getExplainMessage(`${prompt}${message}`);
    navigate("/extension/freelensapp--ai-extension/ai-extension-main-page");
  };

  return { openTab };
};

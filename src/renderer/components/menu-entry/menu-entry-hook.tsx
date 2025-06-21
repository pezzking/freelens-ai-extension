// @ts-ignore
import React from "react";

import { Renderer } from "@freelensapp/extensions";
import { PreferencesStore } from "../../../common/store";
import { getExplainMessage } from "../../business/objects/message-object-provider";
import { useChatHook } from "../chat";

const {
  Navigation: { navigate },
} = Renderer;

export const useMenuEntryHook = (preferencesStore: PreferencesStore) => {
  const chatHook = useChatHook(preferencesStore);

  const openTab = (message: string) => {
    const prompt = "Could you explain this message?\n\n";
    chatHook.sendMessageToAgent(getExplainMessage(`${prompt}${message}`));
    navigate("/extension/freelensapp--ai-extension/ai-extension-main-page");
  };

  return { openTab };
};

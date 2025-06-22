// @ts-ignore
import React from "react";

import { Renderer } from "@freelensapp/extensions";
import { PreferencesStore } from "../../../common/store";
import { getExplainMessage } from "../../business/objects/message-object-provider";

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

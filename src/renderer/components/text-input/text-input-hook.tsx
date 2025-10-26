import { Renderer } from "@freelensapp/extensions";
import React, { useEffect, useRef, useState } from "react";
import { PreferencesStore } from "../../../common/store";
import { AIModelInfos, AIModelsEnum, AIProviders, toAIModelEnum } from "../../business/provider/ai-models";
import { useApplicationStatusStore } from "../../context/application-context";

import type { SingleValue } from "react-select";

type TextInputHookProps = {
  onSend: (message: string) => void;
};

const MAX_ROWS = 5;

export const useTextInput = ({ onSend }: TextInputHookProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const applicationStatusStore = useApplicationStatusStore();
  const preferencesStore = PreferencesStore.getInstanceOrCreate<PreferencesStore>();

  // Filter model selections based on enabled providers
  const modelSelections = Object.entries(AIModelInfos)
    .filter(([_, aiModelInfo]) => {
      // Show OpenAI models only if enabled
      if (aiModelInfo.provider === AIProviders.OPEN_AI) {
        return preferencesStore.openAIEnabled;
      }

      // Show Google AI models only if enabled
      if (aiModelInfo.provider === AIProviders.GOOGLE) {
        return preferencesStore.googleAIEnabled;
      }

      // Only show custom providers if they are enabled
      if (aiModelInfo.provider === AIProviders.CUSTOM_OPENAI) {
        return preferencesStore.customOpenAIEnabled;
      }
      if (aiModelInfo.provider === AIProviders.LMSTUDIO) {
        return preferencesStore.lmStudioEnabled;
      }
      if (aiModelInfo.provider === AIProviders.OLLAMA) {
        return preferencesStore.ollamaEnabled;
      }

      return false;
    })
    .map(([value, aiModelInfo]) => {
      return { value, label: aiModelInfo.description };
    });

  const adaptTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.rows = 1;

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const neededRows = Math.ceil(textarea.scrollHeight / lineHeight);

    textarea.rows = Math.min(neededRows, MAX_ROWS);
  };

  useEffect(() => {
    adaptTextareaHeight();
  }, [message]);

  const handleSend = () => {
    if (!applicationStatusStore.isLoading && message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onChangeModel = (option: SingleValue<Renderer.Component.SelectOption<AIModelsEnum>>) => {
    if (option) {
      const selectedModel = toAIModelEnum(option.value);
      if (selectedModel) {
        applicationStatusStore.setSelectedModel(selectedModel);
      }
    }
  };

  return { message, textareaRef, modelSelections, setMessage, handleKeyDown, handleSend, onChangeModel };
};

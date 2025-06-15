import { Renderer } from "@freelensapp/extensions";
import React, { useEffect, useRef, useState } from "react";
import type { SingleValue } from "react-select";
import { AIModelInfos, toAIModelEnum } from "../../../common/business/provider/ai-models";
import { PreferencesStore } from "../../../common/store";

type TextInputHookProps = {
  onSend: (message: string) => void;
  preferencesStore: PreferencesStore;
};

const MAX_ROWS = 5;

export const useTextInput = ({ onSend, preferencesStore }: TextInputHookProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelections = Object.entries(AIModelInfos).map(([value, aiModelInfo]) => {
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
    if (!preferencesStore.isLoading && message.trim()) {
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

  const onChangeModel = (option: SingleValue<Renderer.Component.SelectOption<string>>) => {
    if (option) {
      const selectedModel = toAIModelEnum(option.value);
      if (selectedModel) {
        preferencesStore.selectedModel = selectedModel;
      }
    }
  };

  return { message, textareaRef, modelSelections, setMessage, handleKeyDown, handleSend, onChangeModel };
};

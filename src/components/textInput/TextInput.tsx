import {Renderer} from "@freelensapp/extensions";
import {Eraser, SendHorizonal} from "lucide-react";
import {observer} from "mobx-react";
import React from "react";
import {PreferencesStore} from "../../store/PreferencesStore";
import "./TextInput.scss";
import useTextInput from "./TextInputHook";

const {Component: {Select}} = Renderer;

type TextInputProps = {
  onSend: (message: string) => void;
};

const TextInput = observer(({onSend}: TextInputProps) => {
  // @ts-ignore
  const preferencesStore = PreferencesStore.getInstance();
  const textInputHook = useTextInput({onSend, preferencesStore});

  return (
    <div className="text-input-container">
      <div className="text-input-inner-wrapper">
        <textarea
          ref={textInputHook.textareaRef}
          rows={1}
          className="text-input-textarea"
          placeholder="Write a message..."
          value={textInputHook.message}
          onChange={(e) => textInputHook.setMessage(e.target.value)}
          onKeyDown={textInputHook.handleKeyDown}
        />
        <div className="text-input-buttons-container">
          <button
            className="chat-button chat-clear-button"
            onClick={async () => preferencesStore.clearChat()}
            disabled={preferencesStore.chatMessages.length === 0}
            title="Clear chat"
          >
            <Eraser size={20}/>
          </button>
          <div style={{display: "flex", alignItems: "center"}}>
            <Select
              id="update-channel-input"
              options={textInputHook.modelSelections}
              value={preferencesStore.selectedModel}
              onChange={textInputHook.onChangeModel}
              themeName="lens"
              className="text-input-select-box"
            />
            <button
              className="text-input-send-button"
              onClick={textInputHook.handleSend}
              disabled={preferencesStore.isLoading || !textInputHook.message.trim()}
              title="Send"
              id="send-button"
            >
              <SendHorizonal size={25}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
})

export default TextInput;

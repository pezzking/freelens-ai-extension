import React from "react";
import {SendHorizonal} from "lucide-react";
import "./TextInput.scss";
import useTextInput from "./TextInputHook";

type TextInputProps = {
  onSend: (message: string) => void;
};

function TextInput({ onSend }: TextInputProps) {
  const textInputHook = useTextInput({onSend});

  return (
    <div className="text-input-container">
      <div className="text-input-inner-wrapper">
        <div className="text-input-box">
          <textarea
            rows={1}
            className="text-input-textarea"
            placeholder="Write a message..."
            value={textInputHook.message}
            onChange={(e) => textInputHook.setMessage(e.target.value)}
            onKeyDown={textInputHook.handleKeyDown}
          />
          <button
            className="text-input-send-button"
            onClick={textInputHook.handleSend}
            disabled={!textInputHook.message.trim()}
            title="Send"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextInput;

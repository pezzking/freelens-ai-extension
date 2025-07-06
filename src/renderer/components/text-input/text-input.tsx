import { Renderer } from "@freelensapp/extensions";
import { Eraser, SendHorizonal } from "lucide-react";
import { AIModelsEnum } from "../../business/provider/ai-models";
import { useApplicationStatusStore } from "../../context/application-context";
import { useTextInput } from "./text-input-hook";
import styleInline from "./text-input.scss?inline";

const {
  Component: { Select },
} = Renderer;

type TextInputOption = Renderer.Component.SelectOption<AIModelsEnum>;

type TextInputProps = {
  onSend: (message: string) => void;
};

export const TextInput = ({ onSend }: TextInputProps) => {
  const applicationStatusStore = useApplicationStatusStore();
  const textInputHook = useTextInput({ onSend });
  const textInputOptions = textInputHook.modelSelections as TextInputOption[];

  return (
    <>
      <style>{styleInline}</style>
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
              onClick={async () => applicationStatusStore.clearChat()}
              disabled={applicationStatusStore.chatMessages.length === 0}
              title="Clear chat"
            >
              <Eraser size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Select
                id="update-channel-input"
                options={textInputOptions}
                value={applicationStatusStore.selectedModel}
                onChange={textInputHook.onChangeModel}
                themeName="lens"
                className="text-input-select-box"
              />
              <button
                className="text-input-send-button"
                onClick={textInputHook.handleSend}
                disabled={applicationStatusStore.isLoading || !textInputHook.message.trim()}
                title="Send"
                id="send-button"
              >
                <SendHorizonal size={25} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

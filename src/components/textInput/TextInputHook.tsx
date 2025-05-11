import React, {useState} from "react";

type TextInputHookProps = {
  onSend: (message: string) => void;
};

const useTextInput = ({onSend}: TextInputHookProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
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

  return {message, setMessage, handleKeyDown, handleSend}

}

export default useTextInput;

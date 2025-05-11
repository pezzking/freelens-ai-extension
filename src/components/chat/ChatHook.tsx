import {useState} from "react";
import {MessageType} from "../message/MessageType";

const useChatHook = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  const sendMessage = (message: string) => {
    setMessages([...messages, {sent: true, text: message}])
  }

  return {messages, sendMessage}

}

export default useChatHook;

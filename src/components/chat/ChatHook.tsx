import {useState} from "react";
import {MessageType} from "../message/MessageType";
import useAnalysisSvc from "../../services/AnalysisSvc";

const useChatHook = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const analysisSvc = useAnalysisSvc();

  const sendMessage = async (message: string) => {
    setMessages(prev => [...prev, {sent: true, text: message}])
    const result = await analysisSvc.analyze(message);
    setMessages(prev => [...prev, {sent: false, text: result}])
  }

  return {messages, sendMessage}

}

export default useChatHook;

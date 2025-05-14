import {PreferencesStore} from "../../store/PreferencesStore";
import {useEffect, useRef} from "react";

const useChatHook = (preferencesStore: PreferencesStore) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    processResponse();
    scrollToBottom(false);
  }, []);

  const processResponse = () => {
    const messagesNumber = preferencesStore.chatMessages.length;
    if (messagesNumber > 0) {
      const lastMessage = preferencesStore.chatMessages.at(messagesNumber - 1);
      if (lastMessage.sent) {
        // TODO: Handle model response here
        // const response = modelHook.ask();
        sendMessage("", false);
      }
    }
  }

  const sendMessage = (message: string, sent: boolean = true) => {
    preferencesStore.addMessage(message, sent);
    scrollToBottom();
    processResponse();
  }

  const scrollToBottom = (withDelay: boolean = true) => {
    const el = containerRef.current;
    if (el) {
      const delay = withDelay ? 10 : 0;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, delay);
    }
  }

  return {containerRef, sendMessage}

}

export default useChatHook;

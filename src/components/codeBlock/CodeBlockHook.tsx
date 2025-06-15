import {use, useEffect, useState} from "react";
import {Renderer} from "@freelensapp/extensions";
import codeBlock from "./CodeBlock";

const {
  Component: {
    createTerminalTab,
    terminalStore,
  },
} = Renderer;

type useCodeBlockHookProps = {
  children: string,
  language: string,
}

const useCodeBlockHook = ({children, language}: useCodeBlockHookProps) => {
  const [copied, setCopied] = useState(false)
  const [text, setText] = useState("");
  const hasMultipleLines = text.split('\n').length > 1
  const shellId = "FreeLensAI-tabid";

  useEffect(() => {
    const beautified = String(children).replace(/\n$/, '');
    if ("json" === language) {
      try {
        setText(JSON.stringify(JSON.parse(beautified), null, 2));
      } catch (ex) {
        setText(beautified);
        console.error(`An error occurred while parsing json`, ex);
      }
    } else {
      setText(beautified);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    })
  }

  const isExecutable = (language: string) => {
    return ['', 'bash', 'sh', 'shell', 'zsh', 'cmd', 'powershell', 'ps1', 'pwsh', 'dos', 'fish'].includes(language);
  }

  const executeCommand = () => {
    let terminal = terminalStore.getTerminal(shellId);
    if (terminal === undefined) {
      createTerminalTab({title: 'FreeLens AI', id: shellId});
    }

    // Multiline commands are executed in reverse order by the terminal.
    // I reverse them to ensure they are executed in the correct order.
    const parts = text.split("\n");
    parts.reverse();
    const reversedCommand = parts.join("\n");

    terminalStore.sendCommand(reversedCommand, {
      enter: true,
      tabId: shellId,
    });
  }

  return {copied, text, hasMultipleLines, handleCopy, executeCommand, isExecutable}
}

export default useCodeBlockHook;

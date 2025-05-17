import {useState} from "react";
import {Renderer} from "@freelensapp/extensions";

const {
  Component: {
    createTerminalTab,
    terminalStore,
  },
} = Renderer;

type useCodeBlockHookProps = {
  children: string
}

const useCodeBlockHook = ({children}: useCodeBlockHookProps) => {
  const [copied, setCopied] = useState(false)
  const text = String(children).replace(/\n$/, '')
  const hasMultipleLines = text.split('\n').length > 1
  const [shellId, setShellId] = useState();

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    })
  }

  const isExecutable = (language: string) => {
    return ['bash', 'sh', 'shell', 'zsh', 'cmd', 'powershell', 'ps1', 'pwsh', 'dos', 'fish'].includes(language);
  }

  const executeCommand = () => {
    let terminalId = null;
    let terminal = terminalStore.getTerminal(shellId);
    if (terminal === undefined) {
      const shell = createTerminalTab({title: 'FreeLens AI'});
      setShellId(shell.id);
      terminalId = shell.id;
    } else {
      terminalId = terminal.tabId;
    }

    terminalStore.sendCommand(text, {
      enter: true,
      tabId: terminalId,
    });
  }

  return {copied, text, hasMultipleLines, handleCopy, executeCommand, isExecutable}
}

export default useCodeBlockHook;

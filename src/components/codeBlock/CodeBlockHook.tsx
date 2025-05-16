import {useState} from "react";

type useCodeBlockHookProps = {
  children: string
}

const useCodeBlockHook = ({children}: useCodeBlockHookProps) => {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')
  const hasMultipleLines = code.split('\n').length > 1

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    })
  }

  const handleRun = () => {
    // TODO: Run code in terminal
  }

  return {copied, code, hasMultipleLines, handleCopy, handleRun}
}

export default useCodeBlockHook;

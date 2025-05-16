import React from "react";
import {Copy, Play} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import './CodeBlock.scss';
import useCodeBlockHook from "./CodeBlockHook";

type CodeBlockProps = {
  children: string
  language: string
}

const CodeBlock = ({children, language}: CodeBlockProps) => {
  const codeBlockHook = useCodeBlockHook({children});

  return (
    <div className="code-block-container">
      <div className={"code-block-toolbar"}>
        <button onClick={codeBlockHook.handleRun} className={"code-block-button code-block-runButton"}>
          <Play size={16}/>
        </button>

        <button onClick={codeBlockHook.handleCopy} className={"code-block-button code-block-copy-button"}>
          {codeBlockHook.copied && <span className="code-block-copied-text">Copied!</span>}
          <Copy size={16}/>
        </button>
      </div>
      <SyntaxHighlighter
        PreTag="div"
        language={language}
        customStyle={{
          margin: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          backgroundColor: "var(--layoutTabsLineColor)"
        }}
        showLineNumbers={codeBlockHook.hasMultipleLines}
        showInlineLineNumbers={codeBlockHook.hasMultipleLines}
      >
        {codeBlockHook.code}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock;

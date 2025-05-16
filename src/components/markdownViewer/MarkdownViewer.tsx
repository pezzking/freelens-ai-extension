import Markdown from "react-markdown";
import React from "react";
import CodeBlock from "../codeBlock/CodeBlock";

type MarkdownViewerProps = {
  content: string;
}

const MarkdownViewer = ({content}: MarkdownViewerProps) => {
  return (
    <Markdown
      children={content}
      components={{
        code(props) {
          const {children, className} = props
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <CodeBlock language={match[1]}>{children}</CodeBlock>
          ) : (
            <code className={className}>{children}</code>
          )
        }
      }}
    />
  )
}

export default MarkdownViewer;

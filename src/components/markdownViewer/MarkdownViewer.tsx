import Markdown from "react-markdown";
import React from "react";
import useMarkDownViewerHook from "./MarkDownViewerHook";
import "./MarkdownViewer.scss";

type MarkdownViewerProps = {
  content: string;
}

const MarkdownViewer = ({content}: MarkdownViewerProps) => {
  const markDownHook = useMarkDownViewerHook();

  return (
    <div className="markdown-viewer-container-theme">
      <Markdown
        children={content}
        components={{
          code: (props) => markDownHook.renderCode(props.inline, props.className, props.children, props),
          a: (props) => markDownHook.renderLinks(props.href, props.children, props)
        }}
      />
    </div>
  )
}

export default MarkdownViewer;

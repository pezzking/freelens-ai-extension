import { Renderer } from "@freelensapp/extensions";
import { MarkdownViewer } from "../markdown-viewer";
import styleInline from "./interrupt.scss?inline";

const {
  Component: { Button },
} = Renderer;

export type InterruptProps = {
  header: string;
  question: string;
  text: string;
  options: string[];
  onAction: (option) => void;
};

const Interrupt = ({ header, question, text, options, onAction }: InterruptProps) => {
  return (
    <div>
      <style>{styleInline}</style>
      <h1>{header}</h1>
      <h2>{question}</h2>
      <MarkdownViewer content={text} />
      <div>
        {options.map((option) => (
          <Button className="message-buttons-options" label={option} onClick={() => onAction(option)} />
        ))}
      </div>
    </div>
  );
};

export default Interrupt;

import { Renderer } from "@freelensapp/extensions";
import { MarkdownViewer } from "../markdown-viewer";
import styleInline from "./interrupt.scss?inline";
import StatusNotice from "./status-notice/status-notice";

const {
  Component: { Button },
} = Renderer;

export type InterruptProps = {
  header: string;
  question: string;
  text: string;
  options: string[];
  approved: boolean | null;
  onAction: (option) => void;
};

const Interrupt = ({ header, question, text, options, approved, onAction }: InterruptProps) => {
  return (
    <div>
      <style>{styleInline}</style>
      <h1>{header}</h1>
      <h2>{question}</h2>
      <MarkdownViewer content={text} />
      {approved === null && (
        <div>
          {options.map((option) => (
            <Button
              className="message-buttons-options"
              label={option}
              onClick={() => {
                onAction(option);
              }}
            />
          ))}
        </div>
      )}
      {approved !== null && <StatusNotice approved={approved} />}
    </div>
  );
};

export default Interrupt;

interface GptWorkflowNoteProps {
  copyText: string;
  gptText: string;
  pasteText: string;
}

export default function GptWorkflowNote({ copyText, gptText, pasteText }: GptWorkflowNoteProps) {
  return (
    <div className="gpt-workflow-note" aria-label="GPT 작업 순서">
      <div>
        <strong>1</strong>
        <span>{copyText}</span>
      </div>
      <div>
        <strong>2</strong>
        <span>{gptText}</span>
      </div>
      <div>
        <strong>3</strong>
        <span>{pasteText}</span>
      </div>
    </div>
  );
}

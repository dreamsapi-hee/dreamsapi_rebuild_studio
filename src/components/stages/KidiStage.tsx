import type { RebuilderProject, TopicCandidate } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildKidiInputPackage } from "../../data/gptPackages";

interface Props {
  project: RebuilderProject;
  onGenerate: () => void;
  onPatchKidi: (displayResult: string) => void;
  onSaveKidi: () => void;
  onToggle: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onStartTopics: () => void;
  characterState: CharacterState;
}

export default function KidiStage({ project, onGenerate, onPatchKidi, onSaveKidi, onToggle, onTitleChange, onStartTopics, characterState }: Props) {
  const copyPackage = async () => {
    await navigator.clipboard.writeText(buildKidiInputPackage(project));
    alert("키디R에게 보낼 SOURCE MAP을 복사했습니다.");
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="kidiR" state={characterState} />
      <h1>키디R이 글감 5개를 정리합니다</h1>
      <p className="muted">
        소디 결과를 키디R GPT에 보내고, 나온 T01~T05 전체를 아래에 붙여넣으세요. 저장하면 각 글감이 한 줄 목록으로 정리됩니다.
      </p>

      <div className="row-actions workflow-actions">
        <button className="secondary" onClick={copyPackage}>보낼 내용 복사</button>
        <span className="input-copy-note">SOURCE MAP</span>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75abd2bce481919e1aebc1b18b393b-kidir" target="_blank">키디R GPT 열기</a>
        <button className="primary" onClick={onSaveKidi} disabled={!project.kidiR?.displayResult?.trim() && project.topicCandidates.length === 0}>T01~T05 정리</button>
        <button className="primary" onClick={onStartTopics} disabled={!project.topicCandidates.some((item) => item.selected)}>선택 글감 시작</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="소디가 만든 SOURCE MAP을 복사합니다."
        gptText="키디R GPT가 서로 다른 글감 5개와 제목 후보를 만듭니다."
        pasteText="키디R 결과 전체를 붙여넣고 T01~T05로 정리합니다."
      />

      <div className="helper-card">
        <strong>글감 선택 방식</strong>
        <span>아래 목록은 T01부터 T05까지 서로 다른 글감입니다. 다른 글감을 고를 때는 GPT를 다시 열 필요 없이 체크만 바꾸면 됩니다. 완전히 새로운 5개를 받고 싶을 때만 키디R GPT에 다시 요청하세요.</span>
      </div>

      <CollapsibleTextarea
        label="키디R 글감 제안 결과"
        storageKey={`${project.projectId}:kidiR`}
        guide="키디R GPT가 제안한 T01~T05 전체를 붙여넣으세요. 각 T의 제목 후보도 함께 있어야 드롭다운에 정리됩니다."
        value={project.kidiR?.displayResult ?? ""}
        onChange={onPatchKidi}
        placeholder="키디R GPT가 제안한 T01~T05 글감과 각 글감의 제목 후보를 여기에 붙여넣으세요."
      />

      <div className="candidate-list">
        {project.topicCandidates.map((candidate) => (
          <CandidateRow key={candidate.id} candidate={candidate} onToggle={onToggle} onTitleChange={onTitleChange} />
        ))}
        {project.topicCandidates.length === 0 && <div className="empty">키디R 결과를 저장하면 T01~T05 글감 목록이 여기에 표시됩니다.</div>}
      </div>
    </section>
  );
}

function CandidateRow({ candidate, onToggle, onTitleChange }: { candidate: TopicCandidate; onToggle: (id: string) => void; onTitleChange: (id: string, title: string) => void }) {
  return (
    <article className={candidate.selected ? "candidate-row selected" : "candidate-row"}>
      <label className="candidate-topic">
        <input type="checkbox" checked={candidate.selected} onChange={() => onToggle(candidate.id)} />
        <strong>{candidate.id}</strong>
        <span>{candidate.topic}</span>
        {candidate.recommended && <em>추천</em>}
      </label>
      <select aria-label={`${candidate.id} 제목 후보`} value={candidate.finalTitle} onChange={(event) => onTitleChange(candidate.id, event.target.value)}>
        {candidate.titleCandidates.map((title) => (
          <option key={title.id} value={title.title}>{title.recommended ? "★ " : ""}{title.title}</option>
        ))}
      </select>
    </article>
  );
}

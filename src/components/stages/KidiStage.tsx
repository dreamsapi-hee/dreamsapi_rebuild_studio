import type { RebuilderProject, TopicCandidate } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
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
        키디R 결과를 붙여넣으면 T01~T05 글감 목록으로 정리됩니다.
      </p>

      <div className="row-actions workflow-actions">
        <div className="workflow-copy-group">
          <button className="secondary" onClick={copyPackage}>자료 복사</button>
          <span className="input-copy-note">복사 내용 · 소디 분석</span>
        </div>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75abd2bce481919e1aebc1b18b393b-kidir" target="_blank">GPT 열기</a>
        <button className="primary" onClick={onSaveKidi} disabled={!project.kidiR?.displayResult?.trim() && project.topicCandidates.length === 0}>글감 목록</button>
        <button className="primary" onClick={onStartTopics} disabled={!project.topicCandidates.some((item) => item.selected)}>글 구성하러 GO</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <CollapsibleTextarea
        label="키디R 결과"
        storageKey={`${project.projectId}:kidiR`}
        guide="T01~T05와 제목 후보를 그대로 붙여넣으세요."
        value={project.kidiR?.displayResult ?? ""}
        onChange={onPatchKidi}
        placeholder="키디R 결과를 여기에 붙여넣으세요."
      />

      <div className="candidate-list">
        {project.topicCandidates.map((candidate) => (
          <CandidateRow key={candidate.id} candidate={candidate} onToggle={onToggle} onTitleChange={onTitleChange} />
        ))}
        {project.topicCandidates.length === 0 && <div className="empty">글감 목록이 여기에 표시됩니다.</div>}
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


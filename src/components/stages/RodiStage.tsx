import type { RebuilderProject } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildRodiInputPackage } from "../../data/gptPackages";

interface Props {
  project: RebuilderProject;
  onGenerate: () => void;
  onPatchRodi: (displayResult: string) => void;
  onConfirm: () => void;
  characterState: CharacterState;
}

export default function RodiStage({ project, onGenerate, onPatchRodi, onConfirm, characterState }: Props) {
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  if (!topic) return <section className="stage-card"><h1>먼저 작업할 글감을 선택하세요</h1></section>;

  const copyPackage = async () => {
    await navigator.clipboard.writeText(buildRodiInputPackage(project, topic));
    alert("로디R에게 보낼 입력 자료를 복사했습니다.");
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="rodiR" state={characterState} />
      <h1>{topicLabel(topic.topicId)} · {topic.finalTitle}</h1>
      <p className="muted">
        선택한 글감을 로디R GPT에 보내고, 나온 글 구성 결과 전체를 아래에 붙여넣으세요.
      </p>

      <div className="row-actions workflow-actions">
        <div className="workflow-copy-group">
          <button className="secondary" onClick={copyPackage}>자료 복사</button>
          <span className="input-copy-note">복사 내용 · 글감+분석</span>
        </div>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75ac82d7e48191ae5238d1471b7bd4-rodir" target="_blank">GPT 열기</a>
        <button className="primary" onClick={onConfirm} disabled={!topic.rodiR.displayResult.trim()}>글 쓰러 GO</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="선택 글감과 이전 결과를 복사합니다."
        gptText="로디R GPT가 글의 목차와 흐름을 설계합니다."
        pasteText="글 구성 결과 전체를 붙여넣고 저장합니다."
      />

      <CollapsibleTextarea
        label="로디R 글 구성 결과"
        storageKey={`${project.projectId}:${topic.topicId}:rodiR`}
        guide="로디R GPT가 만든 글 구조, 목차, 섹션별 방향을 전체 그대로 붙여넣으세요."
        value={topic.rodiR.displayResult}
        onChange={onPatchRodi}
        placeholder="로디R GPT가 만든 글 구성 결과를 여기에 붙여넣으세요."
      />
    </section>
  );
}

function topicLabel(id: string) {
  const number = Number(id.replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? `글감 ${number}` : "글감";
}


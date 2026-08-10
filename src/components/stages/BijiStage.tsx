import type { RebuilderProject } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildBijiInputPackage } from "../../data/gptPackages";

interface Props {
  project: RebuilderProject;
  onGenerate: () => void;
  onPatchBiji: (displayResult: string) => void;
  onConfirm: () => void;
  characterState: CharacterState;
}

export default function BijiStage({ project, onGenerate, onPatchBiji, onConfirm, characterState }: Props) {
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  if (!topic) return <section className="stage-card"><h1>먼저 작업할 글감을 선택하세요</h1></section>;

  const copyPackage = async () => {
    await navigator.clipboard.writeText(buildBijiInputPackage(project, topic));
    alert("비지R에게 보낼 입력 자료를 복사했습니다.");
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="bijiR" state={characterState} />
      <h1>{topicLabel(topic.topicId)} · 이미지 구성 정하기</h1>
      <p className="muted">
        블로그 글과 SNS 결과를 비지R GPT에 보내고, 이미지 구성 결과 전체를 아래에 붙여넣으세요.
      </p>

      <div className="row-actions workflow-actions">
        <div className="workflow-copy-group">
          <button className="secondary" onClick={copyPackage}>자료 복사</button>
          <span className="input-copy-note">복사 내용 · 글+SNS</span>
        </div>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75ad638858819198c6f49b4852d6fb-bijir" target="_blank">GPT 열기</a>
        <button className="primary" onClick={onConfirm} disabled={!topic.bijiR.displayResult.trim() && !topic.bijiR.visuals?.length}>최종 점검하러 GO</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="블로그 글과 SNS 결과를 복사합니다."
        gptText="비지R GPT가 필요한 이미지 구성을 제안합니다."
        pasteText="이미지 구성 결과 전체를 붙여넣고 저장합니다."
      />

      <CollapsibleTextarea
        label="비지R 이미지 구성 결과"
        storageKey={`${project.projectId}:${topic.topicId}:bijiR`}
        guide="비지R GPT가 제안한 이미지 수, 삽입 위치, 이미지별 목적과 프롬프트를 전체 그대로 붙여넣으세요."
        value={topic.bijiR.displayResult}
        onChange={onPatchBiji}
        placeholder="비지R GPT가 제안한 이미지 구성안을 여기에 붙여넣으세요."
      />

      <div className="visual-grid">
        {(topic.bijiR.visuals || []).map((visual) => (
          <article className="visual-card" key={visual.id}>
            <strong>{visual.id} · {visual.role}</strong>
            <p>{visual.message}</p>
            <dl>
              <dt>삽입 위치</dt><dd>{visual.insertAfter}</dd>
              <dt>레이아웃</dt><dd>{visual.layout}</dd>
              <dt>문구</dt><dd>{visual.text}</dd>
              <dt>프롬프트</dt><dd>{visual.prompt}</dd>
            </dl>
          </article>
        ))}
        {!topic.bijiR.visuals?.length && <div className="empty">이미지 구성안을 저장하면 추천 이미지 목록이 여기에 표시됩니다.</div>}
      </div>
    </section>
  );
}

function topicLabel(id: string) {
  const number = Number(id.replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? `글감 ${number}` : "글감";
}


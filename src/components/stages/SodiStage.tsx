import type { RebuilderProject } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildSodiInputPackage } from "../../data/gptPackages";

interface Props {
  project: RebuilderProject;
  onGenerate: () => void;
  onConfirm: () => void;
  onPatchSodi: (displayResult: string) => void;
  characterState: CharacterState;
}

export default function SodiStage({ project, onGenerate, onConfirm, onPatchSodi, characterState }: Props) {
  const copyPackage = async () => {
    const sources = project.masterSources.filter((source) => source.active !== false);
    await navigator.clipboard.writeText(buildSodiInputPackage(project));
    alert(`소디에게 보낼 원자료 ${sources.length}개를 복사했습니다.`);
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="sodi" state={characterState} />
      <h1>소디 GPT에 원자료를 보내주세요</h1>
      <p className="muted">
        앱에 저장된 원자료 본문 전체를 복사해 소디 GPT에 붙여넣으세요. 소디가 만든 분석 결과와 SOURCE MAP은 아래에 다시 붙여넣어 저장합니다.
      </p>

      <div className="row-actions workflow-actions">
        <div className="workflow-copy-group">
          <button className="secondary" onClick={copyPackage}>자료 복사</button>
          <span className="input-copy-note">복사 내용 · 원자료 전체</span>
        </div>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75aadea8848191a646132ce53c5c89-sodi" target="_blank">GPT 열기</a>
        <button className="primary" onClick={onConfirm} disabled={!project.sodi.displayResult.trim() && !project.sodi.sourceMap}>글감 찾으러 GO</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="원자료 전체를 복사합니다."
        gptText="소디 GPT에 붙여넣어 분석시킵니다."
        pasteText="소디 결과 전체를 아래에 붙여넣고 저장합니다."
      />

      <div className="helper-card">
        <strong>소디 GPT에 붙여넣을 때</strong>
        <span>파일명이나 경로만 보내면 소디가 내용을 읽을 수 없습니다. 반드시 “자료 복사”로 복사된 텍스트 전체를 채팅창에 붙여넣어 주세요.</span>
      </div>

      <CollapsibleTextarea
        label="소디 분석 결과"
        storageKey={`${project.projectId}:sodi`}
        guide="소디 GPT가 만든 분석 결과 전체를 그대로 붙여넣으세요. SOURCE MAP 부분만 따로 잘라 넣지 않아도 됩니다."
        value={project.sodi.displayResult}
        onChange={onPatchSodi}
        placeholder="소디 GPT가 정리한 분석 결과와 SOURCE MAP 전체를 여기에 붙여넣으세요."
      />

      {project.sodi.sourceMap && (
        <div className="result-box">
          <h3>저장된 SOURCE MAP</h3>
          <pre>{JSON.stringify(project.sodi.sourceMap, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}


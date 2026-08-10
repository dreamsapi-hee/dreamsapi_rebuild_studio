import { useMemo, useState } from "react";
import type { RebuilderProject } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
import { getFinalCopyText, platformLabel } from "../../utils/finalCopy";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildChekiInputPackage } from "../../data/gptPackages";

interface Props {
  project: RebuilderProject;
  onGenerate: () => void;
  onPatchCheki: (displayResult: string) => void;
  onSaveCheki: () => void;
  onComplete: () => void;
  onBackToTopics: () => void;
  characterState: CharacterState;
}

export default function ChekiStage({ project, onGenerate, onPatchCheki, onSaveCheki, onComplete, onBackToTopics, characterState }: Props) {
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  const [copyTarget, setCopyTarget] = useState("blog");

  const copyTargets = useMemo(() => {
    if (!topic) return [{ id: "blog", label: "블로그 글" }];
    const snsKeys = new Set([
      ...Object.keys(topic.chekiR.finalPackage?.snsOutputs ?? {}),
      ...Object.keys(topic.multiR.outputs ?? {}),
      ...(topic.multiR.selectedPlatforms ?? []),
    ].filter((key) => key !== "pasted_result"));

    return [
      { id: "blog", label: "블로그 글" },
      ...[...snsKeys].map((key) => ({ id: key, label: platformLabel(key) })),
    ];
  }, [topic]);

  if (!topic) return <section className="stage-card"><h1>먼저 작업할 글감을 선택하세요</h1></section>;

  const isDone = topic.completed || topic.status === "final_done";

  const copyFinal = async () => {
    const selected = copyTargets.find((target) => target.id === copyTarget) ?? copyTargets[0];
    const copyText = getFinalCopyText(topic, selected.id);
    if (!copyText.trim()) return alert(`${selected.label}로 복사할 내용이 아직 없습니다.`);
    await navigator.clipboard.writeText(copyText);
    alert(`${selected.label}만 복사했습니다.`);
  };

  const copyPackage = async () => {
    await navigator.clipboard.writeText(buildChekiInputPackage(project, topic));
    alert("체키R에게 보낼 입력 자료를 복사했습니다.");
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="chekiR" state={characterState} />
      <h1>{topicLabel(topic.topicId)} · 최종 확인</h1>
      <p className="muted">
        완성 글, 이미지 구성, SNS 결과를 체키R GPT에 보내고, 최종 검수 결과 전체를 아래에 붙여넣으세요.
      </p>

      <div className="row-actions workflow-actions">
        <button className="secondary" onClick={copyPackage}>보낼 내용 복사</button>
        <span className="input-copy-note">글 + 비주얼 + SNS</span>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75adf228748191a0aeff895d93bb3c-cekir" target="_blank">체키R GPT 열기</a>
        <button className="primary" onClick={onSaveCheki} disabled={!topic.chekiR.displayResult.trim() && !topic.chekiR.finalPackage}>최종 결과 저장</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="글, 이미지 구성, SNS 결과를 복사합니다."
        gptText="체키R GPT가 빠진 내용과 어색한 부분을 점검합니다."
        pasteText="최종 검수 결과를 붙여넣고 발행용 글을 복사합니다."
      />

      <section className="final-action-panel">
        <div className="final-copy-card publish-copy-card">
          <div>
            <strong>발행용 글 복사</strong>
            <span>블로그면 블로그 글만, SNS면 해당 SNS 글만 골라 복사합니다.</span>
          </div>
          <div className="copy-target-control">
            <select value={copyTarget} onChange={(event) => setCopyTarget(event.target.value)} aria-label="복사 대상">
              {copyTargets.map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}
            </select>
            <button className="primary" onClick={copyFinal} disabled={!topic.chekiR.displayResult && !topic.chekiR.finalPackage}>복사</button>
          </div>
        </div>

        <div className={isDone ? "final-complete-card done" : "final-complete-card"}>
          <div>
            <strong>{isDone ? "완료 처리됨" : "아직 진행 중"}</strong>
            <span>{isDone ? "오른쪽 상태 패널에도 최종 완료로 표시됩니다." : "발행까지 끝났다면 완료로 바꿔 주세요."}</span>
          </div>
          <button className="status-toggle-button" onClick={onComplete} disabled={!topic.chekiR.displayResult && !topic.chekiR.finalPackage}>
            {isDone ? "완료 상태" : "완료 처리"}
          </button>
        </div>

        <button className="secondary back-to-topic-button" onClick={onBackToTopics}>다른 글감 선택</button>
      </section>

      {topic.chekiR.finalPackage?.naverPublishKit?.publishSettings && (
        <section className="publish-kit final-publish-settings">
          <div>
            <p className="eyebrow">NAVER PUBLISH SETTINGS</p>
            <h2>블로그 발행 전 설정</h2>
            <p>네이버 블로그 발행 화면에서 아래 값대로 확인하면 됩니다.</p>
          </div>
          <div className="publish-kit-grid">
            <article className="wide publish-settings-card">
              <dl className="publish-settings-list">
                <div><dt>카테고리</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.category}</dd></div>
                <div><dt>주제</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.topic}</dd></div>
                <div><dt>공개 설정</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.visibility}</dd></div>
                <div><dt>발행 설정</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.permissions.join(" · ")}</dd></div>
                <div><dt>태그 입력</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.tagInput}</dd></div>
                <div><dt>발행 시간</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.publishTime}</dd></div>
                <div><dt>공지 등록</dt><dd>{topic.chekiR.finalPackage.naverPublishKit.publishSettings.notice}</dd></div>
              </dl>
            </article>
          </div>
        </section>
      )}

      <CollapsibleTextarea
        label="체키R 최종 검수 결과"
        storageKey={`${project.projectId}:${topic.topicId}:chekiR`}
        guide="체키R GPT가 다듬은 최종본 전체를 붙여넣으세요. 이후 복사 버튼은 블로그 글 또는 SNS 글만 골라 복사합니다."
        value={topic.chekiR.displayResult}
        onChange={onPatchCheki}
        placeholder="체키R GPT가 다듬은 최종 글 또는 검수 결과를 여기에 붙여넣으세요."
      />

      {topic.chekiR.report && (
        <div className="report-grid">
          {Object.entries(topic.chekiR.report).map(([key, value]) => <div key={key}><strong>{key}</strong><span>{Array.isArray(value) ? value.join(", ") : value}</span></div>)}
        </div>
      )}

      <div className="result-box markdown">
        <pre>{topic.chekiR.finalPackage?.articleMarkdown || "최종 검수를 먼저 진행해 주세요."}</pre>
      </div>
    </section>
  );
}

function topicLabel(id: string) {
  const number = Number(id.replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? `글감 ${number}` : "글감";
}

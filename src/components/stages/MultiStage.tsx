import { useState } from "react";
import type { RebuilderProject } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import CollapsibleTextarea from "../CollapsibleTextarea";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildMultiInputPackage } from "../../data/gptPackages";

const platforms = [
  ["instagram_carousel", "인스타 카드뉴스"],
  ["instagram_caption", "인스타 캡션"],
  ["reels", "릴스"],
  ["youtube_shorts", "유튜브 쇼츠"],
  ["threads", "Threads"],
  ["facebook", "Facebook"],
  ["linkedin", "LinkedIn"],
  ["newsletter_summary", "뉴스레터 요약"],
];

interface Props {
  project: RebuilderProject;
  onGenerate: (platforms: string[]) => void;
  onPatchMulti: (displayResult: string) => void;
  onSaveMulti: () => void;
  onSkip: () => void;
  characterState: CharacterState;
}

export default function MultiStage({ project, onGenerate, onPatchMulti, onSaveMulti, onSkip, characterState }: Props) {
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  const [selected, setSelected] = useState(["instagram_carousel", "instagram_caption"]);
  if (!topic) return <section className="stage-card"><h1>먼저 작업할 글감을 선택하세요</h1></section>;

  const copyPackage = async () => {
    const selectedLabels = platforms.filter(([id]) => selected.includes(id)).map(([, label]) => label).join(", ");
    await navigator.clipboard.writeText(buildMultiInputPackage(project, topic, selectedLabels));
    alert("멀티R에게 보낼 입력 자료를 복사했습니다.");
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="multiR" state={characterState} />
      <h1>{topicLabel(topic.topicId)} · SNS 글로 확장하기</h1>
      <p className="muted">
        원하는 SNS 형식을 체크한 뒤 멀티R GPT에 보내세요. 나온 SNS 콘텐츠 결과 전체를 아래에 붙여넣고 저장합니다.
      </p>

      <div className="platform-grid">
        {platforms.map(([id, label]) => (
          <label className="check-pill" key={id}>
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="row-actions workflow-actions">
        <div className="workflow-copy-group">
          <button className="secondary" onClick={copyPackage}>자료 복사</button>
          <span className="input-copy-note">복사 내용 · 블로그 글</span>
        </div>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75adae31f88191bfaf0ba76b5eb957-meoltir" target="_blank">GPT 열기</a>
        <button className="primary" onClick={onSaveMulti} disabled={!topic.multiR.displayResult.trim() && !topic.multiR.outputs}>이미지 짜러 GO</button>
        <button className="secondary" onClick={onSkip}>SNS 건너뛰기</button>
        <button className="assistive-action" onClick={() => onGenerate(selected)} disabled={!selected.length}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="완성된 블로그 글을 복사합니다."
        gptText="멀티R GPT가 선택한 SNS 형식으로 바꿉니다."
        pasteText="SNS 결과 전체를 붙여넣고 저장합니다."
      />

      <CollapsibleTextarea
        label="멀티R SNS 콘텐츠 결과"
        storageKey={`${project.projectId}:${topic.topicId}:multiR`}
        guide="멀티R GPT가 만든 SNS별 콘텐츠 전체를 붙여넣으세요. 블로그 글과 섞이지 않도록 플랫폼 이름이 보이면 좋습니다."
        value={topic.multiR.displayResult}
        onChange={onPatchMulti}
        placeholder="멀티R GPT가 만든 SNS 콘텐츠를 여기에 붙여넣으세요."
      />
    </section>
  );
}

function topicLabel(id: string) {
  const number = Number(id.replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? `글감 ${number}` : "글감";
}


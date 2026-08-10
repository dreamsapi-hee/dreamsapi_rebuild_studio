import type { RebuilderProject } from "../../types";
import PartnerHero from "../PartnerHero";
import type { CharacterState } from "../../data/characters";
import { buildNaverPublishKit } from "../../data/generators";
import CollapsibleTextarea from "../CollapsibleTextarea";
import GptWorkflowNote from "../GptWorkflowNote";
import { buildWriteInputPackage } from "../../data/gptPackages";

interface Props {
  project: RebuilderProject;
  onSettings: (settings: RebuilderProject["settings"]) => void;
  onGenerate: () => void;
  onPatchWrite: (displayResult: string) => void;
  onConfirm: () => void;
  characterState: CharacterState;
}

export default function WriteStage({ project, onSettings, onGenerate, onPatchWrite, onConfirm, characterState }: Props) {
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  if (!topic) return <section className="stage-card"><h1>먼저 작업할 글감을 선택하세요</h1></section>;

  const naverKit = project.settings.platform === "naver_blog" && project.sodi.sourceMap ? buildNaverPublishKit(topic, project.sodi.sourceMap) : null;

  const copyArticle = async () => {
    await navigator.clipboard.writeText(topic.writeR.article?.bodyMarkdown || topic.writeR.displayResult);
    alert("블로그 글만 복사했습니다.");
  };

  const copyPackage = async () => {
    await navigator.clipboard.writeText(buildWriteInputPackage(project, topic));
    alert("라이R에게 보낼 입력 자료를 복사했습니다.");
  };

  const copyNaverKit = async () => {
    if (!naverKit) return;
    await navigator.clipboard.writeText(formatNaverKit(naverKit));
    alert("네이버 발행 세팅을 복사했습니다.");
  };

  return (
    <section className="stage-card">
      <PartnerHero partner="writeR" state={characterState} />
      <h1>{topicLabel(topic.topicId)} · {topic.finalTitle}</h1>

      <div className="option-grid">
        <Select label="글쓰기 방식" value={project.settings.writingMode} onChange={(writingMode) => onSettings({ ...project.settings, writingMode })} options={[["ai_recommended", "AI 추천"], ["informative", "정보 전달"], ["tutorial", "따라 하기"], ["problem_solving", "문제 해결"], ["comparison", "비교"], ["case", "사례 중심"]]} />
        <Select label="발행 위치" value={project.settings.platform} onChange={(platform) => onSettings({ ...project.settings, platform })} options={[["naver_blog", "네이버 블로그"], ["tistory", "티스토리"], ["brunch", "브런치"], ["newsletter", "뉴스레터"], ["homepage", "홈페이지"]]} />
        <Select label="분량" value={project.settings.length} onChange={(length) => onSettings({ ...project.settings, length })} options={[["short", "짧게"], ["normal", "보통"], ["detailed", "자세히"]]} />
        <Select label="말투" value={project.settings.tone} onChange={(tone) => onSettings({ ...project.settings, tone })} options={[["easy", "쉽게"], ["friendly_expert", "친근한 전문가"], ["professional", "전문적으로"]]} />
      </div>

      <p className="muted">
        로디R이 만든 글 구성을 라이R GPT에 보내고, 완성된 블로그 글 전체를 아래에 붙여넣으세요.
      </p>

      <div className="row-actions workflow-actions">
        <div className="workflow-copy-group">
          <button className="secondary" onClick={copyPackage}>자료 복사</button>
          <span className="input-copy-note">복사 내용 · 구성안</span>
        </div>
        <a className="secondary link-button" href="https://chatgpt.com/g/g-6a75ad00e1f88191bac5772e51055671-raitir" target="_blank">라이R GPT 열기</a>
        <button className="primary" onClick={onConfirm} disabled={!topic.writeR.displayResult.trim()}>결과 저장</button>
        <button className="secondary" onClick={copyArticle} disabled={!topic.writeR.displayResult}>글만 복사</button>
        <button className="assistive-action" onClick={onGenerate}>앱에서 임시 초안</button>
      </div>

      <GptWorkflowNote
        copyText="글 구성과 작성 옵션을 복사합니다."
        gptText="라이R GPT가 블로그 본문을 작성합니다."
        pasteText="완성 글 전체를 붙여넣고 저장합니다."
      />

      <CollapsibleTextarea
        label="라이R 블로그 글 결과"
        storageKey={`${project.projectId}:${topic.topicId}:writeR`}
        guide="라이R GPT가 작성한 완성 블로그 글 전체를 붙여넣으세요. 제목, 본문, 키워드가 함께 있으면 이후 단계가 더 정확해집니다."
        value={topic.writeR.displayResult}
        onChange={onPatchWrite}
        placeholder="라이R GPT가 작성한 블로그 글 전체를 여기에 붙여넣으세요."
      />

      {naverKit && (
        <section className="publish-kit">
          <div>
            <p className="eyebrow">NAVER PUBLISH KIT</p>
            <h2>네이버 발행 세팅</h2>
            <p>{naverKit.caution}</p>
          </div>
          <button className="secondary" onClick={copyNaverKit}>세팅 복사</button>

          <div className="publish-kit-grid">
            <article className="wide publish-primary">
              <strong>메인 키워드</strong>
              <p className="main-keyword">{naverKit.mainKeyword}</p>
            </article>
            <article>
              <strong>함께 넣을 키워드</strong>
              <div className="keyword-cloud">{naverKit.subKeywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            </article>
            <article>
              <strong>제목 후보 3개</strong>
              <ol>{naverKit.titleOptions.map((title) => <li key={title}>{title}</li>)}</ol>
            </article>
            <article>
              <strong>태그</strong>
              <div className="keyword-cloud">{naverKit.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
            </article>
            {naverKit.publishSettings && (
              <article className="wide publish-settings-card">
                <strong>블로그 발행 전 설정</strong>
                <dl className="publish-settings-list">
                  <div><dt>카테고리</dt><dd>{naverKit.publishSettings.category}</dd></div>
                  <div><dt>주제</dt><dd>{naverKit.publishSettings.topic}</dd></div>
                  <div><dt>공개 설정</dt><dd>{naverKit.publishSettings.visibility}</dd></div>
                  <div><dt>발행 설정</dt><dd>{naverKit.publishSettings.permissions.join(" · ")}</dd></div>
                  <div><dt>태그 입력</dt><dd>{naverKit.publishSettings.tagInput}</dd></div>
                  <div><dt>발행 시간</dt><dd>{naverKit.publishSettings.publishTime}</dd></div>
                  <div><dt>공지 등록</dt><dd>{naverKit.publishSettings.notice}</dd></div>
                </dl>
              </article>
            )}
            <article>
              <strong>발행 전 확인</strong>
              <ul>{naverKit.publishChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
        </section>
      )}
    </section>
  );
}

function topicLabel(id: string) {
  const number = Number(id.replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? `글감 ${number}` : "글감";
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function formatNaverKit(kit: NonNullable<ReturnType<typeof buildNaverPublishKit>>) {
  return `# 네이버 발행 세팅

메인 키워드: ${kit.mainKeyword}

세부 키워드:
${kit.subKeywords.map((keyword) => `- ${keyword}`).join("\n")}

제목 후보:
${kit.titleOptions.map((title, index) => `${index + 1}. ${title}`).join("\n")}

태그:
${kit.tags.map((tag) => `#${tag}`).join(" ")}

블로그 발행 전 설정:
${kit.publishSettings ? [
  `- 카테고리: ${kit.publishSettings.category}`,
  `- 주제: ${kit.publishSettings.topic}`,
  `- 공개 설정: ${kit.publishSettings.visibility}`,
  `- 발행 설정: ${kit.publishSettings.permissions.join(", ")}`,
  `- 태그 입력: ${kit.publishSettings.tagInput}`,
  `- 발행 시간: ${kit.publishSettings.publishTime}`,
  `- 공지 등록: ${kit.publishSettings.notice}`,
  `- 기본 설정 유지: ${kit.publishSettings.keepDefaultSettings}`,
].join("\n") : "- 발행 설정 없음"}

발행 체크리스트:
${kit.publishChecklist.map((item) => `- ${item}`).join("\n")}

주의:
${kit.caution}`;
}

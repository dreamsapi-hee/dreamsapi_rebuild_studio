import type { CSSProperties } from "react";
import type { PartnerKey, RebuilderProject, TopicStatus } from "../types";
import PartnerAvatar from "./PartnerAvatar";
import { partnerCharacters } from "../data/characters";
import { partnerOrder } from "../data/partnerStatus";
import BrandMascot from "./BrandMascot";
import BrandLogo from "./BrandLogo";

interface HomeProps {
  projects: RebuilderProject[];
  onCreate: () => void;
  onOpen: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const headline = "자료만 넣으면, 블로그는 드림사피가 완성합니다";

const partnerLabels: Record<PartnerKey, string> = {
  sodi: "소디",
  kidiR: "키디R",
  rodiR: "로디R",
  writeR: "라이R",
  bijiR: "비지R",
  multiR: "멀티R",
  chekiR: "체키R",
};

const stageLabels: Record<PartnerKey, string> = {
  sodi: "원자료 분석 준비",
  kidiR: "글감 5개 선택",
  rodiR: "글 구조 설계",
  writeR: "블로그 글 작성",
  bijiR: "이미지 구성",
  multiR: "SNS 확장",
  chekiR: "최종 검수",
};

const topicProgressStep: Record<TopicStatus, number> = {
  not_selected: 2,
  selected: 2,
  structure_done: 3,
  writing: 3,
  article_done: 4,
  visual_done: 5,
  multi_done: 6,
  final_done: 7,
  archived: 7,
};

export default function Home({ projects, onCreate, onOpen, onDelete }: HomeProps) {
  return (
    <div className="home">
      <section className="hero">
        <div className="home-brand-host">
          <BrandLogo variant="korean" className="home-brand-logo" />
        </div>

        <div className="hero-copy">
          <div className="hero-title-lockup">
            <BrandMascot size="lg" className="home-brand-mascot" />
            <div className="hero-title-text">
              <p className="eyebrow">DreamSapi Rebuild Studio</p>
              <h1 className="hero-typing" aria-label={headline}>
                <span>{headline}</span>
              </h1>
            </div>
          </div>
          <p className="hero-lead">
            강의자료, 스크립트, 메모를 그대로 붙여넣으세요.<br />
            중요한 내용은 놓치지 않고 살리고,<br />
            블로그 글감부터 발행 전 세팅까지 차근차근 정리해드립니다.
          </p>
          <div className="hero-proof">
            <span>글감 5개 제안</span>
            <span>원자료 디테일 보존</span>
            <span>발행 전 세팅까지</span>
          </div>
          <button className="primary big hero-cta" onClick={onCreate}>새 작업 시작</button>
        </div>

        <div className="team-board-heading">
          <span>7 AI Partners</span>
          <strong>각 단계마다 전담 파트너가 결과를 이어받습니다</strong>
        </div>

        <div className="hero-character-stage" aria-label="7명의 AI 콘텐츠 파트너">
          {partnerOrder.map((partner, index) => {
            const character = partnerCharacters[partner];
            return (
              <div className="home-character-flow" key={partner}>
                <div className="home-character" style={{ "--character-color": character.color } as CSSProperties}>
                  <PartnerAvatar partner={partner} size="lg" state="default" hoverState="analyzing" />
                  <div>
                    <strong>{partnerLabels[partner]}</strong>
                  </div>
                  <span className="home-character-role">{character.role}</span>
                </div>
                {index < partnerOrder.length - 1 && <span className="home-flow-arrow" aria-hidden="true">→</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="project-grid">
        {projects.length === 0 && (
          <div className="empty home-empty">
            <strong>아직 저장된 작업이 없습니다.</strong>
            <span>새 작업을 만들면 이 브라우저에 자동 저장됩니다.</span>
          </div>
        )}

        {projects.map((project) => {
          const summary = getProjectCardSummary(project);
          const currentCharacter = partnerCharacters[project.currentPartner];
          return (
            <article className="project-card home-project-card" key={project.projectId} style={{ "--character-color": currentCharacter.color } as CSSProperties}>
              <div className="project-card-top">
                <p className="eyebrow">{new Date(project.updatedAt).toLocaleString("ko-KR")}</p>
                <span className="project-stage-badge">
                  <PartnerAvatar partner={project.currentPartner} size="sm" state="default" />
                  {partnerLabels[project.currentPartner]}
                </span>
              </div>

              <h2>{project.projectName}</h2>
              <p className="project-current-line">현재: {stageLabels[project.currentPartner]}</p>
              {summary.currentTopicTitle && <p className="project-topic-line">작업 글감: {summary.currentTopicTitle}</p>}

              <div className="home-progress">
                <div className="home-progress-head">
                  <span>작업 진행률</span>
                  <strong>{summary.progress}%</strong>
                </div>
                <div className="project-progress-bar">
                  <i style={{ width: `${summary.progress}%` }} />
                </div>
              </div>

              <div className="project-metrics">
                <span><strong>{project.masterSources.length}</strong>자료</span>
                <span><strong>{project.selectedTopicIds.length}</strong>선택 글감</span>
                <span><strong>{summary.complete}</strong>완료</span>
              </div>

              <div className="project-card-actions">
                <button className="primary" onClick={() => onOpen(project.projectId)}>계속 작업</button>
                <button className="ghost danger" onClick={() => onDelete(project.projectId)}>삭제</button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function getProjectCardSummary(project: RebuilderProject) {
  const complete = project.selectedTopicIds.filter((id) => project.topics[id]?.status === "final_done").length;
  const currentTopic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  const selectedTopics = project.selectedTopicIds.map((id) => project.topics[id]).filter(Boolean);
  const latestSelectedTopic = selectedTopics[selectedTopics.length - 1];
  const displayTopic = currentTopic ?? latestSelectedTopic ?? null;

  let step = 0;
  if (project.masterSources.length > 0) step = 1;
  if (project.sodi.sourceMap || project.sodi.status === "confirmed") step = 1;
  if (project.topicCandidates.length === 5 || project.selectedTopicIds.length > 0) step = 2;
  if (displayTopic) step = Math.max(step, topicProgressStep[displayTopic.status] ?? 2);
  if (complete > 0) step = Math.max(step, 7);

  return {
    complete,
    currentTopicTitle: displayTopic?.finalTitle ?? null,
    progress: Math.round((step / 7) * 100),
  };
}

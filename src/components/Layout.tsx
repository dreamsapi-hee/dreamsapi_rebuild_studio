import type { PartnerKey, RebuilderProject } from "../types";
import PartnerAvatar from "./PartnerAvatar";
import { partnerCharacters, type CharacterState } from "../data/characters";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { StorageHealth } from "../data/storage";
import BrandMascot from "./BrandMascot";
import { partnerOrder } from "../data/partnerStatus";

const partnerLabels: Record<PartnerKey, string> = {
  sodi: "소디",
  kidiR: "키디R",
  rodiR: "로디R",
  writeR: "라이R",
  bijiR: "비지R",
  multiR: "멀티R",
  chekiR: "체키R",
};

const statusLabel: Record<string, string> = {
  not_selected: "대기",
  selected: "시작 전",
  structure_done: "구성 완료",
  writing: "글 작성 중",
  article_done: "글 완료",
  visual_done: "이미지 완료",
  multi_done: "SNS 완료",
  final_done: "최종 완료",
  archived: "보관",
};

interface LayoutProps {
  project: RebuilderProject;
  onPartnerChange: (partner: PartnerKey) => void;
  onTopicChange: (topicId: string) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onHome: () => void;
  onManageSources: () => void;
  storageHealth: StorageHealth;
  characterStatuses: Record<PartnerKey, CharacterState>;
  children: ReactNode;
}

export default function Layout({ project, onPartnerChange, onTopicChange, onExportJson, onImportJson, onHome, onManageSources, storageHealth, characterStatuses, children }: LayoutProps) {
  const [leftCompact, setLeftCompact] = useState(false);
  const currentTopic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  const completed = project.selectedTopicIds.filter((id) => project.topics[id]?.status === "final_done").length;
  const activeSources = project.masterSources.filter((source) => source.active !== false).length;
  const next = nextAction(project);
  const progress = projectProgress(project);

  return (
    <div className={`app-shell ${leftCompact ? "left-compact" : ""}`}>
      <aside className="left-rail">
        <button className="sidebar-toggle left-sidebar-toggle" onClick={() => setLeftCompact((value) => !value)}>
          {leftCompact ? "펼치기" : "접기"}
        </button>
        <nav className="partner-nav" aria-label="파트너 단계">
          <button className="home-nav-button" onClick={onHome}>
            <BrandMascot size="md" className="home-nav-mascot" />
            <span className="home-nav-text">홈으로</span>
          </button>
          {partnerOrder.map((partner) => (
            <button
              key={partner}
              className={`${project.currentPartner === partner ? "active" : ""} ${characterStatuses[partner] === "complete" ? "done" : ""}`}
              style={{ "--character-color": partnerCharacters[partner].color } as CSSProperties}
              onClick={() => onPartnerChange(partner)}
            >
              <span className="partner-nav-label">
                <span className="nav-icon-wrap">
                  <PartnerAvatar partner={partner} size="sm" imageRole="default" />
                  {characterStatuses[partner] === "complete" && <span className="nav-complete-badge">✓</span>}
                </span>
                <span className="partner-nav-text">
                  <span className="partner-nav-name">{partnerLabels[partner]}</span>
                  <small className="partner-nav-role">{nextHint(partner, project)}</small>
                </span>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="workbench">{children}</main>

      <aside className="status-panel">
        <section className="panel-card project-summary-card">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">프로젝트</p>
              <h2>{project.projectName}</h2>
            </div>
          </div>
          <p className="muted saved-line">저장 · {new Date(project.lastSavedAt).toLocaleString("ko-KR")}</p>
          <div className="metric-grid">
            <div><strong>{activeSources}</strong><span>사용 자료</span></div>
            <div><strong>{project.selectedTopicIds.length}</strong><span>선택 글감</span></div>
            <div><strong>{completed}</strong><span>최종 완료</span></div>
          </div>
          <div className="project-progress" aria-label={`전체 진행률 ${progress.percent}%`}>
            <div className="project-progress-head">
              <strong>{progress.label}</strong>
              <span>{progress.percent}%</span>
            </div>
            <div className="project-progress-bar"><span style={{ width: `${progress.percent}%` }} /></div>
          </div>
        </section>

        <section className="panel-card current-status-card priority-panel-card">
          <p className="eyebrow">다음 작업</p>
          <div className="current-partner-line">
            <PartnerAvatar partner={project.currentPartner} size="sm" imageRole="default" />
            <div>
              <span>현재 위치</span>
              <h3>{partnerLabels[project.currentPartner]}</h3>
            </div>
          </div>
          <p className="current-topic-brief">{currentTopic ? `${topicLabel(currentTopic.topicId)} · ${currentTopic.finalTitle}` : "글감 미선택"}</p>
          <div className="next-action-box">
            <strong>{next.title}</strong>
            <span>{next.description}</span>
            <button
              className="primary next-action-button"
              onClick={() => next.kind === "sources" ? onManageSources() : onPartnerChange(next.partner)}
            >
              {next.button}
            </button>
          </div>
        </section>

        <section className="panel-card selected-topics-card">
          <p className="eyebrow">선택한 글감</p>
          <div className="topic-list">
            {project.selectedTopicIds.length === 0 && <p className="muted">선택한 글감 없음</p>}
            {project.selectedTopicIds.map((topicId) => {
              const topic = project.topics[topicId];
              if (!topic) return null;
              return (
                <button key={topicId} className={project.currentTopicId === topicId ? "topic-row active" : "topic-row"} onClick={() => onTopicChange(topicId)}>
                  <strong>{topicLabel(topicId)}</strong>
                  <span>{topic.finalTitle}</span>
                  <em className={`topic-status status-${topic.status}`}>{statusLabel[topic.status]}</em>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel-card backup-card">
          <p className="eyebrow">작업 백업</p>
          <div className={`storage-health ${storageHealth.level}`}>
            <strong>{storageHealth.level === "safe" ? "자동 저장됨" : storageHealth.level === "warning" ? "백업 권장" : "백업 필요"}</strong>
            <span>{storageHealth.level === "safe" ? "정상 작동 중" : storageHealth.message}</span>
            <small>{storageHealth.mb >= 0.1 ? `${storageHealth.mb}MB` : `${storageHealth.kb}KB`}</small>
          </div>
          <div className="backup-actions">
            <button className="secondary" onClick={onExportJson}>내보내기</button>
            <label className="file-button">
              가져오기
              <input type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && onImportJson(event.target.files[0])} />
            </label>
          </div>
        </section>
      </aside>
    </div>
  );
}

function topicLabel(id: string) {
  const number = Number(id.replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? `글감 ${number}` : "글감";
}

function nextHint(partner: PartnerKey, project: RebuilderProject) {
  if (partner === "sodi") return project.sodi.sourceMap ? "분석 완료" : "자료 읽기";
  if (partner === "kidiR") return `${project.topicCandidates.length}/5 글감`;
  if (partner === "rodiR") return project.currentTopicId ? "글 구성" : "글감 필요";
  if (partner === "writeR") return "글쓰기";
  if (partner === "bijiR") return "이미지 구성";
  if (partner === "multiR") return "SNS 글";
  return "최종 확인";
}

function nextAction(project: RebuilderProject): { title: string; description: string; button: string; kind: "partner"; partner: PartnerKey } | { title: string; description: string; button: string; kind: "sources" } {
  if (!project.masterSources.some((source) => source.active !== false)) {
    return { kind: "sources", title: "원자료 필요", description: "자료를 먼저 저장하세요.", button: "자료 넣으러 GO" };
  }
  if (!project.sodi.sourceMap) {
    return { kind: "partner", partner: "sodi", title: "소디 결과 저장", description: "분석 결과를 붙여넣으세요.", button: "자료 분석하러 GO" };
  }
  if (project.topicCandidates.length !== 5) {
    return { kind: "partner", partner: "kidiR", title: "글감 5개 정리", description: "키디R 결과를 붙여넣으세요.", button: "글감 찾으러 GO" };
  }
  if (!project.selectedTopicIds.length) {
    return { kind: "partner", partner: "kidiR", title: "글감 선택", description: "만들 글감을 체크하세요.", button: "글감 고르러 GO" };
  }
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  if (!topic) {
    return { kind: "partner", partner: "kidiR", title: "작업 글감 선택", description: "이어갈 글감을 고르세요.", button: "글감 고르러 GO" };
  }
  if (topic.status === "selected") {
    return { kind: "partner", partner: "rodiR", title: "글 구성 만들기", description: "목차와 흐름을 잡으세요.", button: "글 구성하러 GO" };
  }
  if (topic.status === "structure_done" || topic.status === "writing") {
    return { kind: "partner", partner: "writeR", title: "본문 작성", description: "블로그 글을 완성하세요.", button: "글 쓰러 GO" };
  }
  if (topic.status === "article_done") {
    return { kind: "partner", partner: "multiR", title: "SNS 확장", description: "SNS 글을 만드세요.", button: "SNS 만들러 GO" };
  }
  if (topic.status === "multi_done") {
    return { kind: "partner", partner: "bijiR", title: "이미지 구성", description: "필요한 이미지를 정리하세요.", button: "이미지 짜러 GO" };
  }
  if (topic.status === "visual_done") {
    return { kind: "partner", partner: "chekiR", title: "최종 점검", description: "빠진 내용을 확인하세요.", button: "최종 점검하러 GO" };
  }
  if (topic.status === "final_done") {
    return { kind: "partner", partner: "kidiR", title: "다음 글감", description: "다른 T번호를 선택하세요.", button: "다음 글감 고르러 GO" };
  }
  return { kind: "partner", partner: project.currentPartner, title: "결과 저장", description: "현재 단계를 저장하세요.", button: "현재 단계로 GO" };
}

function projectProgress(project: RebuilderProject) {
  const units = [
    project.masterSources.some((source) => source.active !== false),
    Boolean(project.sodi.sourceMap),
    project.topicCandidates.length === 5,
    project.selectedTopicIds.length > 0,
    project.selectedTopicIds.some((id) => project.topics[id]?.status === "structure_done" || project.topics[id]?.status === "writing" || project.topics[id]?.status === "article_done" || project.topics[id]?.status === "visual_done" || project.topics[id]?.status === "multi_done" || project.topics[id]?.status === "final_done"),
    project.selectedTopicIds.some((id) => project.topics[id]?.status === "article_done" || project.topics[id]?.status === "visual_done" || project.topics[id]?.status === "multi_done" || project.topics[id]?.status === "final_done"),
    project.selectedTopicIds.some((id) => project.topics[id]?.status === "final_done"),
  ];
  const done = units.filter(Boolean).length;
  return {
    percent: Math.round((done / units.length) * 100),
    label: done === units.length ? "발행 준비 완료" : "작업 진행률",
  };
}

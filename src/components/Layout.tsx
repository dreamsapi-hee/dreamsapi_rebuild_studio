import type { PartnerKey, RebuilderProject } from "../types";
import PartnerAvatar from "./PartnerAvatar";
import { partnerCharacters, type CharacterState } from "../data/characters";
import type { CSSProperties } from "react";
import type { StorageHealth } from "../data/storage";
import BrandMascot from "./BrandMascot";
import BrandLogo from "./BrandLogo";

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
  children: React.ReactNode;
}

export default function Layout({ project, onPartnerChange, onTopicChange, onExportJson, onImportJson, onHome, onManageSources, storageHealth, characterStatuses, children }: LayoutProps) {
  const currentTopic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  const completed = project.selectedTopicIds.filter((id) => project.topics[id]?.status === "final_done").length;
  const activeSources = project.masterSources.filter((source) => source.active !== false).length;
  const next = nextAction(project);
  const progress = projectProgress(project);

  return (
    <div className="app-shell">
      <aside className="left-rail">
        <div className="brand">
          <span className="brand-mark logo-mark"><BrandLogo variant="symbol" /></span>
          <div>
            <strong>드림사피</strong>
            <small>Rebuild Studio</small>
          </div>
        </div>
        <nav className="partner-nav" aria-label="파트너 단계">
          <button className="home-nav-button" onClick={onHome}>
            <span>홈으로</span>
          </button>
          {(Object.keys(partnerLabels) as PartnerKey[]).map((partner) => (
            <button
              key={partner}
              className={`${project.currentPartner === partner ? "active" : ""} ${characterStatuses[partner] === "complete" ? "done" : ""}`}
              style={{ "--character-color": partnerCharacters[partner].color } as CSSProperties}
              onClick={() => onPartnerChange(partner)}
            >
              <span className="partner-nav-label">
                <span className="nav-icon-wrap">
                  <PartnerAvatar partner={partner} size="sm" imageRole="icon" />
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
          <div className="summary-manager-badge">
            <BrandMascot size="sm" />
            <span>관리자</span>
          </div>
          <p className="eyebrow">프로젝트</p>
          <h2>{project.projectName}</h2>
          <p className="muted">마지막 저장: {new Date(project.lastSavedAt).toLocaleString("ko-KR")}</p>
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
          <button className="secondary panel-full-button" onClick={onManageSources}>원자료 관리</button>
        </section>

        <section className="panel-card current-status-card priority-panel-card">
          <p className="eyebrow">다음 작업</p>
          <div className="current-partner-line">
            <PartnerAvatar partner={project.currentPartner} size="sm" imageRole="icon" />
            <h3>{partnerLabels[project.currentPartner]}</h3>
          </div>
          <p>{currentTopic ? `현재 글감: ${topicLabel(currentTopic.topicId)} · ${currentTopic.finalTitle}` : "아직 작업할 글감이 정해지지 않았습니다."}</p>
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
            {project.selectedTopicIds.length === 0 && <p className="muted">키디R에서 글감을 체크하면 여기에 표시됩니다.</p>}
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
            <span>{storageHealth.message}</span>
            <small>현재 저장량 {storageHealth.mb >= 0.1 ? `${storageHealth.mb}MB` : `${storageHealth.kb}KB`}</small>
          </div>
          <button className="secondary" onClick={onExportJson}>작업 파일 내보내기</button>
          <label className="file-button">
            작업 파일 가져오기
            <input type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && onImportJson(event.target.files[0])} />
          </label>
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
    return { kind: "sources", title: "원자료가 필요해요", description: "블로그로 바꿀 자료를 먼저 붙여넣거나 다시 사용으로 바꾸세요.", button: "원자료 관리하기" };
  }
  if (!project.sodi.sourceMap) {
    return { kind: "partner", partner: "sodi", title: "소디 결과를 저장하세요", description: "소디 GPT 결과를 붙여넣고 저장하면 키디R로 넘어갈 수 있어요.", button: "소디로 이동" };
  }
  if (project.topicCandidates.length !== 5) {
    return { kind: "partner", partner: "kidiR", title: "글감 5개를 준비하세요", description: "키디R GPT 결과를 붙여넣고 T01~T05 목록으로 정리하세요.", button: "키디R로 이동" };
  }
  if (!project.selectedTopicIds.length) {
    return { kind: "partner", partner: "kidiR", title: "제작할 글감을 고르세요", description: "T01~T05 중 실제로 만들 글감을 하나 이상 체크하세요.", button: "글감 선택하기" };
  }
  const topic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  if (!topic) {
    return { kind: "partner", partner: "kidiR", title: "작업할 글감을 선택하세요", description: "오른쪽 글감 목록이나 키디R 화면에서 이어갈 글감을 선택하세요.", button: "키디R로 이동" };
  }
  if (topic.status === "selected") {
    return { kind: "partner", partner: "rodiR", title: "글 구성을 잡을 차례예요", description: "로디R에서 목차와 흐름을 먼저 설계하면 글쓰기가 쉬워집니다.", button: "로디R로 이동" };
  }
  if (topic.status === "structure_done" || topic.status === "writing") {
    return { kind: "partner", partner: "writeR", title: "본문을 작성하세요", description: "라이R에서 구성안을 블로그 글로 확장하고 저장하세요.", button: "라이R로 이동" };
  }
  if (topic.status === "article_done") {
    return { kind: "partner", partner: "bijiR", title: "이미지 구성을 정하세요", description: "비지R에서 글에 맞는 시각자료를 정리하면 발행 품질이 좋아집니다.", button: "비지R로 이동" };
  }
  if (topic.status === "visual_done") {
    return { kind: "partner", partner: "multiR", title: "SNS 글도 만들까요?", description: "필요한 SNS가 있다면 멀티R에서 확장하고, 아니면 체키R로 넘어가도 됩니다.", button: "멀티R로 이동" };
  }
  if (topic.status === "multi_done") {
    return { kind: "partner", partner: "chekiR", title: "최종 점검만 남았어요", description: "체키R에서 빠진 내용과 어색한 부분을 확인하세요.", button: "체키R로 이동" };
  }
  if (topic.status === "final_done") {
    return { kind: "partner", partner: "kidiR", title: "다음 글감으로 이어가세요", description: "완료한 글감은 두고, 키디R에서 다음 T번호를 선택해 진행하세요.", button: "다음 글감 선택" };
  }
  return { kind: "partner", partner: project.currentPartner, title: "현재 결과를 저장하세요", description: "지금 화면의 결과를 저장하거나 다음 파트너로 넘기세요.", button: "현재 단계 보기" };
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

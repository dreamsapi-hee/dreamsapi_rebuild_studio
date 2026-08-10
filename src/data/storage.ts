import type { RebuilderProject } from "../types";

const PROJECTS_KEY = "dreamsapi_rebuilder_projects";
const ACTIVE_KEY = "dreamsapi_rebuilder_active_project";
const STORAGE_WARNING_BYTES = 3.8 * 1024 * 1024;
const STORAGE_DANGER_BYTES = 4.6 * 1024 * 1024;

export interface StorageHealth {
  bytes: number;
  kb: number;
  mb: number;
  level: "safe" | "warning" | "danger";
  message: string;
}

export const loadProjects = (): RebuilderProject[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as RebuilderProject[]) : [];
  } catch {
    return [];
  }
};

export const saveProjects = (projects: RebuilderProject[]) => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    const message = error instanceof DOMException && error.name === "QuotaExceededError"
      ? "브라우저 저장공간이 부족합니다. 작업 파일을 내보낸 뒤 오래된 프로젝트나 큰 원자료를 삭제해 주세요."
      : "작업을 자동 저장하지 못했습니다. 작업 파일로 백업한 뒤 다시 시도해 주세요.";
    throw new Error(message);
  }
};

export const getActiveProjectId = () => localStorage.getItem(ACTIVE_KEY);

export const setActiveProjectId = (projectId: string) => {
  localStorage.setItem(ACTIVE_KEY, projectId);
};

export const upsertProject = (project: RebuilderProject) => {
  const projects = loadProjects();
  const index = projects.findIndex((item) => item.projectId === project.projectId);
  const next = index >= 0 ? projects.map((item) => (item.projectId === project.projectId ? project : item)) : [project, ...projects];
  saveProjects(next);
  setActiveProjectId(project.projectId);
  return next;
};

export const deleteProject = (projectId: string) => {
  const next = loadProjects().filter((item) => item.projectId !== projectId);
  saveProjects(next);
  if (getActiveProjectId() === projectId) {
    localStorage.removeItem(ACTIVE_KEY);
  }
  return next;
};

export const getStorageHealth = (): StorageHealth => {
  const raw = localStorage.getItem(PROJECTS_KEY) ?? "";
  const bytes = new Blob([raw]).size;
  const level = bytes >= STORAGE_DANGER_BYTES ? "danger" : bytes >= STORAGE_WARNING_BYTES ? "warning" : "safe";
  const messages: Record<StorageHealth["level"], string> = {
    safe: "자동 저장이 정상적으로 작동 중입니다.",
    warning: "저장량이 많아졌습니다. 작업 파일을 한 번 내보내 주세요.",
    danger: "저장공간이 거의 찼습니다. 지금 작업 파일로 백업해 주세요.",
  };

  return {
    bytes,
    kb: Math.max(1, Math.round(bytes / 1024)),
    mb: Number((bytes / 1024 / 1024).toFixed(2)),
    level,
    message: messages[level],
  };
};

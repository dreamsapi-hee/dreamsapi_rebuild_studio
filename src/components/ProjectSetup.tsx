import { useState } from "react";
import type { MasterSource, RebuilderProject } from "../types";
import { nowIso } from "../data/defaults";

interface ProjectSetupProps {
  project: RebuilderProject;
  onUpdate: (project: RebuilderProject) => void;
  onDone?: () => void;
}

const MAX_TEXT_FILE_BYTES = 900 * 1024;
const TEXT_FILE_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "html",
  "htm",
  "srt",
  "vtt",
  "log",
]);

const readTextFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const utf8Text = new TextDecoder("utf-8").decode(buffer);
  const brokenChars = (utf8Text.match(/\uFFFD/g) ?? []).length;

  if (brokenChars > Math.max(3, utf8Text.length * 0.01)) {
    try {
      return new TextDecoder("euc-kr").decode(buffer);
    } catch {
      return utf8Text;
    }
  }

  return utf8Text;
};

const isLikelyTextFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.type.startsWith("text/") || file.type === "application/json" || TEXT_FILE_EXTENSIONS.has(extension);
};

export default function ProjectSetup({ project, onUpdate, onDone }: ProjectSetupProps) {
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const activeCount = project.masterSources.filter((source) => source.active !== false).length;

  const appendSources = (sources: Array<Omit<MasterSource, "sourceId" | "createdAt" | "updatedAt" | "order" | "active">>) => {
    if (!sources.length) return;
    const now = nowIso();
    const startOrder = project.masterSources.length;
    const nextSources: MasterSource[] = sources.map((source, index) => ({
      ...source,
      sourceId: `SRC${String(startOrder + index + 1).padStart(2, "0")}`,
      createdAt: now,
      updatedAt: now,
      order: startOrder + index + 1,
      active: true,
    }));

    onUpdate({
      ...project,
      masterSources: [...project.masterSources, ...nextSources],
      sodi: project.sodi.sourceMap ? { ...project.sodi, status: "outdated", sourceMap: undefined } : project.sodi,
      updatedAt: now,
      lastSavedAt: now,
    });
  };

  const addText = () => {
    if (!draft.trim()) return;
    appendSources([{ title: title.trim() || `원자료 ${project.masterSources.length + 1}`, type: "text", fileName: null, content: draft.trim() }]);
    setDraft("");
    setTitle("");
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const loadedSources: Array<Omit<MasterSource, "sourceId" | "createdAt" | "updatedAt" | "order" | "active">> = [];
    const skipped: string[] = [];

    for (const file of Array.from(files)) {
      if (!isLikelyTextFile(file)) {
        skipped.push(`${file.name} · 텍스트 파일이 아님`);
        continue;
      }

      if (file.size > MAX_TEXT_FILE_BYTES) {
        skipped.push(`${file.name} · ${(file.size / 1024 / 1024).toFixed(1)}MB`);
        continue;
      }

      try {
        const content = await readTextFile(file);
        if (!content.trim()) {
          skipped.push(`${file.name} · 읽을 내용 없음`);
          continue;
        }
        loadedSources.push({ title: file.name.replace(/\.[^.]+$/, ""), type: "text", fileName: file.name, content });
      } catch {
        skipped.push(`${file.name} · 읽기 실패`);
      }
    }

    appendSources(loadedSources);

    if (skipped.length) {
      alert(`일부 파일은 추가하지 않았습니다.\n\n${skipped.join("\n")}\n\n이미지, PDF, 워드 파일은 앱에 직접 저장하지 말고 텍스트로 복사해 붙여넣어 주세요.`);
    }
  };

  const toggleSource = (sourceId: string) => {
    const now = nowIso();
    onUpdate({
      ...project,
      masterSources: project.masterSources.map((source) =>
        source.sourceId === sourceId ? { ...source, active: source.active === false, updatedAt: now } : source,
      ),
      sodi: project.sodi.sourceMap ? { ...project.sodi, status: "outdated", sourceMap: undefined } : project.sodi,
      updatedAt: now,
      lastSavedAt: now,
    });
  };

  return (
    <section className="stage-card setup-card">
      <div className="setup-intro">
        <p className="eyebrow">{project.masterSources.length ? "원자료 관리" : "자료 보관"}</p>
        <h1>{project.masterSources.length ? "원자료를 추가하거나 이번 분석에서 제외할 수 있습니다" : "원자료 저장 후 소디 GPT로 이동합니다"}</h1>
      </div>

      <label>작업 이름</label>
      <input value={project.projectName} onChange={(event) => onUpdate({ ...project, projectName: event.target.value || "블로그제작1" })} placeholder="예: 블로그제작1" />

      <div className="two-col">
        <div>
          <label>자료 이름</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 강의 스크립트 1" />
        </div>
        <div>
          <label>텍스트 파일로 추가</label>
          <input type="file" multiple accept=".txt,.md,.markdown,.csv,.json,.html,.htm,.srt,.vtt,.log,text/*,application/json" onChange={(event) => addFiles(event.target.files)} />
          <p className="field-help">이미지·PDF·워드 파일은 저장공간을 크게 차지할 수 있어 막아두었습니다. 필요한 내용은 텍스트로 복사해 붙여넣어 주세요.</p>
        </div>
      </div>

      <div className="source-input-heading">
        <label>자료 붙여넣기</label>
        <button className="primary" onClick={addText} disabled={!draft.trim()}>자료 저장</button>
      </div>
      <textarea className="source-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="스크립트, 문서, 강의자료, 메모 등을 텍스트로 붙여넣으세요." />

      <div className="source-list">
        {project.masterSources.length > 0 && (
          <div className="source-list-summary">
            <strong>저장된 원자료 {project.masterSources.length}개</strong>
            <span>이번 분석에 사용할 자료 {activeCount}개</span>
          </div>
        )}
        {project.masterSources.map((source) => (
          <article key={source.sourceId} className={source.active === false ? "inactive-source" : ""}>
            <div className="source-item-head">
              <strong>{source.sourceId} · {source.title}</strong>
              <button className="secondary" onClick={() => toggleSource(source.sourceId)}>
                {source.active === false ? "다시 사용" : "이번 분석에서 제외"}
              </button>
            </div>
            <p>{source.content.slice(0, 220)}{source.content.length > 220 ? "…" : ""}</p>
          </article>
        ))}
      </div>

      {onDone && (
        <div className="row-actions">
          <button className="primary" onClick={onDone} disabled={activeCount === 0}>관리 끝내고 소디로</button>
        </div>
      )}
    </section>
  );
}

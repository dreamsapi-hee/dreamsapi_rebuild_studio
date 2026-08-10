import { useEffect, useMemo, useState } from "react";
import Home from "./components/Home";
import Layout from "./components/Layout";
import ProjectSetup from "./components/ProjectSetup";
import SodiStage from "./components/stages/SodiStage";
import KidiStage from "./components/stages/KidiStage";
import RodiStage from "./components/stages/RodiStage";
import WriteStage from "./components/stages/WriteStage";
import BijiStage from "./components/stages/BijiStage";
import MultiStage from "./components/stages/MultiStage";
import ChekiStage from "./components/stages/ChekiStage";
import { createPartnerResult, createProject, nowIso } from "./data/defaults";
import { deleteProject, getStorageHealth, loadProjects, setActiveProjectId, upsertProject } from "./data/storage";
import type { PartnerKey, RebuilderProject, TopicStatus } from "./types";
import { getPartnerCharacterStatuses } from "./data/partnerStatus";
import {
  applyArticleDraft,
  applyChekiDraft,
  applyMultiDraft,
  applyRodiDraft,
  applyVisualDraft,
  confirmArticleTopic,
  confirmBijiTopic,
  confirmRodiTopic,
  confirmSodiResult,
  createKidiDraft,
  createSodiDraft,
  saveChekiTopic,
  saveKidiTopics,
  saveMultiTopic,
  startSelectedTopics,
} from "./data/workflow";
import {
  checkBijiResult,
  checkChekiResult,
  checkKidiResult,
  checkMultiResult,
  checkRodiResult,
  checkSodiResult,
  checkWriteResult,
  shouldContinueWithWarnings,
} from "./utils/resultQuality";

export default function App() {
  const [projects, setProjects] = useState<RebuilderProject[]>([]);
  const [project, setProject] = useState<RebuilderProject | null>(null);
  const [processingPartner, setProcessingPartner] = useState<PartnerKey | null>(null);
  const [showSourceManager, setShowSourceManager] = useState(false);

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
  }, []);

  const commit = (next: RebuilderProject) => {
    const stamped = { ...next, updatedAt: nowIso(), lastSavedAt: nowIso() };
    try {
      setProject(stamped);
      setProjects(upsertProject(stamped));
    } catch (error) {
      alert(error instanceof Error ? error.message : "작업을 저장하지 못했습니다. 작업 파일로 백업해 주세요.");
    }
  };

  const sourceMap = project?.sodi.sourceMap;
  const currentTopic = useMemo(() => (project?.currentTopicId ? project.topics[project.currentTopicId] : null), [project]);
  const characterStatuses = useMemo(
    () => (project ? getPartnerCharacterStatuses(project, processingPartner) : null),
    [project, processingPartner],
  );

  const runPartnerAction = async (partner: PartnerKey, action: () => void) => {
    setProcessingPartner(partner);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    action();
    window.setTimeout(() => setProcessingPartner(null), 250);
  };

  if (!project) {
    return (
      <Home
        projects={projects}
        onCreate={() => {
          const next = createProject();
          setProject(next);
          setProjects(upsertProject(next));
        }}
        onOpen={(projectId, topicId) => {
          const found = projects.find((item) => item.projectId === projectId);
          if (found) {
            const topic = topicId ? found.topics[topicId] : null;
            setActiveProjectId(projectId);
            setProject(topic ? { ...found, currentTopicId: topicId ?? null, currentPartner: getPartnerForTopicStatus(topic.status) } : found);
            setShowSourceManager(false);
          }
        }}
        onDelete={(projectId) => {
          if (!confirm("이 프로젝트를 삭제할까요? localStorage에서 제거됩니다.")) return;
          const next = deleteProject(projectId);
          setProjects(next);
        }}
      />
    );
  }

  const updateCurrentTopic = (mutator: (topic: NonNullable<typeof currentTopic>) => NonNullable<typeof currentTopic>, partner?: PartnerKey) => {
    if (!project.currentTopicId || !currentTopic) return;
    const nextTopic = mutator(currentTopic);
    commit({
      ...project,
      currentPartner: partner ?? project.currentPartner,
      topics: { ...project.topics, [nextTopic.topicId]: { ...nextTopic, updatedAt: nowIso() } },
    });
  };

  const generateSodi = () => {
    commit(createSodiDraft(project));
  };

  const confirmSodi = () => {
    if (!project.sodi.sourceMap && !shouldContinueWithWarnings("소디 결과 확인", checkSodiResult(project.sodi.displayResult))) return;
    commit(confirmSodiResult(project));
  };

  const generateTopics = () => {
    if (!sourceMap) return alert("소디 GPT 결과를 먼저 저장하세요.");
    commit(createKidiDraft(project, sourceMap));
  };

  const saveKidiResult = () => {
    if (!sourceMap) return alert("소디 GPT 결과를 먼저 저장하세요.");
    const rawResult = project.kidiR?.displayResult?.trim() ?? "";
    if (rawResult && !shouldContinueWithWarnings("키디R 결과 확인", checkKidiResult(rawResult))) return;
    commit(saveKidiTopics(project, sourceMap));
  };

  const startTopics = () => {
    const next = startSelectedTopics(project);
    if (next) commit(next);
  };

  const generateRodi = () => {
    if (!sourceMap || !currentTopic) return;
    updateCurrentTopic((topic) => applyRodiDraft(topic, sourceMap));
  };

  const confirmRodi = () => {
    if (!currentTopic || !shouldContinueWithWarnings("로디R 결과 확인", checkRodiResult(currentTopic.rodiR.displayResult))) return;
    updateCurrentTopic(confirmRodiTopic, "writeR");
  };

  const generateArticle = () => {
    if (!sourceMap || !currentTopic) return;
    updateCurrentTopic((topic) => applyArticleDraft(topic, sourceMap, project.settings));
  };

  const confirmArticle = () => {
    if (!currentTopic || !shouldContinueWithWarnings("라이R 결과 확인", checkWriteResult(currentTopic.writeR.displayResult))) return;
    updateCurrentTopic(confirmArticleTopic, "multiR");
  };

  const generateVisuals = () => {
    if (!currentTopic) return;
    updateCurrentTopic(applyVisualDraft);
  };

  const confirmBiji = () => {
    if (!currentTopic || !shouldContinueWithWarnings("비지R 결과 확인", checkBijiResult(currentTopic.bijiR.displayResult))) return;
    updateCurrentTopic(confirmBijiTopic, "chekiR");
  };

  const generateMulti = (platforms: string[]) => {
    updateCurrentTopic((topic) => applyMultiDraft(topic, platforms), "bijiR");
  };

  const saveMultiResult = () => {
    if (!currentTopic || !shouldContinueWithWarnings("멀티R 결과 확인", checkMultiResult(currentTopic.multiR.displayResult))) return;
    updateCurrentTopic(saveMultiTopic, "bijiR");
  };

  const generateCheki = () => {
    if (!sourceMap || !currentTopic) return;
    updateCurrentTopic((topic) => applyChekiDraft(topic, sourceMap));
  };

  const saveChekiResult = () => {
    if (!sourceMap) return;
    if (!currentTopic || !shouldContinueWithWarnings("체키R 결과 확인", checkChekiResult(currentTopic))) return;
    updateCurrentTopic((topic) => saveChekiTopic(topic, sourceMap), "chekiR");
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<RebuilderProject>;
      if (parsed.schemaVersion !== "1.0" || !parsed.projectId || !parsed.projectName) {
        return alert("드림사피 작업 파일이 아닙니다. 앱에서 내보낸 JSON 파일을 선택해 주세요.");
      }
      commit(parsed as RebuilderProject);
      alert("작업 파일을 가져왔습니다.");
    } catch {
      alert("JSON 파일을 읽지 못했습니다. 파일이 깨졌거나 형식이 맞지 않습니다.");
    }
  };

  return (
    <Layout
      project={project}
      onPartnerChange={(currentPartner) => {
        setShowSourceManager(false);
        commit({ ...project, currentPartner });
      }}
      onTopicChange={(currentTopicId) => commit({ ...project, currentTopicId })}
      onExportJson={() => {
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${project.projectName.replace(/[^\w가-힣-]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      }}
      onImportJson={importJson}
      storageHealth={getStorageHealth()}
      onHome={() => setProject(null)}
      onManageSources={() => setShowSourceManager(true)}
      characterStatuses={characterStatuses!}
    >
      {showSourceManager || (project.currentPartner === "sodi" && !project.masterSources.length) ? (
        <ProjectSetup project={project} onUpdate={commit} onDone={() => {
          setShowSourceManager(false);
          commit({ ...project, currentPartner: "sodi" });
        }} />
      ) : (
        <>
          {project.currentPartner === "sodi" && (
            <SodiStage
              project={project}
              onGenerate={() => runPartnerAction("sodi", generateSodi)}
              onConfirm={confirmSodi}
              onPatchSodi={(displayResult) => commit({ ...project, sodi: { ...project.sodi, displayResult, status: "saved" } })}
              characterState={characterStatuses!.sodi}
            />
          )}
          {project.currentPartner === "kidiR" && (
            <KidiStage
              project={project}
              onGenerate={() => runPartnerAction("kidiR", generateTopics)}
              onPatchKidi={(displayResult) => commit({ ...project, kidiR: { ...(project.kidiR ?? createPartnerResult()), displayResult, status: "saved", updatedAt: nowIso() } })}
              onSaveKidi={saveKidiResult}
              onToggle={(id) => commit({ ...project, topicCandidates: project.topicCandidates.map((item) => item.id === id ? { ...item, selected: !item.selected } : item) })}
              onTitleChange={(id, finalTitle) => commit({ ...project, topicCandidates: project.topicCandidates.map((item) => item.id === id ? { ...item, finalTitle } : item) })}
              onStartTopics={startTopics}
              characterState={characterStatuses!.kidiR}
            />
          )}
          {project.currentPartner === "rodiR" && <RodiStage project={project} onGenerate={() => runPartnerAction("rodiR", generateRodi)} onPatchRodi={(displayResult) => updateCurrentTopic((topic) => ({ ...topic, rodiR: { ...topic.rodiR, displayResult, status: "saved" } }))} onConfirm={confirmRodi} characterState={characterStatuses!.rodiR} />}
          {project.currentPartner === "writeR" && <WriteStage project={project} onSettings={(settings) => commit({ ...project, settings })} onGenerate={() => runPartnerAction("writeR", generateArticle)} onPatchWrite={(displayResult) => updateCurrentTopic((topic) => ({ ...topic, writeR: { ...topic.writeR, displayResult, status: "saved", article: topic.writeR.article ? { ...topic.writeR.article, bodyMarkdown: displayResult } : undefined } }))} onConfirm={confirmArticle} characterState={characterStatuses!.writeR} />}
          {project.currentPartner === "bijiR" && <BijiStage project={project} onGenerate={() => runPartnerAction("bijiR", generateVisuals)} onPatchBiji={(displayResult) => updateCurrentTopic((topic) => ({ ...topic, bijiR: { ...topic.bijiR, displayResult, status: "saved" } }))} onConfirm={confirmBiji} characterState={characterStatuses!.bijiR} />}
          {project.currentPartner === "multiR" && <MultiStage project={project} onGenerate={(platforms) => runPartnerAction("multiR", () => generateMulti(platforms))} onPatchMulti={(displayResult) => updateCurrentTopic((topic) => ({ ...topic, multiR: { ...topic.multiR, displayResult, status: "saved" } }))} onSaveMulti={saveMultiResult} onSkip={() => updateCurrentTopic((topic) => ({ ...topic, status: "multi_done", multiR: { ...createPartnerResult("skipped"), confirmedAt: nowIso() } }), "bijiR")} characterState={characterStatuses!.multiR} />}
          {project.currentPartner === "chekiR" && <ChekiStage project={project} onGenerate={() => runPartnerAction("chekiR", generateCheki)} onPatchCheki={(displayResult) => updateCurrentTopic((topic) => ({ ...topic, chekiR: { ...topic.chekiR, displayResult, status: "saved" } }))} onSaveCheki={saveChekiResult} onComplete={() => updateCurrentTopic((topic) => ({ ...topic, status: "final_done", completed: true }), "chekiR")} onBackToTopics={() => commit({ ...project, currentPartner: "kidiR" })} characterState={characterStatuses!.chekiR} />}
        </>
      )}
    </Layout>
  );
}

function getPartnerForTopicStatus(status: TopicStatus): PartnerKey {
  if (status === "selected") return "rodiR";
  if (status === "structure_done" || status === "writing") return "writeR";
  if (status === "article_done") return "multiR";
  if (status === "multi_done") return "bijiR";
  if (status === "visual_done" || status === "final_done") return "chekiR";
  return "kidiR";
}

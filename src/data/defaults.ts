import type { PartnerResult, RebuilderProject, TopicWork } from "../types";

export const nowIso = () => new Date().toISOString();

export const createPartnerResult = (status: PartnerResult["status"] = "not_started"): PartnerResult => {
  const now = nowIso();
  return {
    status,
    displayResult: "",
    handoff: {},
    settings: {},
    createdAt: now,
    updatedAt: now,
    confirmedAt: null,
    version: 1,
  };
};

export const createProject = (projectName = "블로그제작1"): RebuilderProject => {
  const now = nowIso();
  return {
    schemaVersion: "1.0",
    projectId: `project-${Date.now()}`,
    projectName,
    createdAt: now,
    updatedAt: now,
    currentPartner: "sodi",
    currentTopicId: null,
    lastSavedAt: now,
    settings: {
      platform: "naver_blog",
      writingMode: "ai_recommended",
      length: "normal",
      tone: "friendly_expert",
    },
    masterSources: [],
    sodi: createPartnerResult(),
    kidiR: createPartnerResult(),
    topicCandidates: [],
    selectedTopicIds: [],
    topics: {},
    versions: [],
  };
};

export const createTopicWork = (topicId: string, topic: string, finalTitle: string, kidiHandoff: Record<string, unknown>): TopicWork => {
  const now = nowIso();
  return {
    topicId,
    topic,
    finalTitle,
    status: "selected",
    completed: false,
    selectedAt: now,
    updatedAt: now,
    kidiR: { ...createPartnerResult("confirmed"), displayResult: topic, handoff: kidiHandoff, confirmedAt: now },
    rodiR: createPartnerResult(),
    writeR: createPartnerResult(),
    bijiR: createPartnerResult(),
    multiR: createPartnerResult(),
    chekiR: createPartnerResult(),
    versions: [],
  };
};

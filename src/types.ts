export type PartnerKey = "sodi" | "kidiR" | "rodiR" | "writeR" | "bijiR" | "multiR" | "chekiR";

export type TopicStatus =
  | "not_selected"
  | "selected"
  | "structure_done"
  | "writing"
  | "article_done"
  | "visual_done"
  | "multi_done"
  | "final_done"
  | "archived";

export type ResultStatus = "not_started" | "working" | "saved" | "confirmed" | "skipped" | "outdated";

export interface MasterSource {
  sourceId: string;
  title: string;
  type: "text" | "pdf" | "doc" | "slide" | "other";
  fileName: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  active: boolean;
}

export interface SourceMapSection {
  sectionId: string;
  sourceId: string;
  label: string;
  summary: string;
  details: string[];
  examples: string[];
  tips: string[];
  cautions: string[];
  reuseValue: "high" | "medium" | "low";
}

export interface SourceMap {
  overview: {
    topic: string;
    purpose: string;
    audience: string;
    coreMessage: string;
  };
  sections: SourceMapSection[];
  coreFacts: string[];
  detailFacts: string[];
  examples: string[];
  prompts: string[];
  expressionPatterns: string[];
  reuseRules: {
    use: string[];
    ideaOnly: string[];
    change: string[];
  };
  verifyItems: string[];
}

export interface PartnerResult {
  status: ResultStatus;
  displayResult: string;
  handoff: Record<string, unknown>;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  version: number;
}

export interface TopicCandidate {
  id: string;
  topic: string;
  question: string;
  audience: string;
  sourceRefs: string[];
  coreMessage: string;
  recommendationReason: string;
  recommended: boolean;
  selected: boolean;
  titleCandidates: { id: string; title: string; recommended: boolean }[];
  finalTitle: string;
  createdSet: number;
}

export interface TopicWork {
  topicId: string;
  topic: string;
  finalTitle: string;
  status: TopicStatus;
  completed: boolean;
  selectedAt: string;
  updatedAt: string;
  kidiR: PartnerResult;
  rodiR: PartnerResult;
  writeR: PartnerResult & {
    article?: {
      title: string;
      bodyMarkdown: string;
      keywords: string[];
      metaDescription: string;
    };
  };
  bijiR: PartnerResult & {
    recommendedCount?: number;
    selectedCount?: number;
    visualStyle?: string;
    visuals?: VisualPlan[];
  };
  multiR: PartnerResult & {
    selectedPlatforms?: string[];
    outputs?: Record<string, unknown>;
  };
  chekiR: PartnerResult & {
    report?: Record<string, string | string[]>;
    finalPackage?: FinalPackage;
    completedAt?: string;
  };
  versions: { versionId: string; scope: string; createdAt: string; snapshot: unknown }[];
}

export interface VisualPlan {
  id: string;
  role: string;
  insertAfter: string;
  message: string;
  layout: string;
  text: string;
  ratio: string;
  prompt: string;
  productionType: "ai_image" | "infographic" | "screenshot" | "card";
}

export interface FinalPackage {
  title: string;
  articleMarkdown: string;
  keywords: string[];
  metaDescription: string;
  naverPublishKit?: NaverPublishKit;
  visuals: VisualPlan[];
  snsOutputs: Record<string, unknown>;
  verifyItems: string[];
}

export interface NaverPublishKit {
  mainKeyword: string;
  subKeywords: string[];
  longTailKeywords: string[];
  titleOptions: string[];
  openingHook: string;
  tags: string[];
  publishSettings?: {
    category: string;
    topic: string;
    visibility: string;
    permissions: string[];
    tagInput: string;
    publishTime: string;
    notice: string;
    keepDefaultSettings: string;
  };
  publishChecklist: string[];
  caution: string;
}

export interface RebuilderProject {
  schemaVersion: "1.0";
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  currentPartner: PartnerKey;
  currentTopicId: string | null;
  lastSavedAt: string;
  settings: {
    platform: string;
    writingMode: string;
    length: string;
    tone: string;
  };
  masterSources: MasterSource[];
  sodi: PartnerResult & { sourceMap?: SourceMap };
  kidiR?: PartnerResult;
  topicCandidates: TopicCandidate[];
  selectedTopicIds: string[];
  topics: Record<string, TopicWork>;
  versions: { versionId: string; scope: string; createdAt: string; snapshot: unknown }[];
}

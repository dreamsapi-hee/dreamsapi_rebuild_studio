import type { PartnerKey, RebuilderProject } from "../types";
import type { CharacterState } from "./characters";

export type PartnerCharacterStatusMap = Record<PartnerKey, CharacterState>;

export const partnerOrder: PartnerKey[] = ["sodi", "kidiR", "rodiR", "writeR", "bijiR", "multiR", "chekiR"];

export const getPartnerCharacterStatuses = (
  project: RebuilderProject,
  processingPartner: PartnerKey | null = null,
): PartnerCharacterStatusMap => {
  const statuses = Object.fromEntries(partnerOrder.map((partner) => [partner, "default"])) as PartnerCharacterStatusMap;

  if (project.sodi.sourceMap || project.sodi.status === "confirmed") statuses.sodi = "complete";
  if (project.topicCandidates.length === 5 && project.selectedTopicIds.length > 0) statuses.kidiR = "complete";

  const currentTopic = project.currentTopicId ? project.topics[project.currentTopicId] : null;
  if (currentTopic) {
    if (currentTopic.rodiR.status === "confirmed" || ["structure_done", "writing", "article_done", "visual_done", "multi_done", "final_done"].includes(currentTopic.status)) {
      statuses.rodiR = "complete";
    }
    if (currentTopic.writeR.status === "confirmed" || ["article_done", "visual_done", "multi_done", "final_done"].includes(currentTopic.status)) {
      statuses.writeR = "complete";
    }
    if (currentTopic.bijiR.status === "confirmed" || ["visual_done", "multi_done", "final_done"].includes(currentTopic.status)) {
      statuses.bijiR = "complete";
    }
    if (currentTopic.multiR.status === "confirmed" || currentTopic.multiR.status === "skipped" || ["multi_done", "final_done"].includes(currentTopic.status)) {
      statuses.multiR = "complete";
    }
    if (currentTopic.chekiR.status === "confirmed" || currentTopic.status === "final_done") {
      statuses.chekiR = "complete";
    }
  }

  if (processingPartner) statuses[processingPartner] = "analyzing";

  return statuses;
};


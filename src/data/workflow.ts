import type { RebuilderProject, SourceMap, TopicWork } from "../types";
import { createPartnerResult, createTopicWork, nowIso } from "./defaults";
import {
  buildArticle,
  buildFinalPackage,
  buildRodiResult,
  buildSodiDisplay,
  buildSodiHandoff,
  buildSourceMap,
  buildTopicCandidates,
  buildVisuals,
} from "./generators";
import { extractKidiIdeas, uniqueTitles } from "../utils/kidiParser";

export function getActiveSources(project: RebuilderProject) {
  return project.masterSources.filter((source) => source.active !== false);
}

export function createSodiDraft(project: RebuilderProject): RebuilderProject {
  const sources = getActiveSources(project).length ? getActiveSources(project) : project.masterSources;
  const map = buildSourceMap(sources);

  return {
    ...project,
    currentPartner: "sodi",
    sodi: {
      ...createPartnerResult("confirmed"),
      displayResult: buildSodiDisplay(map),
      sourceMap: map,
      handoff: buildSodiHandoff(map),
      confirmedAt: nowIso(),
    },
  };
}

export function confirmSodiResult(project: RebuilderProject): RebuilderProject {
  const sources = getActiveSources(project).length ? getActiveSources(project) : project.masterSources;
  const map = project.sodi.sourceMap ?? buildSourceMap(sources);

  return {
    ...project,
    currentPartner: "kidiR",
    sodi: {
      ...createPartnerResult("confirmed"),
      displayResult: project.sodi.displayResult.trim() || buildSodiDisplay(map),
      sourceMap: map,
      handoff: buildSodiHandoff(map),
      confirmedAt: nowIso(),
    },
  };
}

export function createKidiDraft(project: RebuilderProject, sourceMap: SourceMap): RebuilderProject {
  const createdSet = nextCandidateSet(project);

  return {
    ...project,
    currentPartner: "kidiR",
    kidiR: { ...(project.kidiR ?? createPartnerResult()), status: "saved", updatedAt: nowIso() },
    topicCandidates: buildTopicCandidates(sourceMap, createdSet),
  };
}

export function saveKidiTopics(project: RebuilderProject, sourceMap: SourceMap): RebuilderProject {
  const createdSet = nextCandidateSet(project);
  const rawResult = project.kidiR?.displayResult?.trim() ?? "";
  const baseCandidates = project.topicCandidates.length ? project.topicCandidates : buildTopicCandidates(sourceMap, createdSet);
  const pastedIdeas = extractKidiIdeas(rawResult);
  const topicCandidates = baseCandidates.slice(0, 5).map((candidate, index) => {
    const idea = pastedIdeas[index];
    if (!idea) return candidate;

    const titles = uniqueTitles([
      ...idea.titleCandidates,
      ...candidate.titleCandidates.map((title) => title.title),
      idea.topic,
    ]).slice(0, 5);

    return {
      ...candidate,
      topic: idea.topic,
      finalTitle: titles[0] ?? idea.topic,
      recommendationReason: "키디R GPT 결과에서 가져온 글감입니다.",
      titleCandidates: titles.map((title, titleIndex) => ({
        id: `${candidate.id}-${String(titleIndex + 1).padStart(2, "0")}`,
        title,
        recommended: titleIndex === 0,
      })),
    };
  });

  return {
    ...project,
    currentPartner: "kidiR",
    kidiR: {
      ...(project.kidiR ?? createPartnerResult()),
      status: "confirmed",
      displayResult: rawResult || project.kidiR?.displayResult || "앱에서 임시로 글감 5개를 만들었습니다.",
      handoff: { status: "confirmed", topic_count: topicCandidates.length, next_partner: "로디R" },
      confirmedAt: nowIso(),
      updatedAt: nowIso(),
    },
    topicCandidates,
  };
}

export function startSelectedTopics(project: RebuilderProject): RebuilderProject | null {
  const selected = project.topicCandidates.filter((item) => item.selected);
  if (!selected.length) return null;

  const nextTopics = { ...project.topics };
  selected.forEach((candidate) => {
    const handoff = {
      topic_id: candidate.id,
      status: "confirmed",
      topic: candidate.topic,
      final_title: candidate.finalTitle,
      audience: candidate.audience,
      reader_question: candidate.question,
      core_message: candidate.coreMessage,
      source_map_refs: candidate.sourceRefs,
      must_include: [candidate.coreMessage],
      next_partner: "로디R",
    };

    nextTopics[candidate.id] = nextTopics[candidate.id]
      ? {
          ...nextTopics[candidate.id],
          topic: candidate.topic,
          finalTitle: candidate.finalTitle,
          kidiR: {
            ...nextTopics[candidate.id].kidiR,
            handoff,
            updatedAt: nowIso(),
          },
          updatedAt: nowIso(),
        }
      : createTopicWork(candidate.id, candidate.topic, candidate.finalTitle, handoff);
  });

  const currentTopicStillSelected = project.currentTopicId && selected.some((item) => item.id === project.currentTopicId);
  const currentTopicId = currentTopicStillSelected ? project.currentTopicId : selected[0].id;

  return {
    ...project,
    currentPartner: "rodiR",
    currentTopicId,
    selectedTopicIds: selected.map((item) => item.id),
    topics: nextTopics,
  };
}

export function applyRodiDraft(topic: TopicWork, sourceMap: SourceMap): TopicWork {
  const result = buildRodiResult(topic, sourceMap);
  return {
    ...topic,
    status: "structure_done",
    rodiR: { ...createPartnerResult("confirmed"), displayResult: result.displayResult, handoff: result.handoff, confirmedAt: nowIso() },
  };
}

export function confirmRodiTopic(topic: TopicWork): TopicWork {
  return {
    ...topic,
    status: "structure_done",
    rodiR: { ...topic.rodiR, status: "confirmed", confirmedAt: nowIso() },
  };
}

export function applyArticleDraft(topic: TopicWork, sourceMap: SourceMap, settings: RebuilderProject["settings"]): TopicWork {
  const result = buildArticle(topic, sourceMap, settings);
  return {
    ...topic,
    status: "writing",
    writeR: { ...createPartnerResult("saved"), displayResult: result.displayResult, handoff: result.handoff, article: result.article, settings },
  };
}

export function confirmArticleTopic(topic: TopicWork): TopicWork {
  return {
    ...topic,
    status: "article_done",
    writeR: { ...topic.writeR, status: "confirmed", confirmedAt: nowIso() },
  };
}

export function applyVisualDraft(topic: TopicWork): TopicWork {
  const visuals = buildVisuals(topic);
  return {
    ...topic,
    status: "visual_done",
    bijiR: {
      ...createPartnerResult("confirmed"),
      displayResult: JSON.stringify(visuals, null, 2),
      recommendedCount: visuals.length,
      selectedCount: visuals.length,
      visualStyle: "mixed",
      visuals,
      handoff: {
        topic_id: topic.topicId,
        status: "confirmed",
        visual_count: visuals.length,
        visual_style: "mixed",
        key_visuals: visuals.map((visual) => `${visual.id}: ${visual.role}`),
        next_partner: "체키R",
      },
      confirmedAt: nowIso(),
    },
  };
}

export function confirmBijiTopic(topic: TopicWork): TopicWork {
  return {
    ...topic,
    status: "visual_done",
    bijiR: { ...topic.bijiR, status: "confirmed", confirmedAt: nowIso() },
  };
}

export function applyMultiDraft(topic: TopicWork, platforms: string[]): TopicWork {
  const outputs = Object.fromEntries(platforms.map((platform) => [platform, {
    title: topic.finalTitle,
    summary: `${topic.finalTitle} 내용을 플랫폼 특성에 맞게 재구성한 초안입니다.`,
    sourcePolicy: "MASTER SOURCE와 SOURCE MAP을 함께 참조",
  }]));

  return {
    ...topic,
    status: "multi_done",
    multiR: {
      ...createPartnerResult("confirmed"),
      displayResult: JSON.stringify(outputs, null, 2),
      selectedPlatforms: platforms,
      outputs,
      handoff: { topic_id: topic.topicId, status: "confirmed", created_platforms: platforms, next_partner: "비지R" },
      confirmedAt: nowIso(),
    },
  };
}

export function saveMultiTopic(topic: TopicWork): TopicWork {
  return {
    ...topic,
    status: "multi_done",
    multiR: {
      ...topic.multiR,
      status: "confirmed",
      outputs: topic.multiR.outputs ?? { pasted_result: topic.multiR.displayResult },
      handoff: { topic_id: topic.topicId, status: "confirmed", source: "pasted_result", next_partner: "비지R" },
      confirmedAt: nowIso(),
    },
  };
}

export function applyChekiDraft(topic: TopicWork, sourceMap: SourceMap): TopicWork {
  const finalPackage = buildFinalPackage(topic, sourceMap);
  return {
    ...topic,
    chekiR: {
      ...createPartnerResult("confirmed"),
      displayResult: finalPackage.articleMarkdown,
      report: {
        sourceUtilization: "pass",
        differentiation: "pass",
        factuality: "warning",
        structure: "pass",
        richness: "pass",
        readability: "pass",
        duplication: "pass",
        audienceFit: "pass",
        visual: topic.bijiR.visuals?.length ? "pass" : "warning",
        sns: topic.multiR.outputs ? "pass" : "skipped",
        notes: ["수치·날짜·고유명사는 발행 전 확인하세요."],
      },
      finalPackage,
      handoff: { topic_id: topic.topicId, status: "final_done" },
      confirmedAt: nowIso(),
      completedAt: nowIso(),
    },
  };
}

export function saveChekiTopic(topic: TopicWork, sourceMap: SourceMap): TopicWork {
  const fallbackPackage = buildFinalPackage(topic, sourceMap);
  const articleMarkdown = topic.chekiR.displayResult.trim() || fallbackPackage.articleMarkdown;
  return {
    ...topic,
    chekiR: {
      ...topic.chekiR,
      status: "confirmed",
      displayResult: articleMarkdown,
      finalPackage: { ...fallbackPackage, articleMarkdown },
      handoff: { topic_id: topic.topicId, status: "final_saved" },
      confirmedAt: nowIso(),
    },
  };
}

function nextCandidateSet(project: RebuilderProject) {
  return Math.max(0, ...project.topicCandidates.map((item) => item.createdSet)) + 1;
}

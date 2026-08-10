import type { FinalPackage, MasterSource, NaverPublishKit, SourceMap, TopicCandidate, TopicWork, VisualPlan } from "../types";

const compact = (text: string, max = 140) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
};

const splitSentences = (text: string) =>
  text
    .replace(/\r/g, "")
    .split(/(?<=[.!?。！？])\s+|\n{2,}|[•·]\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 12);

const extractKeywords = (text: string, limit = 8) => {
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !["그리고", "하지만", "합니다", "있는", "없는", "위해", "통해", "대한"].includes(word));
  const counts = new Map<string, number>();
  words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

export const buildSourceMap = (sources: MasterSource[]): SourceMap => {
  const allText = sources.map((source) => source.content).join("\n\n");
  const sentences = splitSentences(allText);
  const keywords = extractKeywords(allText);
  const sections = sources.flatMap((source) => {
    const sourceSentences = splitSentences(source.content);
    const chunkSize = Math.max(3, Math.ceil(sourceSentences.length / 4));
    const chunks = Array.from({ length: Math.max(1, Math.ceil(sourceSentences.length / chunkSize)) }, (_, index) =>
      sourceSentences.slice(index * chunkSize, (index + 1) * chunkSize),
    );
    return chunks.map((chunk, index) => ({
      sectionId: `${source.sourceId}-S${String(index + 1).padStart(2, "0")}`,
      sourceId: source.sourceId,
      label: `${source.title || source.sourceId} 핵심 구간 ${index + 1}`,
      summary: compact(chunk[0] ?? source.content, 120),
      details: chunk.slice(0, 5).map((item) => compact(item, 160)),
      examples: chunk.filter((item) => /예|사례|예시|case|prompt|프롬프트/i.test(item)).slice(0, 3).map((item) => compact(item, 150)),
      tips: chunk.filter((item) => /팁|방법|단계|주의|먼저|해야|추천/i.test(item)).slice(0, 3).map((item) => compact(item, 150)),
      cautions: chunk.filter((item) => /주의|금지|실패|오류|위험|하지/i.test(item)).slice(0, 3).map((item) => compact(item, 150)),
      reuseValue: (chunk.join(" ").length > 400 ? "high" : "medium") as "high" | "medium",
    }));
  });

  return {
    overview: {
      topic: keywords.slice(0, 3).join(" · ") || "입력 원자료 기반 콘텐츠",
      purpose: "원자료의 정보량을 보존하면서 블로그 콘텐츠로 재구성",
      audience: "이 주제에 관심이 있지만 실행 순서와 판단 기준이 필요한 독자",
      coreMessage: compact(sentences[0] ?? allText, 180),
    },
    sections,
    coreFacts: sentences.slice(0, 8).map((item) => compact(item, 160)),
    detailFacts: sentences.slice(8, 18).map((item) => compact(item, 160)),
    examples: sentences.filter((item) => /예|사례|예시|경험|실전/i.test(item)).slice(0, 8).map((item) => compact(item, 160)),
    prompts: sentences.filter((item) => /프롬프트|prompt|입력|명령/i.test(item)).slice(0, 8).map((item) => compact(item, 180)),
    expressionPatterns: sentences.slice(0, 5).map((item) => compact(item, 100)),
    reuseRules: {
      use: ["핵심 정보, 단계, 조건, 팁은 보존한다.", "검증이 필요한 항목은 최종 검수에서 다시 확인한다."],
      ideaOnly: ["원자료의 도입 순서와 문장 리듬은 아이디어 수준으로만 참고한다."],
      change: ["블로그 구조, 제목, 표현, 사례 연결 방식은 새롭게 설계한다."],
    },
    verifyItems: ["고유명사, 수치, 날짜, 도구명은 발행 전 확인한다.", "원자료의 독특한 표현을 그대로 복제하지 않았는지 점검한다."],
  };
};

export const buildSodiDisplay = (sourceMap: SourceMap) => `# 소디 분석 결과

## 원자료 전체 관찰
- 중심 주제: ${sourceMap.overview.topic}
- 목적: ${sourceMap.overview.purpose}
- 예상 독자: ${sourceMap.overview.audience}
- 핵심 메시지: ${sourceMap.overview.coreMessage}

## SOURCE MAP 주요 구간
${sourceMap.sections
  .map(
    (section) => `### ${section.sectionId}. ${section.label}
- 요약: ${section.summary}
- 세부 정보: ${section.details.join(" / ") || "추가 분석 필요"}
- 재사용 가치: ${section.reuseValue}`,
  )
  .join("\n\n")}

## 재구성 원칙
- 정보와 판단 기준은 보존
- 구조와 표현은 새로 설계
- 사례와 프롬프트는 목적에 맞게 일반화 또는 재작성`;

export const buildSodiHandoff = (sourceMap: SourceMap) => ({
  partner: "소디",
  status: "confirmed",
  source_overview: sourceMap.overview,
  topic_seeds: sourceMap.coreFacts.slice(0, 5),
  high_value_sections: sourceMap.sections.slice(0, 5).map((section) => ({ source_map_ref: section.sectionId, value: section.summary })),
  verify_items: sourceMap.verifyItems,
  next_partner: "키디R",
});

export const buildTopicCandidates = (sourceMap: SourceMap, createdSet = 1): TopicCandidate[] => {
  const seeds = [...sourceMap.coreFacts, ...sourceMap.detailFacts, ...sourceMap.sections.map((section) => section.summary)].filter(Boolean);
  const angles = [
    ["문제 해결형", "막히는 지점을 어떻게 풀 수 있을까?"],
    ["튜토리얼형", "처음 하는 사람은 어떤 순서로 따라가면 좋을까?"],
    ["비교/판단형", "무엇을 기준으로 선택해야 할까?"],
    ["실전 체크리스트형", "실행 전에 무엇을 확인해야 할까?"],
    ["확장 활용형", "이 내용을 다른 콘텐츠로 어떻게 넓힐 수 있을까?"],
  ];
  return angles.map(([angle, question], index) => {
    const id = `T${String(index + 1).padStart(2, "0")}`;
    const keyword = extractKeywords(seeds[index] ?? sourceMap.overview.topic, 3).join(" ");
    const topic = `${angle}: ${keyword || sourceMap.overview.topic}`;
    return {
      id,
      topic,
      question,
      audience: index < 2 ? "입문자와 실무 적용이 필요한 독자" : "선택 기준과 실행 팁이 필요한 독자",
      sourceRefs: sourceMap.sections.slice(index, index + 2).map((section) => section.sectionId),
      coreMessage: compact(seeds[index] ?? sourceMap.overview.coreMessage, 150),
      recommendationReason: index === 0 ? "원자료의 문제와 해결 흐름을 가장 빠르게 블로그화할 수 있습니다." : "원자료의 세부 정보를 다른 관점으로 살릴 수 있습니다.",
      recommended: index === 0,
      selected: index === 0,
      titleCandidates: Array.from({ length: 5 }, (_, titleIndex) => ({
        id: `${id}-${String(titleIndex + 1).padStart(2, "0")}`,
        title: [
          `${keyword || "핵심 주제"}를 블로그 콘텐츠로 바꾸는 방법`,
          `처음부터 따라 하는 ${keyword || "콘텐츠 재구성"} 가이드`,
          `${keyword || "원자료"}에서 놓치면 아까운 ${titleIndex + 3}가지 포인트`,
          `자료를 버리지 않고 새 글로 재설계하는 법`,
          `실무자가 바로 쓰는 ${keyword || "콘텐츠"} 체크리스트`,
        ][titleIndex],
        recommended: titleIndex === 0,
      })),
      finalTitle: `${keyword || "핵심 주제"}를 블로그 콘텐츠로 바꾸는 방법`,
      createdSet,
    };
  });
};

export const buildRodiResult = (topic: TopicWork, sourceMap: SourceMap) => {
  const refs = (topic.kidiR.handoff.source_map_refs as string[] | undefined) ?? sourceMap.sections.slice(0, 3).map((section) => section.sectionId);
  const outline = [
    { order: 1, heading: "독자가 지금 막히는 지점 열기", role: "문제 공감과 글의 약속", sourceRefs: refs.slice(0, 1), mustInclude: [topic.topic] },
    { order: 2, heading: "원자료에서 건져야 할 핵심 정보", role: "정보 보존", sourceRefs: refs, mustInclude: sourceMap.coreFacts.slice(0, 3) },
    { order: 3, heading: "새로운 실행 구조로 재배열하기", role: "재구성", sourceRefs: refs, mustInclude: ["단계, 조건, 판단 기준을 블로그 독자 관점으로 재배치"] },
    { order: 4, heading: "바로 적용하는 예시와 프롬프트", role: "실행 지원", sourceRefs: refs, mustInclude: sourceMap.prompts.slice(0, 2) },
    { order: 5, heading: "마무리 체크리스트", role: "행동 유도", sourceRefs: refs, mustInclude: sourceMap.verifyItems },
  ];
  const handoff = {
    topic_id: topic.topicId,
    status: "confirmed",
    recommendedWritingMode: "problem_solving",
    coreMessage: topic.kidiR.handoff.core_message ?? topic.topic,
    outline,
    avoid: ["원자료의 도입 순서를 그대로 복제하지 않기", "SOURCE MAP을 요약본처럼만 사용하지 않기"],
    next_partner: "라이R",
  };
  return {
    displayResult: `# 로디R 구조 설계 — ${topic.finalTitle}

## 원자료 vs 새 글
| 구분 | 설계 방향 |
|---|---|
| 원자료 | 정보, 사례, 팁, 프롬프트를 SOURCE MAP 기준으로 보존 |
| 새 글 | 독자의 문제 → 핵심 정보 → 실행 구조 → 예시 → 체크리스트 흐름으로 재설계 |

## 추천 글 구조
${outline.map((item) => `${item.order}. ${item.heading}\n   - 역할: ${item.role}\n   - SOURCE MAP: ${item.sourceRefs.join(", ") || "공통 참조"}`).join("\n")}`,
    handoff,
  };
};

export const buildArticle = (topic: TopicWork, sourceMap: SourceMap, settings: Record<string, unknown>) => {
  const title = topic.finalTitle;
  const bodyMarkdown = `# ${title}

원자료를 블로그 글로 바꿀 때 가장 아까운 손실은 “좋은 정보가 요약 과정에서 사라지는 것”입니다. 이 글은 ${topic.topic} 관점에서 원자료의 핵심을 보존하면서도, 독자가 바로 따라올 수 있는 새 구조로 다시 정리합니다.

## 1. 먼저 문제를 분명히 보기

${sourceMap.overview.coreMessage}

이 내용은 단순히 문장을 바꾸는 문제가 아니라, 독자가 어떤 순서로 이해하고 실행할지를 다시 설계하는 문제입니다.

## 2. 원자료에서 반드시 살릴 정보

${sourceMap.coreFacts.slice(0, 5).map((fact) => `- ${fact}`).join("\n")}

## 3. 새 글에서는 이렇게 재배열합니다

${((topic.rodiR.handoff.outline as { heading: string; role: string }[] | undefined) ?? [])
  .map((item, index) => `${index + 1}. **${item.heading}** — ${item.role}`)
  .join("\n")}

## 4. 바로 적용하는 팁

${(sourceMap.sections[0]?.tips.length ? sourceMap.sections[0].tips : ["핵심 개념을 먼저 정리하고, 사례는 독자가 이해하기 쉬운 맥락으로 교체합니다.", "프롬프트나 체크리스트는 글 말미에 실행 도구로 배치합니다."])
  .map((tip) => `- ${tip}`)
  .join("\n")}

## 5. 마무리 체크리스트

- MASTER SOURCE의 정보가 사라지지 않았는가?
- SOURCE MAP의 세부 정보가 적어도 3개 이상 반영되었는가?
- 구조와 표현은 새 글의 목적에 맞게 바뀌었는가?
- 독자가 다음 행동을 바로 알 수 있는가?

결론적으로 좋은 리빌딩은 요약이 아니라 재설계입니다. 원자료의 정보 밀도는 지키고, 독자의 읽기 경험은 완전히 새로 만들어야 합니다.`;
  const keywords = extractKeywords(`${title} ${bodyMarkdown}`, 6);
  return {
    article: {
      title,
      bodyMarkdown,
      keywords,
      metaDescription: compact(`${title}에 대해 원자료를 보존하면서 블로그 콘텐츠로 재구성하는 실전 가이드입니다.`, 150),
    },
    displayResult: bodyMarkdown,
    handoff: {
      topic_id: topic.topicId,
      status: "confirmed",
      platform: settings.platform,
      writing_mode: settings.writingMode,
      final_title: title,
      keyPoints: sourceMap.coreFacts.slice(0, 4),
      importantSourceElementsUsed: sourceMap.sections.slice(0, 4).map((section) => section.sectionId),
      visualPriority: ["단계 설명", "핵심 체크리스트", "프롬프트/예시 카드"],
      next_partner: "멀티R",
    },
  };
};

export const buildVisuals = (topic: TopicWork): VisualPlan[] =>
  [
    ["IMG01", "대표 이미지", "intro", "원자료를 새 콘텐츠로 재설계하는 장면", "좌측 원자료 묶음, 우측 완성 블로그 카드", topic.finalTitle, "1:1", "ai_image"],
    ["IMG02", "단계 설명", "section-2", "MASTER SOURCE → SOURCE MAP → 블로그 구조 흐름", "3단 플로우 차트", "요약이 아니라 재설계", "16:9", "infographic"],
    ["IMG03", "체크리스트", "section-5", "발행 전 확인할 기준", "카드형 체크리스트", "정보 보존 / 구조 변경 / 표현 재작성", "4:5", "card"],
  ].map(([id, role, insertAfter, message, layout, text, ratio, productionType]) => ({
    id,
    role,
    insertAfter,
    message,
    layout,
    text,
    ratio,
    prompt: `${message}. ${layout}. Korean clean editorial blog visual, warm professional tone.`,
    productionType: productionType as VisualPlan["productionType"],
  }));

export const buildNaverPublishKit = (topic: TopicWork, sourceMap: SourceMap): NaverPublishKit => {
  const articleText = topic.writeR.article?.bodyMarkdown || topic.writeR.displayResult || topic.finalTitle;
  const keywords = extractKeywords(`${topic.finalTitle} ${articleText} ${sourceMap.overview.topic}`, 12);
  const mainKeyword = compactKeyword(topic.finalTitle) || keywords[0] || topic.finalTitle;
  const subKeywords = uniqueKeywordList([
    mainKeyword,
    ...keywords.filter((keyword) => keyword.length > 1 && keyword !== "AI").slice(0, 8),
    "네이버 블로그",
    "블로그 글쓰기",
  ]).slice(0, 6);
  const longTailKeywords = uniqueKeywordList([
    `${mainKeyword} 방법`,
    `${mainKeyword} 기준`,
    `${mainKeyword} 체크리스트`,
    `${mainKeyword} 사례`,
  ]).slice(0, 4);

  return {
    mainKeyword,
    subKeywords,
    longTailKeywords,
    titleOptions: [
      topic.finalTitle,
      `${mainKeyword}, 놓치면 아까운 핵심 기준`,
      `${mainKeyword} 고민이라면 먼저 확인할 체크리스트`,
    ],
    openingHook: `${mainKeyword} 때문에 막혔다면, 먼저 기준부터 다시 잡아야 합니다. 이 글에서는 원자료의 핵심을 살려 바로 적용할 수 있는 순서로 정리합니다.`,
    tags: uniqueKeywordList([mainKeyword, ...subKeywords, "네이버블로그", "블로그글쓰기", "콘텐츠전략"]).slice(0, 10),
    publishSettings: {
      category: "게시판 또는 글 성격에 맞는 카테고리",
      topic: "주제 선택 안 함 또는 글 주제와 가장 가까운 항목",
      visibility: "전체공개",
      permissions: ["댓글허용", "공감허용", "검색허용", "블로그/카페 공유 링크 허용", "외부 공유 허용"],
      tagInput: uniqueKeywordList([mainKeyword, ...subKeywords, ...longTailKeywords]).slice(0, 30).map((tag) => `#${tag.replace(/^#/, "")}`).join(" "),
      publishTime: "현재",
      notice: "공지사항으로 등록 안 함",
      keepDefaultSettings: "필요할 때만 체크. 반복 발행 설정을 고정하고 싶을 때 사용",
    },
    publishChecklist: [
      "제목 앞쪽에 핵심 키워드를 자연스럽게 넣기",
      "첫 3문장 안에 독자의 고민과 글의 답 쓰기",
      "태그는 글 내용과 정확히 맞는 키워드만 넣기",
    ],
    caution: "조회수는 보장할 수 없지만, 검색 의도·제목 클릭률·본문 체류 시간을 높이는 방향의 발행 세팅입니다.",
  };
};

export const buildFinalPackage = (topic: TopicWork, sourceMap: SourceMap): FinalPackage => ({
  title: topic.writeR.article?.title || topic.finalTitle,
  articleMarkdown: topic.writeR.article?.bodyMarkdown || topic.writeR.displayResult,
  keywords: topic.writeR.article?.keywords || extractKeywords(topic.finalTitle, 5),
  metaDescription: topic.writeR.article?.metaDescription || `${topic.finalTitle} 최종 발행 패키지`,
  naverPublishKit: buildNaverPublishKit(topic, sourceMap),
  visuals: topic.bijiR.visuals || [],
  snsOutputs: topic.multiR.outputs || {},
  verifyItems: sourceMap.verifyItems,
});

const uniqueKeywordList = (items: string[]) => [...new Set(items.map((item) => item.replace(/\s+/g, " ").trim()).filter(Boolean))];

const compactKeyword = (text: string) =>
  text
    .replace(/[#*"`]/g, "")
    .replace(/[:：].*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 34);

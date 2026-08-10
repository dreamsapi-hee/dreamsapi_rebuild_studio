# DreamSapi Content Rebuilder — DATA_STRUCTURE

## 1. 핵심 설계 원칙

데이터는 `프로젝트 → 공통 원자료 → SOURCE MAP → 주제별 결과` 구조로 저장한다.

MASTER SOURCE는 모든 주제와 파트너가 공유하지만, 로디R 이후 결과는 주제별로 독립 저장한다.

## 2. 권장 최상위 구조

```js
{
  schemaVersion: "1.0",
  projectId: "project-2026-0001",
  projectName: "NotebookLM 레퍼런스 리빌딩",
  createdAt: "2026-08-07T10:00:00Z",
  updatedAt: "2026-08-07T10:30:00Z",
  currentPartner: "writeR",
  currentTopicId: "T02",
  lastSavedAt: "...",

  settings: {},
  masterSources: [],
  sodi: {},
  topicCandidates: [],
  selectedTopicIds: [],
  topics: {},
  versions: []
}
```

## 3. MASTER SOURCE

```js
masterSources: [
  {
    sourceId: "SRC01",
    title: "NotebookLM 강의 스크립트",
    type: "text", // text | pdf | doc | slide | other
    fileName: null,
    content: "원자료 전문...",
    createdAt: "...",
    updatedAt: "...",
    order: 1,
    active: true
  }
]
```

원칙:
- 전문을 그대로 보존
- SOURCE MAP으로 대체하지 않음
- 원자료 삭제 시 확인 필요
- 여러 자료 허용

## 4. 소디 데이터

```js
sodi: {
  status: "confirmed",
  displayResult: "소디 사용자 표시 결과 전체",
  sourceMap: {
    overview: {
      topic: "...",
      purpose: "...",
      audience: "...",
      coreMessage: "..."
    },
    sections: [
      {
        sectionId: "S01",
        sourceId: "SRC01",
        label: "슬라이드 생성 설명",
        summary: "...",
        details: ["..."],
        examples: ["..."],
        tips: ["..."],
        cautions: ["..."],
        reuseValue: "high"
      }
    ],
    coreFacts: [],
    detailFacts: [],
    examples: [],
    prompts: [],
    expressionPatterns: [],
    reuseRules: {
      use: [],
      ideaOnly: [],
      change: []
    },
    verifyItems: []
  },
  handoff: {},
  confirmedAt: "..."
}
```

## 5. 키디R 주제 후보

```js
topicCandidates: [
  {
    id: "T01",
    topic: "...",
    question: "...",
    audience: "...",
    sourceRefs: ["S02", "S04"],
    coreMessage: "...",
    recommendationReason: "...",
    recommended: true,
    selected: true,
    titleCandidates: [
      { id: "T01-01", title: "...", recommended: true }
    ],
    finalTitle: "...",
    createdSet: 1
  }
]
```

`createdSet`은 `다른 관점 5개` 생성 이력을 관리한다.

## 6. 선택 주제 데이터

```js
topics: {
  T01: {
    topicId: "T01",
    topic: "...",
    finalTitle: "...",
    status: "article_done",
    completed: false,
    selectedAt: "...",
    updatedAt: "...",

    kidiR: {},
    rodiR: {},
    writeR: {},
    bijiR: {},
    multiR: {},
    chekiR: {},

    versions: []
  }
}
```

## 7. 파트너 공통 결과 구조

```js
{
  status: "not_started", // not_started | working | saved | confirmed | skipped | outdated
  displayResult: "...",
  handoff: {},
  settings: {},
  createdAt: "...",
  updatedAt: "...",
  confirmedAt: null,
  version: 1
}
```

## 8. 로디R 구조

```js
rodiR: {
  status: "confirmed",
  displayResult: "...",
  handoff: {
    recommendedWritingMode: "problem_solving",
    coreMessage: "...",
    outline: [
      {
        order: 1,
        heading: "...",
        role: "...",
        sourceRefs: ["S02", "S04"],
        mustInclude: ["..."]
      }
    ],
    avoid: []
  }
}
```

## 9. 라이R 구조

```js
writeR: {
  status: "confirmed",
  settings: {
    platform: "naver_blog",
    writingMode: "problem_solving",
    length: "normal",
    tone: "friendly_expert"
  },
  article: {
    title: "...",
    bodyMarkdown: "...",
    keywords: [],
    metaDescription: ""
  },
  displayResult: "...",
  handoff: {
    keyPoints: [],
    importantSourceElementsUsed: [],
    visualPriority: []
  }
}
```

## 10. 비지R 구조

```js
bijiR: {
  status: "confirmed",
  recommendedCount: 6,
  selectedCount: 5,
  visualStyle: "mixed",
  visuals: [
    {
      id: "IMG01",
      role: "thumbnail",
      insertAfter: "intro",
      message: "...",
      layout: "...",
      text: "...",
      ratio: "1:1",
      prompt: "...",
      productionType: "ai_image" // ai_image | infographic | screenshot | card
    }
  ],
  handoff: {}
}
```

## 11. 멀티R 구조

```js
multiR: {
  status: "confirmed",
  selectedPlatforms: ["instagram_carousel", "reels"],
  outputs: {
    instagram_carousel: {
      slides: []
    },
    reels: {
      duration: 60,
      scenes: [],
      narration: "..."
    }
  },
  handoff: {}
}
```

## 12. 체키R 구조

```js
chekiR: {
  status: "confirmed",
  report: {
    sourceUtilization: "pass",
    differentiation: "pass",
    factuality: "warning",
    structure: "pass",
    richness: "pass",
    readability: "pass",
    duplication: "pass",
    audienceFit: "pass",
    visual: "pass",
    sns: "pass",
    notes: []
  },
  finalPackage: {
    title: "...",
    articleMarkdown: "...",
    keywords: [],
    metaDescription: "...",
    visuals: [],
    snsOutputs: {},
    verifyItems: []
  },
  completedAt: "..."
}
```

## 13. 주제 상태값

- `selected`
- `structure_done`
- `writing`
- `article_done`
- `visual_done`
- `multi_done`
- `final_done`
- `archived`

파트너 결과 상태와 주제 전체 상태는 분리한다.

## 14. outdated 규칙

상위 단계가 변경되면 하위 결과를 삭제하지 않는다.

예:
- 키디 제목 변경 → 로디R 이하 `outdated`
- 로디 구조 변경 → 라이R 이하 `outdated`
- 원자료/SOURCE MAP 변경 → 관련 모든 주제 `outdated_possible`

사용자가 기존 결과를 유지할지 재생성할지 선택한다.

## 15. 버전 관리

```js
versions: [
  {
    versionId: "V001",
    scope: "T01.writeR",
    createdAt: "...",
    snapshot: {}
  }
]
```

최종 확정본과 큰 수정 전 상태는 버전으로 보관한다.

## 16. localStorage 권장 키

```text
dreamsapi_rebuilder_projects
dreamsapi_rebuilder_active_project
dreamsapi_rebuilder_ui_settings
```

프로젝트 전체를 하나의 배열로 저장할 수도 있으나 데이터가 커질 경우 `projectId`별 분리 저장을 권장한다.

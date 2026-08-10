import type { RebuilderProject, TopicWork } from "../types";

const SOURCE_POLICY = `COMMON_RULES:
- MASTER SOURCE와 SOURCE MAP의 디테일을 최대한 보존하세요.
- 단순 요약이나 문장 바꿔쓰기가 아니라, 구조와 표현을 새롭게 설계하세요.
- 원자료에 없는 사실은 단정하지 말고 "확인 필요"로 표시하세요.
- 다음 파트너가 바로 이어받을 수 있게 결과를 구조화하세요.`;

export function buildSodiInputPackage(project: RebuilderProject) {
  const sources = project.masterSources.filter((source) => source.active !== false);
  const sourceCount = sources.length;
  return `[SODI_INPUT]
PROJECT: ${project.projectName}
ROLE: 소디 · 원자료 분석가

TASK:
- 아래 원자료 전체를 읽고 SOURCE MAP을 만드세요.
- 요약하지 말고, 세부 내용/사례/팁/단계/조건/주의점/프롬프트를 구조적으로 뽑아주세요.
- 이후 키디R, 로디R, 라이R이 다시 참고할 수 있도록 원자료의 풍부함을 보존하세요.

OUTPUT_FORMAT:
1. 원자료 전체 개요
2. SOURCE MAP
   - 핵심 메시지
   - 세부 정보
   - 사례/예시
   - 단계/조건/팁
   - 주의사항
   - 재활용 가치가 높은 문장/아이디어
3. 키디R에게 넘길 HANDOFF

${SOURCE_POLICY}

MASTER_SOURCE_COUNT: ${sourceCount}

${sources
  .map(
    (source, index) => `--- SOURCE ${index + 1}/${sourceCount}: ${source.sourceId} · ${source.title} ---
TYPE: ${source.type}
FILE: ${source.fileName ?? "pasted-text"}

${source.content}`,
  )
  .join("\n\n")}
[/SODI_INPUT]`;
}

export function buildKidiInputPackage(project: RebuilderProject) {
  return `[KIDI_R_INPUT]
PROJECT: ${project.projectName}
ROLE: 키디R · 콘텐츠 전략가

TASK:
- 아래 SOURCE MAP을 바탕으로 서로 다른 블로그 글감 5개를 제안하세요.
- 반드시 T01부터 T05까지 정확히 5개만 작성하세요.
- 각 글감마다 사용자가 고를 수 있는 제목 후보를 정확히 5개씩 작성하세요.
- 원자료의 디테일, 사례, 조건, 팁을 버리지 말고 서로 다른 관점으로 나누세요.
- 이미 비슷한 글감끼리는 합치지 말고, 독자가 다르게 느낄 만큼 관점을 분리하세요.

OUTPUT_FORMAT:
T01:
topic: 글감명
title_candidates:
1. 제목 후보
2. 제목 후보
3. 제목 후보
4. 제목 후보
5. 제목 후보

T02:
topic: 글감명
title_candidates:
1. 제목 후보
2. 제목 후보
3. 제목 후보
4. 제목 후보
5. 제목 후보

T03:
topic: 글감명
title_candidates:
1. 제목 후보
2. 제목 후보
3. 제목 후보
4. 제목 후보
5. 제목 후보

T04:
topic: 글감명
title_candidates:
1. 제목 후보
2. 제목 후보
3. 제목 후보
4. 제목 후보
5. 제목 후보

T05:
topic: 글감명
title_candidates:
1. 제목 후보
2. 제목 후보
3. 제목 후보
4. 제목 후보
5. 제목 후보

${SOURCE_POLICY}

SOURCE_MAP:
${JSON.stringify(project.sodi.sourceMap, null, 2)}
[/KIDI_R_INPUT]`;
}

export function buildRodiInputPackage(project: RebuilderProject, topic: TopicWork) {
  return `[RODI_R_INPUT]
PROJECT: ${project.projectName}
ROLE: 로디R · 콘텐츠 설계자
TOPIC_ID: ${topic.topicId}
TOPIC: ${topic.finalTitle}

TASK:
- 선택한 글감을 블로그 글로 쓸 수 있게 완전히 새로운 구조로 설계하세요.
- 원자료의 세부 정보는 살리되, 원문 순서를 그대로 따라가지 마세요.
- 독자가 자연스럽게 읽을 수 있도록 문제 제기 → 핵심 설명 → 사례/적용 → 정리 흐름을 만드세요.

OUTPUT_FORMAT:
1. 글의 목적
2. 독자 질문
3. 핵심 메시지
4. 추천 제목
5. 본문 구조
   - H2/H3 목차
   - 각 목차에서 반드시 넣을 원자료 디테일
   - 예시/사례/주의점
6. 라이R에게 넘길 HANDOFF

${SOURCE_POLICY}

SODI_RESULT:
${project.sodi.displayResult}

KIDI_R_RESULT:
${topic.kidiR.displayResult}
[/RODI_R_INPUT]`;
}

export function buildWriteInputPackage(project: RebuilderProject, topic: TopicWork) {
  const naverRequest = project.settings.platform === "naver_blog"
    ? `\nNAVER_PUBLISH_REQUEST:
- 네이버 블로그 검색 유입을 고려해 핵심 키워드, 세부 키워드, 제목 후보, 첫문장 훅, 태그, 발행 체크리스트를 함께 제안하세요.
- 조회수 보장 표현은 피하고, 검색 의도와 체류 시간을 높이는 방향으로 설계하세요.`
    : "";

  return `[WRITE_R_INPUT]
PROJECT: ${project.projectName}
ROLE: 라이R · 전문 에디터
TOPIC_ID: ${topic.topicId}
TOPIC: ${topic.finalTitle}
PLATFORM: ${project.settings.platform}
WRITING_MODE: ${project.settings.writingMode}
LENGTH: ${project.settings.length}
TONE: ${project.settings.tone}

TASK:
- 로디R의 구조를 바탕으로 완성형 블로그 글을 작성하세요.
- 원자료의 정보량과 디테일을 충분히 살리세요.
- 문장은 자연스럽고 쉽게 쓰되, 정보 밀도는 낮추지 마세요.
- 제목, 도입, 본문, 정리까지 바로 발행 가능한 형태로 작성하세요.

OUTPUT_FORMAT:
1. 최종 제목
2. 첫문장 훅
3. 블로그 본문
4. 핵심 키워드
5. 메타 설명
6. 멀티R에게 넘길 HANDOFF
${naverRequest}

${SOURCE_POLICY}

SODI_RESULT:
${project.sodi.displayResult}

RODI_R_STRUCTURE:
${topic.rodiR.displayResult}
[/WRITE_R_INPUT]`;
}

export function buildBijiInputPackage(project: RebuilderProject, topic: TopicWork) {
  return `[BIJI_R_INPUT]
PROJECT: ${project.projectName}
ROLE: 비지R · 비주얼 디렉터
TOPIC_ID: ${topic.topicId}
TOPIC: ${topic.finalTitle}

TASK:
- 아래 블로그 글과 SNS 확장 결과에 필요한 시각자료를 기획하세요.
- 이미지를 몇 장 넣을지 먼저 추천하고, 각 이미지의 목적과 위치를 정하세요.
- 장식용 이미지보다 이해를 돕는 이미지, 표, 체크리스트, 카드뉴스 구성을 우선하세요.

OUTPUT_FORMAT:
1. 추천 이미지 수
2. 이미지별 구성
   - ID
   - 삽입 위치
   - 목적
   - 화면에 들어갈 문구
   - 이미지/인포그래픽 제작 프롬프트
3. 체키R에게 넘길 HANDOFF

${SOURCE_POLICY}

BLOG_ARTICLE:
${topic.writeR.displayResult}

SNS_CONTENT:
${topic.multiR.displayResult || "멀티R을 건너뛰었거나 아직 SNS 결과가 없습니다. 이 경우 블로그 글 기준으로 시각자료를 기획하세요."}
[/BIJI_R_INPUT]`;
}

export function buildMultiInputPackage(project: RebuilderProject, topic: TopicWork, selectedLabels: string) {
  return `[MULTI_R_INPUT]
PROJECT: ${project.projectName}
ROLE: 멀티R · 콘텐츠 확장/마케팅
TOPIC_ID: ${topic.topicId}
TOPIC: ${topic.finalTitle}
PLATFORMS: ${selectedLabels}

TASK:
- 블로그 글을 선택한 SNS 형식에 맞게 확장하세요.
- 플랫폼마다 문체, 길이, CTA, 해시태그를 다르게 설계하세요.
- 블로그 글 전체를 그대로 줄이지 말고, 플랫폼에 맞는 핵심 메시지로 재구성하세요.
- 이후 비지R이 블로그와 SNS에 필요한 시각자료를 함께 기획할 수 있도록 이미지 아이디어가 떠오르는 지점도 간단히 표시하세요.

OUTPUT_FORMAT:
- 플랫폼별로 구분해서 작성
- 각 플랫폼마다 제목/본문/CTA/해시태그 또는 업로드 팁 포함
- 비지R에게 넘길 HANDOFF 포함

${SOURCE_POLICY}

BLOG_ARTICLE:
${topic.writeR.displayResult}
[/MULTI_R_INPUT]`;
}

export function buildChekiInputPackage(project: RebuilderProject, topic: TopicWork) {
  return `[CHEKI_R_INPUT]
PROJECT: ${project.projectName}
ROLE: 체키R · 최종 검수 편집장
TOPIC_ID: ${topic.topicId}
TOPIC: ${topic.finalTitle}

TASK:
- 블로그 글, 시각자료 기획, SNS 콘텐츠를 한 묶음으로 검수하세요.
- 빠진 내용, 어색한 흐름, 중복, 과장 표현, 사실 확인이 필요한 부분을 잡아주세요.
- 최종 결과는 사용자가 발행용으로 복사하기 쉽게 블로그 글과 SNS 글을 구분해 주세요.

OUTPUT_FORMAT:
1. 검수 리포트
2. 수정된 최종 블로그 글
3. 플랫폼별 최종 SNS 글
4. 발행 전 확인사항

${SOURCE_POLICY}

BLOG_ARTICLE:
${topic.writeR.displayResult}

VISUAL_PLAN:
${topic.bijiR.displayResult}

SNS_CONTENT:
${topic.multiR.displayResult}
[/CHEKI_R_INPUT]`;
}

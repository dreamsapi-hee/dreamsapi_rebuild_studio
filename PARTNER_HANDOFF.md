# DreamSapi Content Rebuilder — PARTNER_HANDOFF

## 1. 목적

파트너 간 전달 데이터가 길어져 원자료가 반복 손실되거나, 반대로 모든 결과를 통째로 붙여 프롬프트가 비대해지는 문제를 막기 위한 표준 규격이다.

핵심 원칙:

- MASTER SOURCE는 프로젝트 공통으로 계속 유지한다.
- SOURCE MAP도 프로젝트 공통으로 유지한다.
- HANDOFF는 이전 단계의 '결정사항과 작업 지시'만 전달한다.
- 다음 파트너는 필요 시 MASTER SOURCE와 SOURCE MAP을 다시 참조한다.

## 2. 파트너별 참조 범위

| 파트너 | MASTER SOURCE | SOURCE MAP | 이전 HANDOFF | 현재 완성글 |
|---|---:|---:|---:|---:|
| 소디 | 필수 | 생성 | - | - |
| 키디R | 권장 | 필수 | 소디 | - |
| 로디R | 필수 | 필수 | 키디R | - |
| 라이R | 필수 | 필수 | 키디R+로디R | - |
| 비지R | 보조 | 보조 | 라이R | 필수 |
| 멀티R | 필수 | 필수 | 비지R | 필수 |
| 체키R | 필수 | 필수 | 전체 | 필수 |

## 3. SODI_HANDOFF

```text
[SODI_HANDOFF]
partner: 소디
status: confirmed

source_overview:
- 주제:
- 목적:
- 예상 독자:
- 핵심 메시지:

topic_seeds:
- 콘텐츠 주제로 발전시킬 문제/질문 1
- ...

high_value_sections:
- source_map_ref: S01
  value: ...
- ...

verify_items:
- ...

next_partner: 키디R
[/SODI_HANDOFF]
```

주의:
- 전체 SOURCE MAP을 HANDOFF 안에 복제하지 않는다.
- SOURCE MAP은 별도 프로젝트 데이터로 제공한다.

## 4. KIDI_R_HANDOFF

주제별로 하나씩 생성한다.

```text
[KIDI_R_HANDOFF]
topic_id: T01
status: confirmed

주제:
확정 제목:
주요 독자:
독자의 문제/궁금증:
글의 목적:
핵심 메시지:

source_map_refs:
- S02
- S04

반드시 포함할 정보:
- ...
- ...

next_partner: 로디R
[/KIDI_R_HANDOFF]
```

## 5. RODI_R_HANDOFF

```text
[RODI_R_HANDOFF]
topic_id: T01
status: confirmed

recommended_writing_mode: problem_solving
core_message: ...

outline:
1.
  heading: ...
  role: ...
  source_map_refs: [S02, S04]
  must_include:
  - ...
2.
  heading: ...
  ...

avoid:
- 원자료의 도입 순서 그대로 사용
- ...

next_partner: 라이R
[/RODI_R_HANDOFF]
```

## 6. WRITE_R_HANDOFF

```text
[WRITE_R_HANDOFF]
topic_id: T01
status: confirmed

platform: naver_blog
writing_mode: problem_solving
final_title: ...

key_points:
- ...

important_source_elements_used:
- S02
- S04

visual_priority:
- 단계 설명
- 프롬프트 예시
- 비교 정보

next_partner: 비지R
[/WRITE_R_HANDOFF]
```

완성 글 본문은 HANDOFF 밖의 `article.bodyMarkdown`으로 별도 전달한다.

## 7. BIJI_R_HANDOFF

```text
[BIJI_R_HANDOFF]
topic_id: T01
status: confirmed

visual_count: 5
visual_style: mixed

key_visuals:
- IMG01: 대표 이미지
- IMG02: 단계 설명
- IMG03: 프롬프트 카드

sns_reusable_visuals:
- IMG02
- IMG03

next_partner: 멀티R
[/BIJI_R_HANDOFF]
```

## 8. MULTI_R_HANDOFF

```text
[MULTI_R_HANDOFF]
topic_id: T01
status: confirmed

created_platforms:
- instagram_carousel
- reels

important_source_elements_used:
- S01
- S04

outputs_summary:
- 카드뉴스 7장
- 릴스 55초

next_partner: 체키R
[/MULTI_R_HANDOFF]
```

## 9. 체키R 입력 패키지

체키R에는 단일 HANDOFF보다 종합 패키지를 제공한다.

```text
[CHEKI_INPUT]

PROJECT:
- project_id:
- project_name:

CURRENT_TOPIC:
- topic_id:
- topic:
- final_title:

MASTER_SOURCE:
- 원자료 전체 또는 앱에서 접근 가능한 전체 자료

SOURCE_MAP:
- 소디 상세 분석

KIDI_R_HANDOFF:
...

RODI_R_HANDOFF:
...

FINAL_ARTICLE:
...

VISUAL_RESULT:
...

MULTI_RESULT:
...

[/CHEKI_INPUT]
```

## 10. 체키R 최종 출력 규격

```text
[CHEKI_FINAL]
topic_id: T01
status: final_done

report:
- source_utilization: pass/warning
- differentiation: pass/warning
- factuality: pass/warning
- structure: pass/warning
- richness: pass/warning
- readability: pass/warning

final_package:
- final_title:
- article:
- keywords:
- meta_description:
- visuals:
- sns_outputs:
- verify_items:

[/CHEKI_FINAL]
```

## 11. 앱 파싱 권장

가능하면 GPT 출력에서 HANDOFF 블록을 정규식/구분자로 추출하되, 파싱 실패 시 사용자가 결과를 잃지 않도록 전체 응답을 `displayResult`로 저장한다.

권장:
- `displayResult` 저장은 항상 성공 처리
- HANDOFF 파싱 실패 시 `handoffParseError=true`
- 사용자가 재시도 또는 수동 확정 가능

## 12. 중요한 금지 규칙

- 소디 요약만 가지고 이후 모든 단계를 진행하지 않는다.
- MASTER SOURCE를 HANDOFF로 대체하지 않는다.
- 새 주제로 이동할 때 이전 주제 결과를 덮어쓰지 않는다.
- 원자료 변경 시 하위 결과를 자동 삭제하지 않는다.
- 멀티R이 라이R 결과만 보고 원자료를 무시하지 않게 한다.

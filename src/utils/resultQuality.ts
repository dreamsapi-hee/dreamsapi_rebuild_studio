import type { TopicWork } from "../types";
import { extractKidiIdeas } from "./kidiParser";

export function shouldContinueWithWarnings(title: string, warnings: string[]) {
  if (!warnings.length) return true;
  return window.confirm(`${title}\n\n${warnings.map((warning) => `• ${warning}`).join("\n")}\n\n그래도 저장하고 다음 단계로 이동할까요?`);
}

export function checkSodiResult(text: string) {
  const normalized = text.trim();
  const warnings: string[] = [];
  if (normalized.length < 300) warnings.push("소디 결과가 너무 짧습니다. 원자료의 세부 내용이 충분히 담겼는지 확인해 주세요.");
  if (!/source\s*map|SOURCE MAP|소스\s*맵|자료\s*분석표/i.test(normalized)) warnings.push("SOURCE MAP 또는 자료 분석표가 보이지 않습니다.");
  if (!/사례|예시|팁|주의|조건|단계|프롬프트/.test(normalized)) warnings.push("사례, 팁, 조건, 단계 같은 세부 항목이 부족해 보입니다.");
  return warnings;
}

export function checkKidiResult(text: string) {
  const ideas = extractKidiIdeas(text);
  const warnings: string[] = [];
  if (ideas.length < 5) warnings.push(`T01~T05 글감이 5개로 인식되지 않았습니다. 현재 ${ideas.length}개만 읽혔습니다.`);
  if (ideas.some((idea) => idea.titleCandidates.length < 3)) warnings.push("일부 글감의 제목 후보가 3개 미만입니다. 드롭다운 선택지가 부족할 수 있어요.");
  return warnings;
}

export function checkRodiResult(text: string) {
  const normalized = text.trim();
  const warnings: string[] = [];
  if (normalized.length < 250) warnings.push("글 구성 결과가 너무 짧습니다.");
  if (!/H2|H3|목차|구조|도입|본문|정리|핵심 메시지/.test(normalized)) warnings.push("목차나 글 흐름이 명확하게 보이지 않습니다.");
  return warnings;
}

export function checkWriteResult(text: string) {
  const normalized = text.trim();
  const warnings: string[] = [];
  if (normalized.length < 800) warnings.push("블로그 본문으로 보기에는 글이 너무 짧습니다.");
  if (!/제목|도입|마무리|정리|#/.test(normalized)) warnings.push("제목, 도입, 정리 같은 글 구조가 부족해 보입니다.");
  return warnings;
}

export function checkBijiResult(text: string) {
  const normalized = text.trim();
  const warnings: string[] = [];
  if (normalized.length < 150) warnings.push("이미지 구성안이 너무 짧습니다.");
  if (!/이미지|비주얼|삽입|프롬프트|카드|표|체크리스트/.test(normalized)) warnings.push("이미지 위치나 제작 프롬프트가 부족해 보입니다.");
  return warnings;
}

export function checkMultiResult(text: string) {
  const normalized = text.trim();
  const warnings: string[] = [];
  if (normalized.length < 150) warnings.push("SNS 확장 결과가 너무 짧습니다.");
  if (!/인스타|Threads|쓰레드|릴스|쇼츠|SNS|해시태그|CTA|플랫폼/.test(normalized)) warnings.push("플랫폼별 SNS 내용이 구분되어 보이지 않습니다.");
  return warnings;
}

export function checkChekiResult(topic: TopicWork) {
  const normalized = topic.chekiR.displayResult.trim();
  const warnings: string[] = [];
  if (normalized.length < 300 && !topic.chekiR.finalPackage) warnings.push("최종 검수 결과가 너무 짧습니다.");
  if (!/최종|검수|수정|블로그|발행|확인/.test(normalized) && !topic.chekiR.finalPackage) warnings.push("최종 글이나 검수 리포트가 포함됐는지 확인해 주세요.");
  return warnings;
}

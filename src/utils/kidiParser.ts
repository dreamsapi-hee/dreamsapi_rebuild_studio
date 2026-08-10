export interface ParsedKidiIdea {
  topic: string;
  titleCandidates: string[];
}

export function extractKidiIdeas(text: string): ParsedKidiIdea[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanKidiLine)
    .filter((line) => line.length > 0);

  const ideas: ParsedKidiIdea[] = [];
  let current: ParsedKidiIdea | null = null;
  let readingTitles = false;
  let waitingForTopic = false;

  const ensureCurrent = () => {
    if (!current && ideas.length < 5) {
      current = { topic: "", titleCandidates: [] };
      ideas.push(current);
    }
    return current;
  };

  for (const line of lines) {
    if (isKidiMetaLine(line)) continue;

    const numberedTopic = line.match(/^(?:T\s*0?([1-5])|주제\s*0?([1-5])|글감\s*0?([1-5]))\s*[:：.)-]?\s*(.*)$/i);
    if (numberedTopic) {
      current = { topic: normalizeKidiText(numberedTopic[4] ?? ""), titleCandidates: [] };
      ideas.push(current);
      readingTitles = false;
      waitingForTopic = !current.topic;
      continue;
    }

    const topicField = line.match(/^(?:topic|주제|글감|토픽|블로그\s*주제)\s*[:：]\s*(.+)$/i);
    if (topicField) {
      const target = ensureCurrent();
      if (target) target.topic = normalizeKidiText(topicField[1]);
      readingTitles = false;
      waitingForTopic = false;
      continue;
    }

    if (waitingForTopic && current && !looksLikeFieldLabel(line)) {
      current.topic = normalizeKidiText(line);
      waitingForTopic = false;
      continue;
    }

    if (/^(?:title_candidates|title candidates|제목\s*후보|후보\s*제목|제목|타이틀|title)\s*[:：]?\s*$/i.test(line)) {
      readingTitles = true;
      continue;
    }

    const inlineTitles = line.match(/^(?:title_candidates|title candidates|제목\s*후보|후보\s*제목|제목|타이틀|title)\s*[:：]\s*(.+)$/i);
    if (inlineTitles) {
      const target = ensureCurrent();
      if (target) target.titleCandidates.push(...splitInlineTitles(inlineTitles[1]));
      readingTitles = true;
      continue;
    }

    const recommendedTitle = line.match(/^(?:추천\s*제목|최우선\s*추천|최종\s*추천|추천\s*타이틀|추천\s*안)\s*[:：]\s*(.+)$/i);
    if (recommendedTitle) {
      const target = ensureCurrent();
      if (target) target.titleCandidates.push(normalizeKidiText(recommendedTitle[1]));
      readingTitles = false;
      continue;
    }

    if (readingTitles && current) {
      const titleCandidate =
        line.match(/^\d+\s*[.)]\s*(.+)$/)?.[1] ??
        line.match(/^[-*•]\s*(.+)$/)?.[1] ??
        (looksLikeFieldLabel(line) ? "" : line);

      if (titleCandidate) current.titleCandidates.push(normalizeKidiText(titleCandidate));
    }
  }

  return ideas
    .filter((idea) => idea.topic.length >= 4)
    .slice(0, 5)
    .map((idea) => ({
      topic: idea.topic,
      titleCandidates: uniqueTitles(idea.titleCandidates).slice(0, 5),
    }));
}

export function uniqueTitles(titles: string[]) {
  return [...new Set(titles.map(normalizeKidiText).filter((title) => title.length >= 4))];
}

function cleanKidiLine(text: string) {
  return normalizeKidiText(text)
    .replace(/^[-*•]\s*/, "")
    .trim();
}

function normalizeKidiText(text: string) {
  return text
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^`{1,3}|`{1,3}$/g, "")
    .replace(/^["'“”‘’「」『』]|["'“”‘’「」『』]$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitInlineTitles(text: string) {
  return text
    .split(/\s*(?:\||,|ㆍ|·)\s*/)
    .map(normalizeKidiText)
    .filter(Boolean);
}

function looksLikeFieldLabel(text: string) {
  return /^(?:reader|audience|question|source|reason|main|longtail|keyword|활용|주요|읽을|질문|참고|이유|근거|메시지|키워드)\b/i.test(text);
}

function isKidiMetaLine(text: string) {
  return /^(?:---|키디R?\s*)?(?:콘텐츠\s*)?(?:주제\s*)?제안\s*$|^주요\s*독자|^활용할\s*원자료|^이\s*글이\s*답할\s*질문|^최우선\s*추천\s*$/i.test(text);
}

import type { RebuilderProject } from "../types";

type CopyTopic = NonNullable<RebuilderProject["topics"][string]>;

export function getFinalCopyText(topic: CopyTopic, target: string) {
  if (target === "blog") {
    return topic.chekiR.finalPackage?.articleMarkdown || topic.writeR.article?.bodyMarkdown || topic.writeR.displayResult || topic.chekiR.displayResult || "";
  }

  const structuredOutput = topic.chekiR.finalPackage?.snsOutputs?.[target] ?? topic.multiR.outputs?.[target];
  if (structuredOutput) return formatOutput(structuredOutput);

  return extractPlatformSection(topic.chekiR.displayResult, target)
    || extractPlatformSection(topic.multiR.displayResult, target)
    || "";
}

export function platformLabel(key: string) {
  const labels: Record<string, string> = {
    instagram_carousel: "인스타 카드뉴스",
    instagram_caption: "인스타 캡션",
    reels: "릴스",
    youtube_shorts: "유튜브 쇼츠",
    threads: "Threads",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    newsletter_summary: "뉴스레터 요약",
  };
  return labels[key] ?? humanizeKey(key);
}

function formatOutput(output: unknown) {
  if (typeof output === "string") return output;
  if (!output || typeof output !== "object") return String(output ?? "");
  return Object.entries(output as Record<string, unknown>)
    .map(([key, value]) => `${humanizeKey(key)}\n${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`)
    .join("\n\n");
}

function extractPlatformSection(text: string, target: string) {
  if (!text.trim()) return "";
  const labels = platformSearchLabels(target);
  const escapedLabels = labels.map(escapeRegExp).join("|");
  const startRegex = new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?(?:\\[?\\s*)(${escapedLabels})(?:\\s*\\]?\\s*)[:：.-]?\\s*\\n`, "i");
  const startMatch = text.match(startRegex);
  if (!startMatch || startMatch.index === undefined) return "";

  const start = startMatch.index + startMatch[0].length;
  const rest = text.slice(start);
  const endRegex = /\n\s*(?:#{1,6}\s*)?(?:블로그|네이버\s*블로그|인스타|인스타그램|Instagram|Threads|쓰레드|릴스|쇼츠|유튜브|Facebook|페이스북|LinkedIn|링크드인|뉴스레터)\b[:：.-]?\s*\n/i;
  const endMatch = rest.match(endRegex);
  return (endMatch?.index === undefined ? rest : rest.slice(0, endMatch.index)).trim();
}

function platformSearchLabels(key: string) {
  const labels: Record<string, string[]> = {
    instagram_carousel: ["인스타 카드뉴스", "인스타그램 카드뉴스", "Instagram carousel", "instagram_carousel"],
    instagram_caption: ["인스타 캡션", "인스타그램 캡션", "Instagram caption", "instagram_caption"],
    reels: ["릴스", "Reels", "reels"],
    youtube_shorts: ["유튜브 쇼츠", "쇼츠", "YouTube Shorts", "youtube_shorts"],
    threads: ["Threads", "쓰레드", "threads"],
    facebook: ["Facebook", "페이스북", "facebook"],
    linkedin: ["LinkedIn", "링크드인", "linkedin"],
    newsletter_summary: ["뉴스레터 요약", "뉴스레터", "newsletter_summary"],
  };
  return labels[key] ?? [key, platformLabel(key)];
}

function humanizeKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

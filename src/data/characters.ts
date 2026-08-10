import type { PartnerKey } from "../types";
import { publicAsset } from "../utils/assets";

export type CharacterState = "default" | "analyzing" | "complete";
export type CharacterImageRole = "icon" | CharacterState;

export interface PartnerCharacter {
  partner: PartnerKey;
  name: string;
  role: string;
  initials: string;
  alt: string;
  images: Record<CharacterImageRole, string>;
  messages: Record<CharacterState, string>;
  color: string;
}

export const partnerCharacters: Record<PartnerKey, PartnerCharacter> = {
  sodi: {
    partner: "sodi",
    name: "소디",
    role: "원자료 분석가",
    initials: "소",
    alt: "소디 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/sodi-nav.png"),
      default: publicAsset("assets/characters/transparent/sodi-default.png"),
      analyzing: publicAsset("assets/characters/transparent/sodi-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/sodi-complete.png"),
    },
    messages: {
      default: "자료를 넣어주면 중요한 내용부터 꼼꼼히 정리할게요.",
      analyzing: "자료 속 핵심, 사례, 팁을 찾고 있어요...",
      complete: "자료 분석이 끝났어요.",
    },
    color: "#f59e0b",
  },
  kidiR: {
    partner: "kidiR",
    name: "키디R",
    role: "콘텐츠 전략가",
    initials: "키",
    alt: "키디R 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/kidi-nav.png"),
      default: publicAsset("assets/characters/transparent/kidi-default.png"),
      analyzing: publicAsset("assets/characters/transparent/kidi-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/kidi-complete.png"),
    },
    messages: {
      default: "분석한 자료에서 블로그로 쓸 만한 글감을 찾아볼게요.",
      analyzing: "블로그로 만들기 좋은 글감을 고르고 있어요...",
      complete: "블로그 글감 5개를 준비했어요.",
    },
    color: "#84cc16",
  },
  rodiR: {
    partner: "rodiR",
    name: "로디R",
    role: "콘텐츠 설계자",
    initials: "로",
    alt: "로디R 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/rodi-nav.png"),
      default: publicAsset("assets/characters/transparent/rodi-default.png"),
      analyzing: publicAsset("assets/characters/transparent/rodi-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/rodi-complete.png"),
    },
    messages: {
      default: "선택한 글감을 읽기 쉬운 글 순서로 정리할게요.",
      analyzing: "글의 흐름과 목차를 잡고 있어요...",
      complete: "글 구성이 준비됐어요.",
    },
    color: "#38bdf8",
  },
  writeR: {
    partner: "writeR",
    name: "라이R",
    role: "전문 에디터",
    initials: "라",
    alt: "라이R 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/writi-nav.png"),
      default: publicAsset("assets/characters/transparent/writi-default.png"),
      analyzing: publicAsset("assets/characters/transparent/writi-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/writi-complete.png"),
    },
    messages: {
      default: "정리된 구성을 바탕으로 블로그 글을 써볼게요.",
      analyzing: "자료의 디테일을 살려 글을 쓰고 있어요...",
      complete: "블로그 글이 완성됐어요.",
    },
    color: "#a78bfa",
  },
  bijiR: {
    partner: "bijiR",
    name: "비지R",
    role: "비주얼 디렉터",
    initials: "비",
    alt: "비지R 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/bizi-nav.png"),
      default: publicAsset("assets/characters/transparent/bizi-default.png"),
      analyzing: publicAsset("assets/characters/transparent/bizi-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/bizi-complete.png"),
    },
    messages: {
      default: "글에 어울리는 이미지와 카드 구성을 제안할게요.",
      analyzing: "어디에 어떤 이미지가 좋을지 정리하고 있어요...",
      complete: "비주얼 구성안이 준비됐어요.",
    },
    color: "#fb7185",
  },
  multiR: {
    partner: "multiR",
    name: "멀티R",
    role: "콘텐츠 확장/마케팅",
    initials: "멀",
    alt: "멀티R 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/multi-nav.png"),
      default: publicAsset("assets/characters/transparent/multi-default.png"),
      analyzing: publicAsset("assets/characters/transparent/multi-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/multi-complete.png"),
    },
    messages: {
      default: "완성된 글을 SNS용 콘텐츠로 바꿔볼게요.",
      analyzing: "플랫폼별로 맞는 문구를 만들고 있어요...",
      complete: "SNS용 콘텐츠가 준비됐어요.",
    },
    color: "#22c55e",
  },
  chekiR: {
    partner: "chekiR",
    name: "체키R",
    role: "최종 검수 편집장",
    initials: "체",
    alt: "체키R 캐릭터",
    images: {
      icon: publicAsset("assets/characters/nav-icons/cheki-nav.png"),
      default: publicAsset("assets/characters/transparent/cheki-default.png"),
      analyzing: publicAsset("assets/characters/transparent/cheki-analyzing.png"),
      complete: publicAsset("assets/characters/transparent/cheki-complete.png"),
    },
    messages: {
      default: "발행하기 전에 빠진 내용과 어색한 부분을 확인할게요.",
      analyzing: "최종 글을 꼼꼼히 확인하고 다듬고 있어요...",
      complete: "최종 결과물이 완성됐어요.",
    },
    color: "#f97316",
  },
};

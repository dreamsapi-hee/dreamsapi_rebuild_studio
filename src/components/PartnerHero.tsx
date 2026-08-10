import PartnerAvatar from "./PartnerAvatar";
import { partnerCharacters, type CharacterState } from "../data/characters";
import type { PartnerKey } from "../types";
import type { CSSProperties } from "react";

interface PartnerHeroProps {
  partner: PartnerKey;
  state: CharacterState;
  compact?: boolean;
}

export default function PartnerHero({ partner, state, compact = false }: PartnerHeroProps) {
  const character = partnerCharacters[partner];

  return (
    <div className={`partner-hero ${compact ? "compact" : ""} ${state}`} style={{ "--character-color": character.color } as CSSProperties}>
      <PartnerAvatar partner={partner} size="lg" state={state} />
      <div className="partner-hero-copy">
        <p className="eyebrow">{character.name} · {character.role}</p>
        <p>{character.messages[state]}</p>
      </div>
    </div>
  );
}

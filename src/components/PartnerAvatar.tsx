import { useState } from "react";
import { partnerCharacters } from "../data/characters";
import type { PartnerKey } from "../types";
import type { CharacterImageRole, CharacterState } from "../data/characters";
import type { CSSProperties } from "react";

interface PartnerAvatarProps {
  partner: PartnerKey;
  size?: "sm" | "md" | "lg";
  state?: CharacterState;
  hoverState?: CharacterState;
  imageRole?: CharacterImageRole;
  showName?: boolean;
}

export default function PartnerAvatar({ partner, size = "md", state = "default", hoverState, imageRole, showName = false }: PartnerAvatarProps) {
  const character = partnerCharacters[partner];
  const role = imageRole ?? (size === "sm" ? "icon" : state);
  const imageSrc = character.images[role] || character.images.default;
  const hoverSrc = hoverState ? character.images[hoverState] : null;
  const [imageFailed, setImageFailed] = useState(false);
  const canShowImage = Boolean(imageSrc) && !imageFailed;

  return (
    <span className={`partner-avatar-wrap ${showName ? "with-name" : ""}`}>
      <span className={`partner-avatar ${size} ${hoverSrc ? "has-hover" : ""}`} style={{ "--character-color": character.color } as CSSProperties}>
        {canShowImage ? (
          <>
            <img className="avatar-image-default" src={imageSrc} alt={`${character.alt} ${role}`} onError={() => setImageFailed(true)} />
            {hoverSrc && <img className="avatar-image-hover" src={hoverSrc} alt="" aria-hidden="true" />}
          </>
        ) : (
          <span aria-label={character.alt}>{character.initials}</span>
        )}
      </span>
      {showName && <span className="partner-avatar-name">{character.name}</span>}
    </span>
  );
}

interface BrandMascotProps {
  size?: "sm" | "md" | "lg";
  state?: "default" | "complete";
  withText?: boolean;
  className?: string;
}

const images = {
  default: "/assets/characters/dreamsapi/ds-default.png",
  complete: "/assets/characters/dreamsapi/ds-complete.png",
};

export default function BrandMascot({
  size = "md",
  state = "default",
  withText = false,
  className = "",
}: BrandMascotProps) {
  const classes = ["brand-mascot", size, withText ? "with-text" : "", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <img src={images[state]} alt="드림사피 관리자 캐릭터" />
      {withText && (
        <div>
          <strong>드림사피</strong>
          <span>전체 흐름을 지켜보는 스튜디오 관리자</span>
        </div>
      )}
    </div>
  );
}

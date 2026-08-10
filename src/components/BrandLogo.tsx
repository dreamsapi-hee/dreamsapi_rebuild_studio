interface BrandLogoProps {
  variant?: "korean" | "primary" | "symbol";
  className?: string;
}

const logoImages = {
  korean: "/assets/characters/dreamsapi/ui/dreamsapi-korean-logo-ui.png",
  primary: "/assets/characters/dreamsapi/ui/dreamsapi-primary-logo-ui.png",
  symbol: "/assets/characters/dreamsapi/ui/dreamsapi-symbol-ui.png",
};

const altText = {
  korean: "드림사피 로고",
  primary: "Dreamsapi logo",
  symbol: "드림사피 심볼 로고",
};

export default function BrandLogo({ variant = "korean", className = "" }: BrandLogoProps) {
  return (
    <img
      className={["brand-logo", `brand-logo-${variant}`, className].filter(Boolean).join(" ")}
      src={logoImages[variant]}
      alt={altText[variant]}
    />
  );
}

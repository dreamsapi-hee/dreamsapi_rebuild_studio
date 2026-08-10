import { publicAsset } from "../utils/assets";

interface BrandLogoProps {
  variant?: "korean" | "primary" | "symbol";
  className?: string;
}

const logoImages = {
  korean: publicAsset("assets/characters/dreamsapi/ui/dreamsapi-korean-logo-ui.png"),
  primary: publicAsset("assets/characters/dreamsapi/ui/dreamsapi-primary-logo-ui.png"),
  symbol: publicAsset("assets/characters/dreamsapi/ui/dreamsapi-symbol-ui.png"),
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

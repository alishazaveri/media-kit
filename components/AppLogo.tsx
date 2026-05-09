export function AppLogo({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const textSize: Record<string, string> = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };
  return (
    <span className={`font-bold text-gray-900 ${textSize[size]}`}>Kloot</span>
  );
}

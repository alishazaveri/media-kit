import Image from "next/image";

export function AppLogo({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const heights: Record<string, number> = { sm: 24, md: 32, lg: 40 };
  const h = heights[size];
  return (
    <Image
      src="/assets/images/logo/logo-transparent-slim.png"
      alt="Kloot"
      height={h}
      width={h * 4}
      className="object-contain"
      style={{ height: h, width: "auto" }}
    />
  );
}

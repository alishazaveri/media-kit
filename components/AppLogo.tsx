export function AppLogo({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const dims: Record<string, string> = {
    sm: "w-8 h-8 text-sm rounded-xl",
    md: "w-10 h-10 text-base rounded-xl",
    lg: "w-12 h-12 text-lg rounded-2xl",
  };
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${dims[size]} flex items-center justify-center font-bold text-white shrink-0`}
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        }}
      >
        m
      </div>
      <span className="font-semibold text-gray-900 text-2xl">linkit</span>
    </div>
  );
}

"use client";

export const POST_GRADIENTS = [
  "from-orange-300 to-rose-300",
  "from-purple-300 to-pink-300",
  "from-teal-200 to-cyan-300",
  "from-rose-200 to-orange-200",
  "from-violet-300 to-indigo-300",
  "from-emerald-200 to-teal-300",
  "from-yellow-200 to-amber-300",
  "from-blue-200 to-indigo-300",
];

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-primary" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-900 mb-1.5">
      {children}
    </label>
  );
}

export function Input({
  value,
  onChange,
  onBlur,
  placeholder,
  readOnly,
  className = "",
  type,
}: {
  value: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      type={type}
      className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${readOnly ? "bg-gray-50 text-gray-500 cursor-default" : "bg-white"} ${className}`}
    />
  );
}

export function mediaTypeLabel(t?: string) {
  return t === "REELS"
    ? "Reel"
    : t === "VIDEO"
      ? "Video"
      : t === "CAROUSEL_ALBUM"
        ? "Post"
        : "Post";
}

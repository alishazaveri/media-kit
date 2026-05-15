const STEPS = ["Claim", "Sign up", "Connect", "Pay"];

export function OnboardingNav({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#FAF7F2]">
      <span className="font-bold text-gray-900 text-lg">kloot</span>
      <div className="hidden sm:flex items-center gap-4">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const done = num <= currentStep;
          return (
            <div key={label} className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {done ? (
                  <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {num}
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-xs font-medium shrink-0">
                    {num}
                  </span>
                )}
                <span className={`text-sm font-medium ${done ? "text-gray-800" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

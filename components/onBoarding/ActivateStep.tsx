"use client";

import { OnboardingNav } from "./OnboardingNav";
import { PricingCards } from "@/components/PricingCards";
import { useUser } from "@/contexts/UserContext";

export function ActivateStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { userId } = useUser();

  return (
    <div className="min-h-dvh bg-[#FAF7F2] flex flex-col">
      <OnboardingNav currentStep={4} />

      <div className="flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto w-full flex-1">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1">
          Choose your plan
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8">
          Start free or unlock everything with Pro. Cancel anytime.
        </p>

        <PricingCards
          userId={userId}
          onSuccess={onNext}
          onFreeSelect={onSkip}
        />
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UsernameStep } from "@/components/onBoarding/UsernameStep";
import { SignupStep } from "@/components/onBoarding/SignupStep";
import { ConnectStep } from "@/components/onBoarding/ConnectStep";
import { ActivateStep } from "@/components/onBoarding/ActivateStep";

type Step = "username" | "signup" | "connect" | "activate";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("username");
  const [userId, setUserId] = useState("");
  const [connectError, setConnectError] = useState("");
  const [claimedUsername, setClaimedUsername] = useState("");
  const prefillUsername = searchParams.get("username") ?? undefined;

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setConnectError(
        errorParam === "analytics_failed"
          ? "Something went wrong while fetching your Instagram analytics. Please try connecting again."
          : decodeURIComponent(errorParam),
      );
      setStep("connect");
      return;
    }
    if (searchParams.get("connected") === "true") { setStep("activate"); return; }
    const stepParam = searchParams.get("step");
    if (stepParam === "connect") setStep("connect");
    else if (stepParam === "activate") setStep("activate");
  }, [searchParams]);

  const isActivate = step === "activate";

  return (
    <div
      className={
        isActivate
          ? "min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden overflow-y-auto flex flex-col bg-gray-100 p-4"
          : ""
      }
    >
      {step === "username" && (
        <UsernameStep
          prefill={prefillUsername}
          onNext={(u) => { setClaimedUsername(u); setStep("signup"); }}
        />
      )}
      {step === "signup" && (
        <SignupStep
          claimedUsername={claimedUsername}
          onNext={(id) => { setUserId(id); setStep("connect"); }}
        />
      )}
      {step === "connect" && (
        <ConnectStep userId={userId} externalError={connectError} />
      )}
      {step === "activate" && (
        <ActivateStep onNext={() => router.push("/dashboard")} />
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UsernameStep } from "@/components/onBoarding/UsernameStep";
import { SignupStep } from "@/components/onBoarding/SignupStep";
import { ConnectStep } from "@/components/onBoarding/ConnectStep";
import { ActivateStep } from "@/components/onBoarding/ActivateStep";
import { useUser } from "@/contexts/UserContext";

type Step = "username" | "signup" | "connect" | "activate";

function OnboardingContent() {
  const router = useRouter();
  const { refresh } = useUser();
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

    // Instagram OAuth just completed — move to activate and update the URL
    if (searchParams.get("connected") === "true") {
      setStep("activate");
      router.replace("/app/onboarding?step=activate");
      return;
    }

    const stepParam = searchParams.get("step");
    if (stepParam === "connect") {
      setStep("connect");
    } else if (stepParam === "activate") {
      setStep("activate");
    }
    // signup has no URL param — reloading lands back on username (default state)
  }, [searchParams]);

  return (
    <div>
      {step === "username" && (
        <UsernameStep
          prefill={prefillUsername}
          onNext={(u) => {
            setClaimedUsername(u);
            setStep("signup");
          }}
        />
      )}
      {step === "signup" && (
        <SignupStep
          claimedUsername={claimedUsername}
          onNext={(id) => {
            setUserId(id);
            setStep("connect");
            router.replace("/app/onboarding?step=connect");
          }}
        />
      )}
      {step === "connect" && (
        <ConnectStep userId={userId} externalError={connectError} />
      )}
      {step === "activate" && (
        <ActivateStep onNext={() => { refresh(); router.push("/app/dashboard"); }} />
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

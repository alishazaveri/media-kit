"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UsernameStep } from "@/components/onBoarding/UsernameStep";
import { SignupStep } from "@/components/onBoarding/SignupStep";
import { ConnectStep } from "@/components/onBoarding/ConnectStep";
import { ActivateStep } from "@/components/onBoarding/ActivateStep";
import { useUser } from "@/contexts/UserContext";
import { PageLoader } from "@/components/ui/PageLoader";

type Step = "username" | "signup" | "connect" | "activate";

function resolveStep(searchParams: ReturnType<typeof useSearchParams>): Step {
  if (searchParams.get("error")) return "connect";
  if (searchParams.get("connected") === "true") return "activate";
  const stepParam = searchParams.get("step");
  if (stepParam === "connect") return "connect";
  if (stepParam === "activate") return "activate";
  return "username";
}

function resolveConnectError(searchParams: ReturnType<typeof useSearchParams>): string {
  const errorParam = searchParams.get("error");
  if (!errorParam) return "";
  return errorParam === "analytics_failed"
    ? "Something went wrong while fetching your Instagram analytics. Please try connecting again."
    : decodeURIComponent(errorParam);
}

function OnboardingContent() {
  const router = useRouter();
  const { refresh, isLinkActive, loading } = useUser();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(() => resolveStep(searchParams));
  const [userId, setUserId] = useState("");
  const [connectError, setConnectError] = useState(() => resolveConnectError(searchParams));
  const [claimedUsername, setClaimedUsername] = useState("");
  const prefillUsername = searchParams.get("username") ?? undefined;
  const trialToken = searchParams.get("trial") ?? undefined;

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

    // Instagram OAuth just completed — clean up the URL
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

  useEffect(() => {
    if (step === "activate" && !loading && isLinkActive) {
      router.push("/app/dashboard");
    }
  }, [step, loading, isLinkActive, router]);

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
          trialToken={trialToken}
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
        loading
          ? <PageLoader />
          : !isLinkActive && <ActivateStep onNext={() => { refresh(); router.push("/app/dashboard"); }} onSkip={() => router.push("/app/dashboard")} />
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

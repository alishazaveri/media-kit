"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/reusable/Button";
import { CreatorProfile } from "@/components/CreatorProfile";
import { buildProfilePreviewProps } from "@/lib/buildProfilePreviewProps";
import { PageLoader } from "@/components/ui/PageLoader";

export function PreviewStep({ onNext }: { onNext: () => void }) {
  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [appUsername, setAppUsername] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/analytics")
      .then((res) => {
        if (res.data?.data?.data) setAnalytics(res.data.data.data);
        if (res.data?.draft) setDraft(res.data.draft);
        if (res.data?.username) setAppUsername(res.data.username);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  const previewProps = buildProfilePreviewProps(
    analytics ?? {},
    draft,
    appUsername,
  );

  return (
    <div className="min-h-[100dvh] bg-white">
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white/90 backdrop-blur border-b border-gray-100 z-999">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Whoa — this is your profile
          </p>
          <p className="text-xs text-gray-600">
            Check it out, then continue to activate.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onNext}
          className="rounded-xl shrink-0"
        >
          Continue
        </Button>
      </nav>

      <div className="pt-16">
        <CreatorProfile {...previewProps} />
      </div>
    </div>
  );
}

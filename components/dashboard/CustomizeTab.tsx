"use client";

import { useState, useRef, useEffect } from "react";
import { ProfilePreview } from "@/components/ProfilePreview";
import { CustomizeForm } from "./CustomizeForm";
import { Package, Collaboration, IgStats, IgInsights } from "./types";
import { type ThemeData } from "@/components/CreatorProfile";

interface Props {
  profilePic: string | null;
  setProfilePic: (v: string | null) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  appUsername: string;
  handle: string;
  tagline: string;
  setTagline: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  availableForCollabs: boolean;
  setAvailableForCollabs: (v: boolean) => void;
  nicheTags: string[];
  setNicheTags: (v: string[]) => void;
  igStats: IgStats;
  igInsights: IgInsights;
  igPosts: any[];
  packages: Package[];
  addPackage: () => void;
  removePackage: (id: number) => void;
  updatePackage: (
    id: number,
    field: keyof Package,
    value: string | boolean,
  ) => void;
  prefIndustries: string[];
  setPrefIndustries: (v: string[]) => void;
  restrictedIndustries: string[];
  setRestrictedIndustries: (v: string[]) => void;
  deliverables: string[];
  setDeliverables: (v: string[]) => void;
  turnaround: string;
  collabs: Collaboration[];
  addCollab: () => void;
  removeCollab: (id: number) => void;
  updateCollab: (
    id: number,
    field: keyof Collaboration,
    value: string | boolean,
  ) => void;
  featuredPosts: any[];
  onFeaturedPostsChange: (posts: any[]) => void;
  theme?: ThemeData;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
}

export function CustomizeTab(props: Props) {
  const {
    profilePic,
    setProfilePic,
    displayName,

    setDisplayName,
    appUsername,
    handle,
    tagline,
    setTagline,
    location,
    setLocation,
    availableForCollabs,
    setAvailableForCollabs,
    nicheTags,
    setNicheTags,
    igStats,
    igInsights,
    igPosts,
    packages,
    addPackage,
    removePackage,
    updatePackage,
    prefIndustries,
    setPrefIndustries,
    restrictedIndustries,
    setRestrictedIndustries,
    deliverables,
    setDeliverables,
    turnaround,
    collabs,
    addCollab,
    removeCollab,
    updateCollab,
    featuredPosts,
    onFeaturedPostsChange,
    theme,
    onThemeChange,
  } = props;

  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewPropsRef = useRef<Record<string, any>>({});

  const previewProps = {
    name: displayName,
    handle,
    tagline,
    location,
    profilePic,
    stats: igStats,
    insights: igInsights,
    posts: (featuredPosts?.length ?? 0) > 0 ? featuredPosts : igPosts,
    availableForCollabs,
    nicheTags,
    packages,
    collabs,
    prefIndustries,
    restrictedIndustries,
    deliverables,
    turnaround,
    theme,
  };

  // Keep ref in sync so the PREVIEW_READY handler always sends fresh data
  previewPropsRef.current = previewProps;

  // Respond to PREVIEW_READY — fires after the iframe's React app has hydrated
  // and set up its own message listener, which happens AFTER the iframe onLoad event.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "PREVIEW_READY") {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "PREVIEW_UPDATE", payload: previewPropsRef.current },
          "*",
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Push updates whenever form values change after the preview is already live
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "PREVIEW_UPDATE", payload: previewProps },
      "*",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    displayName,
    handle,
    tagline,
    location,
    profilePic,
    availableForCollabs,
    nicheTags,
    packages,
    collabs,
    turnaround,
    featuredPosts,
    theme,
  ]);

  const formProps = {
    profilePic,
    setProfilePic,
    displayName,
    setDisplayName,
    appUsername,
    tagline,
    setTagline,
    location,
    setLocation,
    availableForCollabs,
    setAvailableForCollabs,
    nicheTags,
    setNicheTags,
    igStats,
    igPosts,
    packages,
    addPackage,
    removePackage,
    updatePackage,
    prefIndustries,
    setPrefIndustries,
    restrictedIndustries,
    setRestrictedIndustries,
    deliverables,
    setDeliverables,
    turnaround,
    collabs,
    addCollab,
    removeCollab,
    updateCollab,
    featuredPosts,
    onFeaturedPostsChange,
    onPreviewClick: () => setShowPreview(true),
    onThemeChange,
  };

  return (
    <>
      {/* Mobile full-screen preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase">
              Live Preview
            </p>
            <button
              onClick={() => setShowPreview(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ProfilePreview {...previewProps} theme={theme} />
          </div>
        </div>
      )}

      <div className="h-full flex justify-center overflow-hidden bg-muted/30]">
        <div className="flex w-full max-w-[1920px] overflow-hidden">
          <CustomizeForm {...formProps} />

          {/* Desktop preview panel */}
          <div className="hidden lg:flex flex-1 flex-col px-6 py-5 overflow-hidden">
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400">
                  kloot.io/{appUsername || "yourhandle"}
                </div>
              </div>
              <iframe
                ref={iframeRef}
                src="/preview"
                className="flex-1 w-full border-none"
                onLoad={() =>
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: "PREVIEW_UPDATE", payload: previewProps },
                    "*",
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

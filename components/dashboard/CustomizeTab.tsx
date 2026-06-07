"use client";

import { useState, useRef, useEffect } from "react";
import { ProfilePreview } from "@/components/ProfilePreview";
import { CustomizeForm } from "./CustomizeForm";
import { Package, Collaboration, IgStats, IgInsights } from "./types";
import { type ThemeData } from "@/components/CreatorProfile";
import Button from "@/components/reusable/Button";

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
  displayEmail: string;
  setDisplayEmail: (v: string) => void;
  servicesVisible: boolean;
  setServicesVisible: (v: boolean) => void;
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
  onProfilePicUploaded?: (url: string) => void;
  publishing?: boolean;
  hasUnpublishedChanges?: boolean;
  onPublish?: () => void;
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
    displayEmail,
    setDisplayEmail,
    servicesVisible,
    setServicesVisible,
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
    publishing = false,
    hasUnpublishedChanges = false,
    onPublish,
  } = props;

  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewPropsRef = useRef<Record<string, any>>({});

  const previewProps = {
    name: displayName,
    handle,
    tagline,
    location,
    email: displayEmail,
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
    servicesVisible,
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
    displayEmail,
    profilePic,
    availableForCollabs,
    nicheTags,
    packages,
    collabs,
    turnaround,
    servicesVisible,
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
    displayEmail,
    setDisplayEmail,
    servicesVisible,
    setServicesVisible,
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
    onProfilePicUploaded: props.onProfilePicUploaded,
    onSectionFocus: (sectionId: string) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "SCROLL_TO_SECTION", sectionId },
        "*",
      );
    },
  };

  return (
    <>
      {/* Mobile bottom drawer preview */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${showPreview ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowPreview(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute inset-x-0 bottom-0 h-[91%] bg-white rounded-t-3xl flex flex-col shadow-2xl transition-transform duration-300 ease-out ${showPreview ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Drag handle */}
          <div className="shrink-0 flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="flex items-center justify-between px-6 pb-3 border-b border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase">
              Live Preview
            </p>

            <div className="flex items-center gap-2">
              {onPublish && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={onPublish}
                  disabled={publishing || !hasUnpublishedChanges}
                  loading={publishing}
                  icon={
                    !publishing && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    )
                  }
                  className="rounded-lg font-bold"
                >
                  {publishing ? "Saving…" : "Publish"}
                </Button>
              )}
              <button
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
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
          </div>

          <div className="flex-1 overflow-y-auto">
            <ProfilePreview {...previewProps} theme={theme} />
          </div>
        </div>
      </div>

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
                <div
                  className={`flex-1  border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 ${hasUnpublishedChanges ? "bg-amber-50" : "bg-white"}`}
                >
                  <span
                    className={`text-xs ${hasUnpublishedChanges ? " text-amber-700" : ""}`}
                  >
                    {hasUnpublishedChanges && "Draft ·"}{" "}
                    <a
                      href={`/${appUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      kloot.io/{appUsername}
                    </a>
                  </span>
                </div>
                {onPublish && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onPublish}
                    disabled={publishing || !hasUnpublishedChanges}
                    loading={publishing}
                    icon={
                      !publishing && (
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                      )
                    }
                    className="shrink-0 font-bold"
                  >
                    {publishing ? "Saving…" : "Publish"}
                  </Button>
                )}
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

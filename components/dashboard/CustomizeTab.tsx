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
  isInstagramConnected?: boolean;
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
  igTopPosts?: any[];
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
    value: string | boolean | number | any[],
  ) => void;
  featuredPosts: any[];
  onFeaturedPostsChange: (posts: any[]) => void;
  receiptsVisible: boolean;
  setReceiptsVisible: (v: boolean) => void;
  theme?: ThemeData;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
  onProfilePicUploaded?: (url: string | null) => void;
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
    isInstagramConnected = true,
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
    igTopPosts,
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
    receiptsVisible,
    setReceiptsVisible,
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
    posts: (featuredPosts?.length ?? 0) > 0 ? featuredPosts : (igTopPosts?.length ?? 0) > 0 ? igTopPosts : igPosts,
    availableForCollabs,
    nicheTags,
    packages,
    collabs,
    prefIndustries,
    restrictedIndustries,
    deliverables,
    turnaround,
    servicesVisible,
    receiptsVisible,
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
    receiptsVisible,
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
    receiptsVisible,
    setReceiptsVisible,
    onPreviewClick: () => setShowPreview(true),
    onPublish,
    publishing,
    hasUnpublishedChanges,
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
            {showPreview && <ProfilePreview {...previewProps} theme={theme} />}
          </div>
        </div>
      </div>

      <div className="h-full flex justify-center overflow-hidden bg-muted/30] relative">
        {!isInstagramConnected && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-white/60 flex flex-col items-center justify-center gap-4 px-6">
            <div className="flex flex-col items-center gap-3 max-w-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Instagram not connected
              </h3>
              <p className="text-sm text-gray-500">
                Connect your Instagram account to start customizing your profile
                and media kit.
              </p>
              <a
                href="/app/account"
                className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
              >
                Connect Instagram
              </a>
            </div>
          </div>
        )}
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

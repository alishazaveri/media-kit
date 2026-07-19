"use client";

import { Package, Collaboration, IgStats } from "./types";
import { type ThemeData } from "@/components/CreatorProfile";
import Button from "@/components/reusable/Button";
import { ProfileSection } from "./customizeForm/ProfileSection";
import { ThemeSection } from "./customizeForm/ThemeSection";
import { FeaturedPostsSection } from "./customizeForm/FeaturedPostsSection";
import { PastCollabsSection } from "./customizeForm/PastCollabsSection";
import { ServicesSection } from "./customizeForm/ServicesSection";

export interface CustomizeFormProps {
  profilePic: string | null;
  setProfilePic: (v: string | null) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  appUsername: string;
  tagline: string;
  setTagline: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  displayEmail: string;
  setDisplayEmail: (v: string) => void;
  pronouns: string;
  setPronouns: (v: string) => void;
  servicesVisible: boolean;
  setServicesVisible: (v: boolean) => void;
  availableForCollabs: boolean;
  setAvailableForCollabs: (v: boolean) => void;
  nicheTags: string[];
  setNicheTags: (v: string[]) => void;
  igStats: IgStats;
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
    value: string | boolean | number | any[],
  ) => void;
  featuredPosts: any[];
  onFeaturedPostsChange: (posts: any[]) => void;
  receiptsVisible: boolean;
  setReceiptsVisible: (v: boolean) => void;
  onPreviewClick: () => void;
  onPublish?: () => void;
  publishing?: boolean;
  hasUnpublishedChanges?: boolean;
  isInactive?: boolean;
  onThemeChange?: (identifier: string, theme: ThemeData) => void;
  onProfilePicUploaded?: (url: string | null) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function CustomizeForm({
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
  pronouns,
  setPronouns,
  servicesVisible,
  setServicesVisible,
  nicheTags,
  setNicheTags,
  igPosts,
  featuredPosts,
  onFeaturedPostsChange,
  packages,
  addPackage,
  removePackage,
  updatePackage,
  collabs,
  addCollab,
  removeCollab,
  updateCollab,
  receiptsVisible,
  setReceiptsVisible,
  onPreviewClick,
  onPublish,
  publishing = false,
  hasUnpublishedChanges = false,
  isInactive = false,
  onThemeChange,
  onProfilePicUploaded,
  onSectionFocus,
}: CustomizeFormProps) {
  return (
    <div className="w-full lg:w-[520px] shrink-0 overflow-y-auto px-4 lg:px-6 lg:mb-5 mb-[68px] mt-5 space-y-4 ">
      {/* Mobile preview + publish buttons */}
      <div className="flex gap-2 lg:hidden">
        <Button
          variant="default"
          size="md"
          onClick={onPreviewClick}
          fullWidth
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle
                cx="8"
                cy="8"
                r="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          }
          className="rounded-xl"
        >
          Preview
        </Button>
        {onPublish && (
          <Button
            variant="primary"
            size="md"
            onClick={onPublish}
            disabled={publishing || (!hasUnpublishedChanges && !isInactive)}
            loading={publishing}
            fullWidth
            icon={
              !publishing && (
                <svg
                  width="14"
                  height="14"
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
            className="rounded-xl font-bold"
          >
            {publishing ? "Saving…" : "Publish"}
          </Button>
        )}
      </div>

      <ProfileSection
        profilePic={profilePic}
        setProfilePic={setProfilePic}
        displayName={displayName}
        setDisplayName={setDisplayName}
        appUsername={appUsername}
        tagline={tagline}
        setTagline={setTagline}
        location={location}
        setLocation={setLocation}
        displayEmail={displayEmail}
        setDisplayEmail={setDisplayEmail}
        pronouns={pronouns}
        setPronouns={setPronouns}
        nicheTags={nicheTags}
        setNicheTags={setNicheTags}
        onProfilePicUploaded={onProfilePicUploaded}
        onSectionFocus={onSectionFocus}
      />

      <ThemeSection
        onThemeChange={onThemeChange}
        onSectionFocus={onSectionFocus}
      />

      <FeaturedPostsSection
        igPosts={igPosts}
        featuredPosts={featuredPosts}
        onFeaturedPostsChange={onFeaturedPostsChange}
        onSectionFocus={onSectionFocus}
      />

      <PastCollabsSection
        receiptsVisible={receiptsVisible}
        setReceiptsVisible={setReceiptsVisible}
        collabs={collabs}
        addCollab={addCollab}
        removeCollab={removeCollab}
        updateCollab={updateCollab}
        onSectionFocus={onSectionFocus}
      />

      <ServicesSection
        servicesVisible={servicesVisible}
        setServicesVisible={setServicesVisible}
        packages={packages}
        addPackage={addPackage}
        removePackage={removePackage}
        updatePackage={updatePackage}
        onSectionFocus={onSectionFocus}
      />
    </div>
  );
}

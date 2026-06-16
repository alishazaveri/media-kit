"use client";

import { Package, Collaboration, IgStats } from "./types";
import { type ThemeData } from "@/components/CreatorProfile";
import Button from "@/components/reusable/Button";
import { ProfileSection } from "./customizeForm/ProfileSection";
import { ThemeSection } from "./customizeForm/ThemeSection";
import { FeaturedPostsSection } from "./customizeForm/FeaturedPostsSection";
import { CampaignSection } from "./customizeForm/CampaignSection";
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
  campaignPosts: any[];
  onCampaignPostsChange: (posts: any[]) => void;
  receiptsVisible: boolean;
  setReceiptsVisible: (v: boolean) => void;
  onPreviewClick: () => void;
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
  servicesVisible,
  setServicesVisible,
  nicheTags,
  setNicheTags,
  igPosts,
  featuredPosts,
  onFeaturedPostsChange,
  campaignPosts,
  onCampaignPostsChange,
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
  onThemeChange,
  onProfilePicUploaded,
  onSectionFocus,
}: CustomizeFormProps) {
  return (
    <div className="w-full lg:w-[520px] shrink-0 overflow-y-auto px-4 lg:px-6 mb-5 mt-5 space-y-4 ">
      {/* Mobile preview button */}
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
        className="lg:hidden rounded-xl"
      >
        Preview my page
      </Button>

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

      <CampaignSection
        campaignPosts={campaignPosts}
        onCampaignPostsChange={onCampaignPostsChange}
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

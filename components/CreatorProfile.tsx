"use client";

import { NavBar } from "./creator-profile/NavBar";
import { HeroSection } from "./creator-profile/HeroSection";
import { StatsSection } from "./creator-profile/StatsSection";
import { AudienceSection } from "./creator-profile/AudienceSection";
import { WorkSection } from "./creator-profile/WorkSection";
import { ReceiptsSection } from "./creator-profile/ReceiptsSection";
import { PartnerSection } from "./creator-profile/PartnerSection";
import { FooterSection } from "./creator-profile/FooterSection";
import type {
  Stats,
  AudienceInsights,
  PostItem,
  Package,
  Collaboration,
} from "./creator-profile/types";

export type { Stats, AudienceInsights, PostItem, Package, Collaboration };

export type ThemeData = {
  accent_color: string;
  base_color: string;
  contrast_color: string;
  dark_mode?: boolean;
};

export interface CreatorProfileProps {
  name?: string;
  handle?: string;
  tagline?: string;
  location?: string;
  profilePic?: string | null;
  stats?: Stats;
  insights?: AudienceInsights;
  posts?: PostItem[];
  availableForCollabs?: boolean;
  nicheTags?: string[];
  packages?: Package[];
  collabs?: Collaboration[];
  prefIndustries?: string[];
  restrictedIndustries?: string[];
  deliverables?: string[];
  turnaround?: string;
  theme?: ThemeData;
  email?: string;
  servicesVisible?: boolean;
  receiptsVisible?: boolean;
}

export function CreatorProfile({
  name = "Sarah Johnson",
  handle = "sarahjcreates",
  tagline = "Lifestyle & Wellness Creator | Inspiring authentic living through mindful content",
  location = "India",
  profilePic,
  stats = {},
  insights = {},
  posts,
  availableForCollabs = true,
  nicheTags = ["Lifestyle", "Wellness", "Beauty", "Travel"],
  packages = [],
  collabs = [
    {
      id: 1,
      brand: "GlowBeauty Co.",
      campaign: "Product Launch — New Skincare Line",
      featured: true,
      contribution: "Created 3 Instagram Reels and 1 YouTube review",
      views: "2.1M",
      engagement: "12.4%",
      reach: "1.8M",
      conversions: "15K+",
    },
    {
      id: 2,
      brand: "FitLife Nutrition",
      campaign: "Brand Awareness Campaign",
      featured: false,
      contribution: "Developed 5-part wellness series",
      views: "1.5M",
      engagement: "9.8%",
      reach: "1.2M",
    },
    {
      id: 3,
      brand: "TravelEase Luggage",
      campaign: "Holiday Sales Campaign",
      featured: false,
      contribution: "Travel vlogs featuring luggage across 3 destinations",
      views: "980K",
      engagement: "11.2%",
      conversions: "8K+",
    },
    {
      id: 4,
      brand: "EcoHome Essentials",
      campaign: "Sustainable Living Awareness",
      featured: true,
      contribution: "Home transformation series",
      views: "720K",
      engagement: "10.5%",
      reach: "650K",
    },
  ],
  prefIndustries = [
    "Beauty & Cosmetics",
    "Health & Wellness",
    "Fashion",
    "Travel",
    "Home & Lifestyle",
    "Food & Beverage",
  ],
  restrictedIndustries = ["Alcohol", "Tobacco", "Gambling", "Political"],
  deliverables = [
    "Instagram Reels",
    "Instagram Posts",
    "Instagram Stories",
    "YouTube Videos",
    "UGC Content",
    "Product Photography",
  ],
  // turnaround = "7-10 days",z
  theme,
  email = "",
  servicesVisible = true,
  receiptsVisible = true,
}: CreatorProfileProps) {
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const initials = nameParts
    .map((p) => p[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
  const initial = firstName[0]?.toUpperCase() ?? "?";

  const sortedCollabs = [...collabs].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
  );
  const visiblePackages = packages.slice(0, 4);

  const darkMode = theme?.dark_mode ?? false;
  const rawBaseColor = theme?.base_color ?? "#fff4ef";
  const accentColor = theme?.accent_color ?? "#ff7350";
  const rawContrastColor = theme?.contrast_color ?? "#1B1210";

  const baseColor = darkMode ? rawContrastColor : rawBaseColor;
  const contrastColor = darkMode ? rawBaseColor : rawContrastColor;

  return (
    <div className="font-sans min-h-screen bg-white">
      <NavBar
        initials={initials}
        name={name}
        email={email}
        baseColor={baseColor}
        accentColor={accentColor}
        contrastColor={contrastColor}
        darkMode={darkMode}
      />
      <HeroSection
        firstName={firstName}
        lastName={lastName}
        initial={initial}
        name={name}
        handle={handle}
        tagline={tagline}
        location={location}
        profilePic={profilePic}
        availableForCollabs={availableForCollabs}
        nicheTags={nicheTags}
        email={email}
        baseColor={baseColor}
        accentColor={accentColor}
        contrastColor={contrastColor}
        darkMode={darkMode}
      />
      <StatsSection
        stats={stats}
        baseColor={baseColor}
        accentColor={accentColor}
        contrastColor={contrastColor}
        darkMode={darkMode}
      />
      <AudienceSection
        insights={insights}
        baseColor={baseColor}
        accentColor={accentColor}
        contrastColor={contrastColor}
        darkMode={darkMode}
      />
      <WorkSection
        posts={posts}
        handle={handle}
        baseColor={baseColor}
        accentColor={accentColor}
        contrastColor={contrastColor}
      />
      {receiptsVisible && (
        <ReceiptsSection
          collabs={collabs}
          accentColor={accentColor}
          baseColor={baseColor}
          darkMode={darkMode}
        />
      )}
      <PartnerSection
        sortedCollabs={sortedCollabs}
        visiblePackages={servicesVisible ? visiblePackages : []}
        // turnaround={turnaround}
        nicheTags={nicheTags}
        tagline={tagline}
        name={name}
        email={email}
        baseColor={baseColor}
        accentColor={accentColor}
        contrastColor={contrastColor}
        darkMode={darkMode}
      />
      <FooterSection
        handle={handle}
        name={name}
        email={email}
        accentColor={accentColor}
        contrastColor={contrastColor}
      />
    </div>
  );
}

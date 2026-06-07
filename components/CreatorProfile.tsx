"use client";

import { NavBar } from "./creator-profile/NavBar";
import { HeroSection } from "./creator-profile/HeroSection";
import { StatsSection } from "./creator-profile/StatsSection";
import { AudienceSection } from "./creator-profile/AudienceSection";
import { WorkSection } from "./creator-profile/WorkSection";
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
  packages = [
    {
      id: 1,
      title: "Instagram Reel",
      description: "Single Instagram Reel with full rights",
      price: "₹2,500",
      popular: false,
    },
    {
      id: 2,
      title: "Instagram Story",
      description: "Story series (3–5 frames)",
      price: "₹800",
      popular: false,
    },
    // {
    //   id: 3,
    //   title: "YouTube Video",
    //   description: "Dedicated or integrated video",
    //   price: "$5,000",
    //   popular: true,
    // },
    {
      id: 4,
      title: "Campaign Bundle",
      description: "Multi-platform package",
      price: "Request Price",
      popular: false,
    },
  ],
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

  const primaryColor = theme?.base_color ?? "#fff4ef";
  const accentColor = theme?.accent_color ?? "#ff7350";
  const secondaryColor = theme?.contrast_color ?? "#1B1210";

  return (
    <div className="font-sans min-h-screen bg-white">
      <NavBar
        initials={initials}
        name={name}
        email={email}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
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
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />
      <StatsSection
        stats={stats}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />
      {/* Uncomment later */}
      {/* <AudienceSection
        insights={insights}
        nicheTags={nicheTags}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      /> */}
      <WorkSection
        posts={posts}
        handle={handle}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />
      <PartnerSection
        sortedCollabs={sortedCollabs}
        visiblePackages={servicesVisible ? visiblePackages : []}
        // turnaround={turnaround}
        nicheTags={nicheTags}
        tagline={tagline}
        name={name}
        email={email}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />
      <FooterSection
        handle={handle}
        name={name}
        email={email}
        primaryColor={primaryColor}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />
    </div>
  );
}

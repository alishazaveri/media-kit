export function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export interface Package {
  id: number;
  title: string;
  description: string;
  price: string;
  popular: boolean;
}

export interface Collaboration {
  id: number;
  brand: string;
  campaign: string;
  featured: boolean;
  contribution?: string;
  views?: string;
  engagement?: string;
  reach?: string;
  conversions?: string;
}

export interface Stats {
  followers?: number | null;
  avgViews?: number | null;
  engagement?: number | null;
  avgReach?: number | null;
  growth?: number | null;
}

export interface AudienceInsights {
  gender_age?: { label: string; value: number }[];
  top_countries?: { country: string; count: number }[];
  top_cities?: { city: string; count: number }[];
}

export interface PostItem {
  id: string;
  caption?: string;
  media_type?: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string | null;
  media_url?: string | null;
}

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
}

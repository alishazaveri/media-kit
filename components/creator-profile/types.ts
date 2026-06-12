export function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
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
  permalink?: string | null;
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
  industry?: string;
  goal?: string;
  built?: string;
  metric1_value?: string;
  metric1_label?: string;
  metric2_value?: string;
  metric2_label?: string;
  metric3_value?: string;
  metric3_label?: string;
  metric4_value?: string;
  metric4_label?: string;
  postIds?: string[];
  collabPosts?: any[];
  reels_count?: number;
  posts_count?: number;
  stories_count?: number;
}

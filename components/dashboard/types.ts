export type Tab = "customize" | "plan" | "account";

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
  // ReceiptsSection fields
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

export interface IgStats {
  followers: number | null;
  avgViews: number | null;
  engagement: number | null;
  avgReach: number | null;
  growth: number | null;
}

export interface IgInsights {
  gender_age: any[];
  top_countries: any[];
  top_cities: any[];
}

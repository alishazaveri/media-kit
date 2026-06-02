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

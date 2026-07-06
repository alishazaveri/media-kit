import { CreatorProfile } from "@/components/CreatorProfile";

// ─── Media assets ────────────────────────────────────────────────────────────
// Drop files into /public/assets/sample/daenerys/ then update paths here.
// For a new preview page, copy this block, point BASE to its own subfolder.
const BASE = "/assets/preview/daenerys";

const media = {
  profilePic: `${BASE}/profile.jpg`,
  posts: [
    { id: "p1", thumbnail_url: `${BASE}/post-1.jpg`, media_type: "REELS",  impressions: 3200000, like_count: 187000, caption: "Dressed for the Iron Throne" },
    { id: "p2", thumbnail_url: `${BASE}/post-2.jpg`, media_type: "REELS",  impressions: 2800000, like_count: 154000, caption: "Dracarys. That's it." },
    { id: "p3", thumbnail_url: `${BASE}/post-3.jpg`, media_type: "IMAGE",  impressions: 1900000, like_count:  98000, caption: "Dragonstone golden hour" },
    { id: "p4", thumbnail_url: `${BASE}/post-4.jpg`, media_type: "REELS",  impressions: 1600000, like_count:  82000, caption: "When you own three dragons" },
  ],
  collabPosts: {
    zara: [
      { id: "z1", thumbnail_url: `${BASE}/collab-zara-1.jpg`,   media_product_type: "REELS", impressions: 1400000, reach:  980000, total_interactions: 68000 },
      { id: "z2", thumbnail_url: `${BASE}/collab-zara-2.jpg`,   media_product_type: "REELS", impressions:  980000, reach:  720000, total_interactions: 51000 },
    ],
    airbnb: [
      { id: "a1", thumbnail_url: `${BASE}/collab-airbnb-1.jpg`, media_product_type: "REELS", impressions:  820000, reach:  610000, total_interactions: 44000 },
    ],
    dyson: [
      { id: "d1", thumbnail_url: `${BASE}/collab-dyson-1.jpg`,  media_product_type: "REELS", impressions:  640000, reach:  480000, total_interactions: 38000 },
    ],
    levis: [
      { id: "l1", thumbnail_url: `${BASE}/collab-levis-1.jpg`,  media_product_type: "REELS", impressions:  520000, reach:  390000, total_interactions: 31000 },
      { id: "l2", thumbnail_url: `${BASE}/collab-levis-2.jpg`,  media_product_type: "REELS", impressions:  320000, reach:  245000, total_interactions: 19000 },
    ],
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const reach_daily_30d: Record<string, number> = {
  "2026-06-05": 1020000,
  "2026-06-06": 1180000,
  "2026-06-07": 1420000,
  "2026-06-08": 980000,
  "2026-06-09": 1110000,
  "2026-06-10": 1340000,
  "2026-06-11": 1560000,
  "2026-06-12": 1290000,
  "2026-06-13": 1050000,
  "2026-06-14": 1200000,
  "2026-06-15": 1480000,
  "2026-06-16": 1710000,
  "2026-06-17": 1630000,
  "2026-06-18": 1140000,
  "2026-06-19": 1270000,
  "2026-06-20": 1390000,
  "2026-06-21": 1820000,
  "2026-06-22": 1650000,
  "2026-06-23": 1320000,
  "2026-06-24": 1080000,
  "2026-06-25": 1210000,
  "2026-06-26": 1500000,
  "2026-06-27": 1740000,
  "2026-06-28": 1410000,
  "2026-06-29": 1260000,
  "2026-06-30": 1590000,
  "2026-07-01": 1930000,
  "2026-07-02": 1780000,
  "2026-07-03": 1610000,
  "2026-07-04": 1450000,
};

export default function SamplePage() {
  return (
    <CreatorProfile
      name="Daenerys Targaryen"
      handle="daenerys.targaryen"
      tagline="Mother of Dragons · travel, fashion & empowerment content from across the seven kingdoms"
      location="Dragonstone, Westeros"
      profilePic={media.profilePic}
      availableForCollabs={true}
      nicheTags={["Travel", "Fashion", "Empowerment", "Lifestyle", "Fantasy"]}
      email="khaleesi@dragonstone.com"
      servicesVisible={true}
      receiptsVisible={true}
      stats={{
        followers: 2400000,
        avgViews: 1300000,
        engagement: 6.8,
        avgReach: 1750000,
        growth: 32000,
        reach_daily_30d,
      }}
      insights={{
        gender_breakdown: [
          { label: "F", value: 62 },
          { label: "M", value: 38 },
        ],
        age_breakdown: [
          { label: "18-24", value: 34 },
          { label: "25-34", value: 41 },
          { label: "35-44", value: 16 },
          { label: "45+", value: 9 },
        ],
        top_countries: [
          { country: "IN", count: 1080000 },
          { country: "US", count: 480000 },
          { country: "GB", count: 240000 },
          { country: "AE", count: 192000 },
          { country: "AU", count: 144000 },
        ],
        top_cities: [
          { city: "Mumbai", count: 312000 },
          { city: "New Delhi", count: 228000 },
          { city: "London", count: 168000 },
          { city: "New York", count: 144000 },
          { city: "Dubai", count: 120000 },
        ],
      }}
      packages={[
        {
          id: 1,
          title: "Instagram Carousel",
          description: "1 branded carousel post (5–10 slides), 2 revision rounds, caption & hashtags included",
          price: "₹75,000",
          popular: false,
        },
        {
          id: 2,
          title: "Instagram Reel",
          description: "1 branded Reel (30–60 sec), 2 revision rounds, caption & hashtags included",
          price: "₹1,50,000",
          popular: false,
        },
        {
          id: 3,
          title: "Reel + Stories",
          description: "1 Reel + 3 Story slides, behind-the-scenes content, swipe-up link",
          price: "₹2,00,000",
          popular: true,
        },
        {
          id: 4,
          title: "Full Campaign",
          description: "3 Reels + Stories + 1 Carousel, dedicated performance report",
          price: "Request pricing",
          popular: false,
        },
      ]}
      collabs={[
        {
          id: 1,
          brand: "Zara",
          campaign: "Winter Armour Collection",
          featured: true,
          contribution: "3 outfit Reels styled across King's Landing rooftops",
          views: "2.4M",
          engagement: "5.1%",
          reach: "1.9M",
          conversions: "18K+",
          reels_count: 2,
          collabPosts: media.collabPosts.zara,
        },
        {
          id: 2,
          brand: "Airbnb",
          campaign: "Stay Extraordinary Campaign",
          featured: false,
          contribution: "Dragonstone castle stay vlog series across 4 Reels",
          views: "1.8M",
          engagement: "4.6%",
          reach: "1.4M",
          reels_count: 1,
          collabPosts: media.collabPosts.airbnb,
        },
        {
          id: 3,
          brand: "Dyson",
          campaign: "Haircare Launch",
          featured: false,
          contribution: "GRWM Reel — the silver hair routine revealed",
          views: "1.1M",
          engagement: "4.9%",
          conversions: "9K+",
          reels_count: 1,
          collabPosts: media.collabPosts.dyson,
        },
        {
          id: 4,
          brand: "Levi's",
          campaign: "Break The Chains Campaign",
          featured: true,
          contribution: "Empowerment Reel series, 4 Story swipe-ups",
          views: "840K",
          engagement: "5.3%",
          reach: "720K",
          reels_count: 2,
          collabPosts: media.collabPosts.levis,
        },
      ]}
      posts={media.posts}
      prefIndustries={["Fashion", "Travel", "Beauty & Cosmetics", "Home & Lifestyle", "Health & Wellness"]}
      restrictedIndustries={["Alcohol", "Tobacco", "Gambling", "Political"]}
      deliverables={["Instagram Reels", "Instagram Stories", "Instagram Posts", "UGC Content", "Product Photography"]}
    />
  );
}

import type { Package } from "@/components/dashboard/types";

function price(
  followers: number,
  nano: string,
  micro: string,
  mid: string,
  macro: string,
): string {
  if (followers >= 1_000_000) return "Request Price";
  if (followers >= 200_000) return macro;
  if (followers >= 50_000) return mid;
  if (followers >= 10_000) return micro;
  return nano;
}

export function getDefaultPackages(followers: number): Package[] {
  return [
    {
      id: 1,
      title: "Instagram Reel",
      description: "Single Instagram Reel",
      price: price(followers, "₹2,500", "₹8,000", "₹25,000", "₹75,000"),
      popular: false,
    },
    {
      id: 2,
      title: "Instagram Story",
      description: "Story series (3–5 frames)",
      price: price(followers, "₹800", "₹2,500", "₹8,000", "₹20,000"),
      popular: false,
    },
    {
      id: 3,
      title: "Instagram Carousel",
      description: "Multi-image carousel post",
      price: price(followers, "₹1,500", "₹5,000", "₹18,000", "₹55,000"),
      popular: false,
    },
    {
      id: 4,
      title: "Campaign Bundle",
      description: "Multi-platform package",
      price: "Request Price",
      popular: false,
    },
  ];
}

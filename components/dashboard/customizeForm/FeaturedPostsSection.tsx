"use client";

import { useState } from "react";
import Button from "@/components/reusable/Button";
import { POST_GRADIENTS, mediaTypeLabel } from "./shared";
import { PostPickerModal } from "./PostPickerModal";

interface FeaturedPostsSectionProps {
  igPosts: any[];
  featuredPosts: any[];
  onFeaturedPostsChange: (posts: any[]) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function FeaturedPostsSection({
  igPosts,
  featuredPosts,
  onFeaturedPostsChange,
  onSectionFocus,
}: FeaturedPostsSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userFeaturedIds, setUserFeaturedIds] = useState<string[] | null>(null);

  const featuredIds: string[] =
    userFeaturedIds ??
    ((featuredPosts?.length ?? 0) > 0
      ? featuredPosts.map((p: { id: string }) => p.id)
      : (igPosts?.length ?? 0) > 0
        ? igPosts.slice(0, 4).map((p: { id: string }) => p.id)
        : []);

  const gridIcon = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-5"
      onFocus={() => onSectionFocus?.("work")}
    >
      <p className="font-semibold text-gray-900 mb-1">Featured Instagram content</p>
      <p className="text-xs text-gray-400 mb-3">Up to 4 posts or reels shown on your page.</p>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {Array.from({ length: 4 }, (_, i) => {
          const post = featuredPosts[i] ?? null;
          const thumb = post
            ? (post.thumbnail_url ??
              (post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"
                ? post.media_url
                : null))
            : null;
          return post ? (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden aspect-square ring-2 ring-primary ring-offset-1"
            >
              {thumb ? (
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${POST_GRADIENTS[i % POST_GRADIENTS.length]}`}
                />
              )}
              <span className="absolute top-1.5 right-1.5 bg-gray-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                {mediaTypeLabel(post.media_type)}
              </span>
              <span className="absolute bottom-1 left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {i + 1}
              </span>
            </div>
          ) : (
            <div
              key={i}
              className="rounded-2xl aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center"
            >
              <span className="text-gray-300 text-sm font-medium">{i + 1}</span>
            </div>
          );
        })}
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={() => setPickerOpen(true)}
        fullWidth
        className="rounded-xl"
        icon={gridIcon}
      >
        {featuredIds.length > 0 ? "Change selection" : "Choose posts"}
      </Button>

      <PostPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Choose posts"
        maxSelect={4}
        initialSelectedIds={featuredIds}
        existingPosts={featuredPosts}
        onDone={(posts) => {
          const ids = posts.map((p: any) => p.id);
          setUserFeaturedIds(ids);
          onFeaturedPostsChange(posts);
          fetch("/api/analytics/draft", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ posts }),
          }).catch(() => {});
        }}
      />
    </section>
  );
}

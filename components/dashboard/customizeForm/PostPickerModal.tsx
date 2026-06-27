"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/reusable/Button";
import { POST_GRADIENTS, mediaTypeLabel } from "./shared";

interface PostPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxSelect: number;
  initialSelectedIds: string[];
  existingPosts: any[];
  onDone: (selectedPosts: any[]) => void;
}

export function PostPickerModal({
  isOpen,
  onClose,
  title,
  maxSelect,
  initialSelectedIds,
  existingPosts,
  onDone,
}: PostPickerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [modalPosts, setModalPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function fetchPosts(cursor?: string) {
    const isFirst = !cursor;
    if (isFirst) {
      setLoading(true);
      setModalPosts([]);
      setNextCursor(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const url = `/api/instagram/posts?limit=20${cursor ? `&after=${encodeURIComponent(cursor)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      const newPosts: any[] = data.posts ?? [];
      setModalPosts((prev) => (isFirst ? newPosts : [...prev, ...newPosts]));
      setNextCursor(data.nextCursor ?? null);
    } catch {
      // silent
    } finally {
      if (isFirst) setLoading(false);
      else setLoadingMore(false);
    }
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || loadingMore || !nextCursor) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      fetchPosts(nextCursor);
    }
  }

  function togglePost(post: any) {
    setSelectedIds((prev) => {
      if (prev.includes(post.id)) return prev.filter((id) => id !== post.id);
      if (prev.length >= maxSelect) return prev;
      return [...prev, post.id];
    });
  }

  function handleDone() {
    const resolved = selectedIds
      .map(
        (id) =>
          modalPosts.find((p) => p.id === id) ??
          existingPosts.find((p) => p.id === id),
      )
      .filter(Boolean);
    onDone(resolved);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedIds.length} of {maxSelect} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {selectedIds.length >= maxSelect && (
          <div className="mx-5 mt-4 shrink-0 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-center text-primary font-medium">
            {maxSelect} posts selected - deselect one to swap
          </div>
        )}

        {/* Grid */}
        <div
          ref={scrollRef}
          className="overflow-y-auto flex-1 p-4"
          onScroll={handleScroll}
        >
          <div className="grid grid-cols-2 min-[425px]:grid-cols-3 gap-2">
            {loading
              ? Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl aspect-square bg-gray-100 animate-pulse"
                  />
                ))
              : modalPosts.map((post, i) => {
                  const thumb =
                    post.thumbnail_url ??
                    (post.media_type === "IMAGE" ||
                    post.media_type === "CAROUSEL_ALBUM"
                      ? post.media_url
                      : null);
                  const selected = selectedIds.includes(post.id);
                  const dimmed = selectedIds.length >= maxSelect && !selected;
                  const views = post.impressions ?? post.view_count ?? null;
                  const viewLabel =
                    views == null
                      ? null
                      : views >= 1_000_000
                        ? `${(views / 1_000_000).toFixed(1)}M`
                        : views >= 1_000
                          ? `${(views / 1_000).toFixed(1)}K`
                          : String(views);
                  return (
                    <button
                      key={post.id}
                      onClick={() => togglePost(post)}
                      className={`relative rounded-2xl overflow-hidden aspect-square transition-all
                        ${selected ? "ring-[3px] ring-primary ring-offset-2 scale-[0.97]" : ""}
                        ${dimmed ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${POST_GRADIENTS[i % POST_GRADIENTS.length]}`}
                        />
                      )}
                      {selected && (
                        <div className="absolute inset-0 bg-primary/20" />
                      )}
                      <span className="absolute top-1.5 right-1.5 bg-gray-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                        {mediaTypeLabel(post.media_type)}
                      </span>
                      {viewLabel && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-md">
                          {viewLabel}
                        </span>
                      )}
                      {selected && (
                        <span className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M2 5l2.5 2.5L8 3"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
          </div>
          {!loading && modalPosts.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              No posts found
            </p>
          )}
          {loadingMore && (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <Button
            variant="primary"
            size="md"
            fullWidth
            className="rounded-2xl"
            onClick={handleDone}
          >
            Done ( {selectedIds.length} selected )
          </Button>
        </div>
      </div>
    </div>
  );
}

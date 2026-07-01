"use client";

import { useState, useEffect } from "react";
import { Collaboration } from "../types";
import Button from "@/components/reusable/Button";
import { Toggle, Label, Input, POST_GRADIENTS } from "./shared";
import { PostPickerModal } from "./PostPickerModal";

interface PastCollabsSectionProps {
  receiptsVisible: boolean;
  setReceiptsVisible: (v: boolean) => void;
  collabs: Collaboration[];
  addCollab: () => void;
  removeCollab: (id: number) => void;
  updateCollab: (
    id: number,
    field: keyof Collaboration,
    value: string | boolean | number | any[],
  ) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function PastCollabsSection({
  receiptsVisible,
  setReceiptsVisible,
  collabs,
  addCollab,
  removeCollab,
  updateCollab,
  onSectionFocus,
}: PastCollabsSectionProps) {
  const [expandedCollabId, setExpandedCollabId] = useState<number | null>(null);
  const [pendingDeleteCollab, setPendingDeleteCollab] = useState<number | null>(
    null,
  );
  const [collabPickerOpen, setCollabPickerOpen] = useState<number | null>(null);

  useEffect(() => {
    if (expandedCollabId !== null) {
      onSectionFocus?.(`receipts-card-${expandedCollabId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedCollabId]);

  const activeCollab = collabs.find((c) => c.id === collabPickerOpen);
  const activeCollabPosts: any[] = activeCollab?.collabPosts ?? [];

  const pickerGridIcon = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="1"
        y="1"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="8"
        y="1"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="1"
        y="8"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="8"
        y="8"
        width="5"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-gray-900">Past collabs</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Showcase verified campaign results on your page.
          </p>
        </div>
        <Toggle checked={receiptsVisible} onChange={setReceiptsVisible} />
      </div>

      <div className="space-y-2">
        {collabs.map((c) => {
          const isExpanded = expandedCollabId === c.id;
          const isPendingDelete = pendingDeleteCollab === c.id;
          const selectedPosts: any[] = c.collabPosts ?? [];
          const selectedThumbs = selectedPosts.map(
            (p) =>
              p.thumbnail_url ??
              (p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
                ? p.media_url
                : null),
          );

          if (isPendingDelete) {
            return (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5"
              >
                <span className="flex-1 text-sm text-red-700 truncate">
                  Remove &ldquo;{c.brand || "this collab"}&rdquo;?
                </span>
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => {
                    removeCollab(c.id);
                    setPendingDeleteCollab(null);
                    if (expandedCollabId === c.id) setExpandedCollabId(null);
                  }}
                  className="shrink-0 rounded-lg"
                >
                  Remove
                </Button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteCollab(null)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1 1l8 8M9 1L1 9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            );
          }

          return (
            <div
              key={c.id}
              className="rounded-xl border border-gray-100 overflow-hidden"
            >
              {/* Collapsed header row */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {c.brand?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {c.brand || "New collab"}
                  </p>
                  {c.industry && (
                    <p className="text-xs text-gray-400 truncate">
                      {c.industry}
                    </p>
                  )}
                </div>

                {/* Top Performer badge toggle */}
                <button
                  type="button"
                  title={
                    c.featured
                      ? "Remove Top Performer badge"
                      : "Mark as Top Performer"
                  }
                  onClick={() => updateCollab(c.id, "featured", !c.featured)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                    c.featured
                      ? "bg-amber-50 text-amber-500"
                      : "text-gray-300 hover:text-amber-400"
                  }`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill={c.featured ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={c.featured ? "0" : "1.8"}
                  >
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                </button>

                {/* Expand / collapse */}
                <button
                  type="button"
                  onClick={() => setExpandedCollabId(isExpanded ? null : c.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setPendingDeleteCollab(c.id)}
                  className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>

              {/* Expanded detail fields */}
              {isExpanded && (
                <div
                  className="border-t border-gray-50 px-3 pb-4 pt-3 space-y-3"
                  onFocus={() => onSectionFocus?.(`receipts-card-${c.id}`)}
                >
                  {/* Brand + Category */}
                  <div className="grid grid-cols-1 min-[425px]:grid-cols-2 gap-2">
                    <div>
                      <Label>Brand</Label>
                      <Input
                        value={c.brand}
                        onChange={(v) => updateCollab(c.id, "brand", v)}
                        placeholder="Brand name"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={c.industry ?? ""}
                        onChange={(v) => updateCollab(c.id, "industry", v)}
                        placeholder="e.g. Clean Beauty"
                      />
                    </div>
                  </div>

                  {/* Goal */}
                  <div>
                    <Label>Campaign goal</Label>
                    <Input
                      value={c.goal ?? ""}
                      onChange={(v) => updateCollab(c.id, "goal", v)}
                      placeholder="e.g. Product launch awareness"
                    />
                  </div>

                  {/* Content delivered */}
                  <div>
                    <Label>Content delivered</Label>
                    <div className="flex gap-2">
                      {(
                        [
                          { label: "Reels", field: "reels_count" },
                          { label: "Posts", field: "posts_count" },
                          { label: "Stories", field: "stories_count" },
                        ] as const
                      ).map(({ label, field }) => (
                        <div key={field} className="flex-1">
                          <p className="text-[11px] text-gray-400 mb-1 text-center">
                            {label}
                          </p>
                          <input
                            type="number"
                            min={0}
                            value={c[field] ?? 0}
                            onChange={(e) =>
                              updateCollab(
                                c.id,
                                field,
                                Math.max(0, Number(e.target.value)),
                              )
                            }
                            className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Showcase posts */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Showcase posts{" "}
                      <span className="text-gray-400 font-normal">
                        ({selectedPosts.length}/10)
                      </span>
                    </p>
                    <div className="grid grid-cols-3 min-[425px]:grid-cols-5 gap-1.5 mb-2">
                      {selectedThumbs.map((thumb, i) =>
                        thumb ? (
                          <div
                            key={i}
                            className="relative rounded-xl overflow-hidden aspect-square ring-1 ring-primary ring-offset-1"
                          >
                            <img
                              src={thumb}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="rounded-xl aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center"
                          >
                            <span className="text-gray-300 text-xs font-medium">
                              {i + 1}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      fullWidth
                      className="rounded-xl"
                      onClick={() => setCollabPickerOpen(c.id)}
                      icon={pickerGridIcon}
                    >
                      {selectedPosts.length > 0
                        ? "Change posts"
                        : "Select posts"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={addCollab}
        fullWidth
        className="rounded-xl mt-3"
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        }
      >
        Add collab
      </Button>

      <PostPickerModal
        isOpen={collabPickerOpen !== null}
        onClose={() => setCollabPickerOpen(null)}
        title={`${activeCollab?.brand || "Collab"} posts`}
        maxSelect={10}
        initialSelectedIds={activeCollabPosts.map((p: any) => p.id)}
        existingPosts={activeCollabPosts}
        onDone={(posts) => {
          if (collabPickerOpen === null) return;
          updateCollab(collabPickerOpen, "collabPosts", posts);
          updateCollab(
            collabPickerOpen,
            "reels_count",
            posts.filter((p: any) => p.media_type === "VIDEO").length,
          );
          updateCollab(
            collabPickerOpen,
            "posts_count",
            posts.filter(
              (p: any) =>
                p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM",
            ).length,
          );
        }}
      />
    </section>
  );
}

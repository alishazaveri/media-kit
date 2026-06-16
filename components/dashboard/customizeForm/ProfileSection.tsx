"use client";

import { useState, useEffect, useRef } from "react";
import { Label, Input } from "./shared";

interface ProfileSectionProps {
  profilePic: string | null;
  setProfilePic: (v: string | null) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  appUsername: string;
  tagline: string;
  setTagline: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  displayEmail: string;
  setDisplayEmail: (v: string) => void;
  nicheTags: string[];
  setNicheTags: (v: string[]) => void;
  onProfilePicUploaded?: (url: string | null) => void;
  onSectionFocus?: (sectionId: string) => void;
}

export function ProfileSection({
  profilePic,
  setProfilePic,
  displayName,
  setDisplayName,
  appUsername,
  tagline,
  setTagline,
  location,
  setLocation,
  displayEmail,
  setDisplayEmail,
  nicheTags,
  setNicheTags,
  onProfilePicUploaded,
  onSectionFocus,
}: ProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const picMenuRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [picMenuOpen, setPicMenuOpen] = useState(false);
  const [pronouns, setPronouns] = useState("she/her");
  const [nicheText, setNicheText] = useState(nicheTags.join(", "));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        picMenuRef.current &&
        !picMenuRef.current.contains(e.target as Node)
      ) {
        setPicMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      if (data.url) {
        setProfilePic(data.url);
        onProfilePicUploaded?.(data.url);
        fetch("/api/analytics/draft", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_pic: data.url }),
        }).catch(() => {});
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage() {
    setPicMenuOpen(false);
    setProfilePic(null);
    onProfilePicUploaded?.(null);
    fetch("/api/upload/profile-image", { method: "DELETE" }).catch(() => {});
  }

  function syncNicheTags() {
    const tags = nicheText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setNicheTags(tags);
  }

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
      onFocus={() => onSectionFocus?.("hero")}
    >
      <p className="font-semibold text-gray-900">Profile</p>

      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" ref={picMenuRef}>
          <button
            type="button"
            onClick={() => !uploading && setPicMenuOpen((v) => !v)}
            className="relative w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden group block"
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          {picMenuOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
              <button
                type="button"
                onClick={() => {
                  setPicMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Change image
              </button>
              {profilePic && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <svg
                    width="14"
                    height="14"
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
                  Remove image
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
      </div>

      {/* Display name + Username */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Display name</Label>
          <Input
            value={displayName}
            onChange={setDisplayName}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label>Username</Label>
          <Input value={appUsername} readOnly placeholder="yourhandle" />
        </div>
      </div>

      {/* Pronouns + Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Pronouns</Label>
          <Input
            value={pronouns}
            onChange={setPronouns}
            placeholder="she/her"
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            value={location}
            onChange={setLocation}
            placeholder="City, Country"
          />
        </div>
      </div>

      {/* Contact email */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Contact email</Label>
          <Input
            value={displayEmail}
            onChange={setDisplayEmail}
            placeholder="hi@you.com"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label>Bio</Label>
        <textarea
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="A short bio about you"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
        />
      </div>

      {/* Niche tags */}
      <div>
        <Label>Niche tags</Label>
        <Input
          value={nicheText}
          onChange={setNicheText}
          onBlur={syncNicheTags}
          placeholder="lifestyle, travel, beauty"
        />
        <p className="text-xs text-gray-400 mt-1">Comma separated</p>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { buildMailto } from "./mailtoLink";

interface HeroSectionProps {
  firstName: string;
  lastName: string;
  initial: string;
  name: string;
  handle: string;
  tagline?: string;
  location?: string;
  profilePic?: string | null;
  availableForCollabs: boolean;
  nicheTags: string[];
  email?: string;
}

export function HeroSection({
  firstName,
  lastName,
  initial,
  name,
  handle,
  tagline,
  location,
  profilePic,
  availableForCollabs,
  nicheTags,
  email,
  baseColor,
  accentColor,
}: HeroSectionProps & {
  baseColor: string;
  accentColor: string;
  contrastColor: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="hero" style={{ backgroundColor: baseColor }}>
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Photo */}
          <div className="md:col-span-5">
            <div className="relative mx-auto w-[200px] min-[375px]:w-72 md:w-full md:max-w-[16rem] lg:max-w-[22rem]">
              <div
                className="absolute inset-0 rounded-[2.25rem]"
                style={{
                  backgroundColor: accentColor,
                  transform: "rotate(-4deg)",
                }}
              />
              <div className="relative aspect-[4/5] rounded-[2.25rem] overflow-hidden ring-1 ring-black/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
                {profilePic && !imgError ? (
                  <img
                    src={profilePic}
                    alt={name}
                    width={800}
                    height={1024}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 text-7xl font-black text-amber-500">
                    {initial}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-7 space-y-6 md:mx-0 mx-auto">
            {/* Available badge + niche tags */}
            <div className="flex flex-wrap items-center  mb-3">
              {/* {availableForCollabs && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                    color: accentColor,
                  }}
                >
                  <span
                    className="size-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: accentColor }}
                  />
                  Available Worldwide
                </span>
              )} */}
              {nicheTags.map((tag, i) => (
                <span
                  key={tag}
                  className="inline-flex items-center "
                  style={{ color: accentColor }}
                >
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: accentColor }}
                  >
                    {tag}
                  </span>
                  {i < nicheTags.length - 1 && (
                    <span
                      className="text-lg text-gray-300 px-3"
                      style={{ color: accentColor }}
                    >
                      •
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Name */}
            <h1
              className="font-black tracking-[-0.04em] leading-[0.82] block text-6xl md:text-8xl lg:text-[7rem] relative"
              style={{
                fontFamily: "Outfit,ui-sans-serif,system-ui,sans-serif",
              }}
            >
              <span className="block text-3xl min-[425px]:text-4xl md:text-5xl lg:text-[5.5rem] text-gray-900/30">
                Hi, I&apos;m
              </span>
              <span className="block text-5xl min-[425px]:text-6xl md:text-6xl lg:text-[7rem] text-gray-900">
                {firstName || "Creator"}{" "}
                {lastName && (
                  <span
                    className="relative z-10"
                    style={{ color: accentColor }}
                  >
                    {lastName}
                  </span>
                )}
              </span>
            </h1>

            {/* Tagline */}
            {tagline && (
              <p className="text-base md:text-xl text-gray-600 font-medium max-w-2xl leading-relaxed whitespace-pre-line">
                {tagline}
              </p>
            )}

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 text-gray-700">
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
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                @{handle || "yourhandle"}
              </span>

              {location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 text-gray-700">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {location}
                </span>
              )}

              {/* <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 text-gray-700">
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
                  <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1m15 20-5-10-5 10M14 18h6" />
                </svg>
                EN · FR · KR
              </span> */}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={email ? buildMailto(email, name) : undefined}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:translate-y-0.5 active:translate-y-1"
                style={
                  {
                    backgroundColor: accentColor,
                    boxShadow: `0 8px 0 color-mix(in srgb, ${accentColor} 65%, black)`,
                  } as React.CSSProperties
                }
              >
                Work With Me
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:rotate-45 transition-transform"
                >
                  <path d="M7 7h10v10M7 17 17 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { type Collaboration, type Package } from "./types";

const TESTIMONIALS = [
  {
    brand: "GlowBeauty Co.",
    role: "Emily Chen · Marketing Director",
    quote:
      "Working with this creator was an absolute dream! Their content exceeded our expectations and drove incredible engagement. The authenticity they bring to every collaboration is unmatched.",
    stars: 5,
  },
  {
    brand: "FitLife Nutrition",
    role: "James Park · Brand Manager",
    quote:
      "Incredible ROI on our campaign. The content was authentic, on-brand, and drove real conversions. Would collaborate again without hesitation.",
    stars: 5,
  },
  {
    brand: "TravelEase Luggage",
    role: "Sofia Reyes · CMO",
    quote:
      "One of the most professional creators we've worked with. Delivered ahead of schedule and the storytelling was genuinely compelling.",
    stars: 5,
  },
];

export function PartnerSection({
  sortedCollabs,
  visiblePackages,
  turnaround,
  nicheTags,
  tagline,
  name,
}: {
  sortedCollabs: Collaboration[];
  visiblePackages: Package[];
  turnaround: string;
  nicheTags: string[];
  tagline?: string;
  name: string;
}) {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const t = TESTIMONIALS[testimonialIdx];
  const prev = () => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);

  const trustedBrands =
    sortedCollabs.length > 0
      ? sortedCollabs.slice(0, 6).map((c) => c.brand)
      : ["VOGUE", "ADIDAS", "APPLE", "PRADA", "AESOP", "SPOTIFY"]; // [DUMMY brands]

  const vibeTags =
    nicheTags.length >= 6
      ? nicheTags.slice(0, 6)
      : ["Curious", "Crafted", "Confident", "Playful", "Honest", "Sustainable"]; // [DUMMY vibe words]

  return (
    <section id="partner" className="bg-[#E8F5F0]">
      {/* TRUSTED BY bar */}
      <div className="px-8 py-10 border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto flex items-center gap-10 flex-wrap">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase shrink-0">
            Trusted By
          </span>
          {trustedBrands.map((brand) => (
            <span key={brand} className="font-black text-gray-700 text-lg tracking-wide uppercase">
              {brand}
            </span>
          ))}
        </div>
      </div>

      <div className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Packages list */}
          {visiblePackages.length > 0 && (
            <div className="mb-16">
              <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-10">
                Partnership Architecture
              </p>
              <div>
                {visiblePackages.map(({ id, title, description, price }, i) => (
                  <div key={id}>
                    {i > 0 && <div className="border-t border-gray-200/80" />}
                    <div className="flex items-center justify-between py-8 gap-6">
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-2xl mb-1">{title || "Package"}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <span className="text-sm text-gray-400 hidden md:block">
                          {turnaround || "Custom timeline"} delivery
                        </span>
                        <p className="font-black text-blue-600 text-2xl">{price || "—"}</p>
                        <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-200/80" />
              </div>
            </div>
          )}

          {/* Testimonials */}
          <div className="mb-16">
            <p className="font-black text-gray-900 text-2xl mb-2">What brands say</p>
            <p className="text-sm text-gray-400 mb-8">Client testimonials</p>
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-lg mb-3">
                  {t.brand[0]}
                </div>
                <p className="font-bold text-gray-900">{t.brand}</p>
                <p className="text-xs text-gray-400 mb-3">{t.role}</p>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={prev} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-400 transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`rounded-full transition-all ${i === testimonialIdx ? "w-5 h-1.5 bg-blue-600" : "w-1.5 h-1.5 bg-gray-200"}`}
                    />
                  ))}
                </div>
                <button onClick={next} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-400 transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* The Vibe card */}
          <div className="bg-[#DFF0EA] rounded-3xl p-10">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="md:w-56 shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mb-3">
                  <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M3 12H2M22 12h-1M4.22 19.78l.7-.7M19.07 4.93l.71-.71" stroke="#3B5BDB" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="4" stroke="#3B5BDB" strokeWidth="1.5" />
                </svg>
                <p className="font-black text-gray-900 text-2xl mb-2">The Vibe</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {tagline ? tagline.slice(0, 80) : "Curious, calm, color-confident. Soft maximalism with a research-driven edge."} {/* [DUMMY if tagline too long] */}
                </p>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {vibeTags.map((tag) => (
                    <div key={tag} className="bg-white rounded-2xl px-5 py-3 text-center font-semibold text-gray-700 text-sm">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-64 shrink-0 space-y-4">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Causes:</span>{" "}
                  Climate, queer creators, slow fashion. {/* [DUMMY: no causes field] */}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Hobbies:</span>{" "}
                  35mm film, ceramics, long walks, Korean indie pop. {/* [DUMMY: no hobbies field] */}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Response time:</span>{" "}
                  {turnaround ? `Within ${turnaround} on weekdays.` : "Within 24h on weekdays."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

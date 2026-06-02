"use client";

import { motion } from "motion/react";

const CHART_LINE =
  "M 0 138 L 44 124 L 88 112 L 132 104 L 176 86 L 220 70 L 264 56 L 308 42 L 352 28 L 400 16";
const CHART_FILL = `${CHART_LINE} L 400 158 L 0 158 Z`;

const platforms = [
  { name: "Instagram", value: "284K", color: "#E1306C" },
  { name: "YouTube", value: "142K", color: "#FF0000" },
  { name: "TikTok", value: "98K", color: "#69C9D0" },
];

const features = [
  "Real-time reach & impressions",
  "Audience demographics & interests",
  "Top-performing content auto-pinned",
  "Growth velocity & trend signals",
];

const featureListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const featureItemVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="py-28 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* ── Left: text ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -30% 0px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block bg-orange-100 text-primary text-xs font-bold uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full mb-6">
              Live Analytics
            </span>
            <h2
              className="font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(2rem, 4vw, 52px)",
              }}
            >
              Stats that update faster than your followers grow.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-10">
              Auto-synced engagement, reach, and audience insights from every
              platform — no screenshots, no spreadsheets, no out-of-date PDFs.
            </p>
          </motion.div>

          <motion.ul
            className="space-y-4"
            variants={featureListVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -25% 0px" }}
          >
            {features.map((f, i) => (
              <motion.li
                key={f}
                variants={featureItemVariants}
                className="flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#ff7350" }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <motion.path
                      d="M2.5 5.5L4.5 7.5L8.5 3.5"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.35,
                        delay: 0.25 + i * 0.12,
                        ease: "easeOut",
                      }}
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-sm font-medium">{f}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* ── Right: chart card ── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -30% 0px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-7">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Engagement
                </p>
                <p className="text-4xl font-black text-gray-900">8.42%</p>
              </div>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">
                ▲ 38%
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden mb-5">
              <svg
                width="100%"
                height="158"
                viewBox="0 0 400 158"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff7350" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#ff7350" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={CHART_FILL}
                  fill="url(#chartGrad)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                />
                <motion.path
                  d={CHART_LINE}
                  fill="none"
                  stroke="#ff7350"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 1 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }}
                />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {platforms.map((p, i) => (
                <motion.div
                  key={p.name}
                  className="bg-gray-50 rounded-2xl p-3.5"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: 1.6 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: p.color }}
                    />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-xl font-black text-gray-900">{p.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

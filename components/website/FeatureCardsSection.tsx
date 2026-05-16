"use client";

import { motion } from "motion/react";

const featureCardData = [
  {
    title: "Ready in 2 mins",
    desc: "Pre-filled with smart defaults pulled straight from your Instagram.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M10.5 2L5.5 10H9.5L7.5 16L13 7.5H9L10.5 2Z"
          stroke="#ff7350"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Live preview",
    desc: "See your page exactly as brands will see it — as you build it.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <ellipse
          cx="9"
          cy="9"
          rx="7.5"
          ry="4.5"
          stroke="#ff7350"
          strokeWidth="1.5"
        />
        <circle cx="9" cy="9" r="2" stroke="#ff7350" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Professional link",
    desc: "Share one beautiful URL with brands instantly — no PDF attachments.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2L5 4.5V9C5 12.5 6.8 15.5 9 16.5C11.2 15.5 13 12.5 13 9V4.5L9 2Z"
          stroke="#ff7350"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Always online",
    desc: "Hosted on our infrastructure. Always fast, always available.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="#ff7350" strokeWidth="1.5" />
        <ellipse
          cx="9"
          cy="9"
          rx="3.5"
          ry="7.5"
          stroke="#ff7350"
          strokeWidth="1.5"
        />
        <path
          d="M1.5 9H16.5"
          stroke="#ff7350"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 h-full flex flex-col">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6 shrink-0"
        style={{ background: "rgba(255,115,80,0.10)" }}
      >
        {icon}
      </div>
      <p className="font-bold text-gray-900 text-base mb-2">{title}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

const rowVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
};
const cubicEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fromLeft = {
  hidden: { x: -700, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: cubicEase } },
};
const fromRight = {
  hidden: { x: 700, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: cubicEase } },
};

export default function FeatureCardsSection() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
            Why Kloot
          </p>
          <h2
            className="font-black text-gray-900 leading-[1.08] tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(1.5rem, 3vw, 44px)",
            }}
          >
            Built for creators who want results,
            <br className="hidden sm:block" /> not complexity.
          </h2>
        </motion.div>

        {/* Desktop: Row 1 */}
        <motion.div
          className="hidden lg:grid grid-cols-2 gap-5 mb-5"
          variants={rowVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -25% 0px" }}
        >
          <motion.div variants={fromLeft}>
            <FeatureCard {...featureCardData[0]} />
          </motion.div>
          <motion.div variants={fromRight}>
            <FeatureCard {...featureCardData[1]} />
          </motion.div>
        </motion.div>

        {/* Desktop: Row 2 */}
        <motion.div
          className="hidden lg:grid grid-cols-2 gap-5"
          variants={rowVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -25% 0px" }}
        >
          <motion.div variants={fromLeft}>
            <FeatureCard {...featureCardData[2]} />
          </motion.div>
          <motion.div variants={fromRight}>
            <FeatureCard {...featureCardData[3]} />
          </motion.div>
        </motion.div>

        {/* Mobile: fade-up */}
        <div className="lg:hidden flex flex-col gap-4">
          {featureCardData.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: cubicEase }}
            >
              <FeatureCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

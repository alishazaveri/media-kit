"use client";

import { motion } from "motion/react";

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stepsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

export default function StepsSection() {
  const steps = [
    {
      n: 1,
      title: "Claim your page",
      desc: "Choose your unique handle and create your page.",
    },
    {
      n: 2,
      title: "Connect your apps",
      desc: "Connect your socials, apps, links, and everything you want to showcase.",
    },
    {
      n: 3,
      title: "Share your Kloot",
      desc: "Use one powerful link for your audience, collaborations, and brand deals.",
    },
  ];

  return (
    <section id="steps" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40% 0px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-[0.18em] mb-5">
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              className="opacity-80"
            >
              <path
                d="M8.5 1.5C9.9 1.5 11 2.6 11 4C11 5.4 9.9 6.5 8.5 6.5C7.8 6.5 7.2 6.2 6.7 5.8L4.5 8H3V9.5H1.5V12H4V10.5L6.2 8.3C6.8 8.7 7.6 9 8.5 9C9.9 9 11 10.1 11 11.5"
                stroke="#ff7350"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8.5" cy="4" r="1" fill="#ff7350" />
            </svg>
            How it works
          </span>
          <h2
            className="font-black text-gray-900 leading-[1.08] tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(2rem, 4.5vw, 60px)",
            }}
          >
            3 simple steps to get started
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={stepsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -40% 0px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.n}
              variants={cardVariants}
              className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50 flex flex-col gap-5"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,115,80,0.10)" }}
              >
                <span
                  className="font-black text-lg leading-none"
                  style={{ color: "#ff7350" }}
                >
                  {step.n}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg mb-2">
                  {step.title}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

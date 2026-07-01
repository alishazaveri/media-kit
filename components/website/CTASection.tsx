"use client";

import { motion } from "motion/react";

export default function CTASection() {
  return (
    <section
      className="py-28 px-6 text-center"
      // style={{ background: "#FAF8F5" }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="font-black text-gray-900 leading-[1.05] tracking-tight mb-5"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(2.2rem, 5vw, 68px)",
            }}
          >
            Your creator page is{" "}
            <span className="text-primary">one click away</span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of creators who use Kloot to land more brand deals
            with less effort.
          </p>
          <a
            href="/app/onboarding"
            className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors"
          >
            Create Your Page
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

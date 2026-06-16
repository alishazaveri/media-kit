"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "motion/react";

function Word({
  children,
  delay = 0,
  className = "",
}: {
  children: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0, filter: "blur(12px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}

function Card({
  visible,
  delay = 0,
  initialX = 0,
  rotate = 0,
  className = "",
  style,
  children,
}: {
  visible: boolean;
  delay?: number;
  initialX?: number;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute bg-white rounded-2xl shadow-xl border border-gray-100 px-3.5 py-3 z-10 ${className}`}
      style={style}
      initial={{ x: initialX, opacity: 0, scale: 0.12, rotate: rotate * 2 }}
      animate={
        visible
          ? { x: 0, opacity: 1, scale: 1, rotate }
          : { x: initialX, opacity: 0, scale: 0.12, rotate: rotate * 2 }
      }
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 18,
        delay: visible ? delay : 0,
        opacity: { duration: 0.3, delay: visible ? delay : 0 },
      }}
    >
      {children}
    </motion.div>
  );
}

function PhoneWithCards({ cardsVisible }: { cardsVisible: boolean }) {
  const L = (n: number) => `calc(50% - 200px - ${n}px)`;
  const R = (n: number) => `calc(50% - 200px - ${n}px)`;

  return (
    <div
      className="relative flex items-start justify-center"
      style={{ width: "100%", maxWidth: 800 }}
    >
      {/* ── Left cards ── */}
      <Card
        visible={cardsVisible}
        delay={0.05}
        initialX={240}
        rotate={-8}
        className="hidden lg:flex items-center gap-2.5"
        style={{ left: L(170), top: 140 }}
      >
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2L4 5V10C4 13.8 6.6 17.3 10 18.5C13.4 17.3 16 13.8 16 10V5L10 2Z"
              stroke="#ff7350"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 leading-none">
            New opportunity!
          </p>
          <p className="text-xs font-bold text-gray-900 leading-none mt-1">
            Brand wants to collab →
          </p>
        </div>
      </Card>

      <Card
        visible={cardsVisible}
        delay={0.2}
        initialX={255}
        rotate={5}
        className="hidden lg:block"
        style={{ left: L(185), top: 290 }}
      >
        <div style={{ width: 170 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-rose-200 rounded-xl shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-900 leading-none">
                Wellness Reel Pack
              </p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                3 reels · 1 story
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-gray-900">₹25,000</p>
            <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-semibold">
              Book now
            </span>
          </div>
        </div>
      </Card>

      <Card
        visible={cardsVisible}
        delay={0.35}
        initialX={230}
        rotate={-4}
        className="hidden lg:flex items-center gap-3"
        style={{ left: L(160), top: 540 }}
      >
        <div>
          <p className="text-[10px] text-gray-400 leading-none">My deals</p>
          <p className="text-xl font-black text-gray-900 leading-none mt-0.5">
            ₹3.5L
          </p>
        </div>
        <svg width="64" height="36" viewBox="0 0 64 36" fill="none">
          <path
            d="M0 30 L12 22 L22 26 L34 14 L44 18 L54 8 L64 3"
            stroke="#ff7350"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 30 L12 22 L22 26 L34 14 L44 18 L54 8 L64 3 L64 36 L0 36Z"
            fill="url(#g1)"
          />
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7350" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff7350" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </Card>

      {/* ── Right cards ── */}
      <Card
        visible={cardsVisible}
        delay={0.12}
        initialX={-240}
        rotate={7}
        className="hidden lg:flex items-center gap-2.5"
        style={{ right: R(170), top: 120 }}
      >
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M1.5 10.5L5 7L8 9.5L12.5 4"
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 4H12.5V7"
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 leading-none">
            Engagement rate
          </p>
          <p className="text-sm font-black text-gray-900 leading-none mt-0.5">
            8.5%{" "}
            <span className="text-green-500 text-[10px] font-semibold">
              ↑ 2.1%
            </span>
          </p>
        </div>
      </Card>

      <Card
        visible={cardsVisible}
        delay={0.28}
        initialX={-255}
        rotate={-6}
        className="hidden lg:block"
        style={{ right: R(180), top: 355 }}
      >
        <p className="text-[10px] text-gray-400 leading-none mb-1.5">
          Total earnings
        </p>
        <p className="text-lg font-black text-gray-900 leading-none">
          ₹1,26,000
        </p>
        <svg
          width="110"
          height="40"
          viewBox="0 0 110 40"
          fill="none"
          className="mt-2"
        >
          <path
            d="M0 36 C12 30 24 22 34 24 C44 26 56 10 68 12 C80 14 92 4 110 2"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M0 36 C12 30 24 22 34 24 C44 26 56 10 68 12 C80 14 92 4 110 2 L110 40 L0 40Z"
            fill="rgba(99,102,241,0.1)"
          />
        </svg>
      </Card>

      <Card
        visible={cardsVisible}
        delay={0.44}
        initialX={-230}
        rotate={4}
        className="hidden lg:flex items-center gap-2.5"
        style={{ right: R(155), top: 585 }}
      >
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <circle
              cx="7"
              cy="4.5"
              r="2.5"
              stroke="#ff7350"
              strokeWidth="1.4"
            />
            <path
              d="M1.5 13C1.5 10.5 4 8.5 7 8.5C10 8.5 12.5 10.5 12.5 13"
              stroke="#ff7350"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 leading-none">Followers</p>
          <p className="text-sm font-black text-gray-900 leading-none mt-0.5">
            485K{" "}
            <span className="text-green-500 text-[10px] font-semibold">
              &amp; growing
            </span>
          </p>
        </div>
      </Card>

      {/* ── Phone ── */}
      <div
        className="relative z-20 shrink-0"
        style={{ width: "min(400px, 90vw)" }}
      >
        <motion.div
          className="absolute -inset-16 z-0 pointer-events-none hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: cardsVisible ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          style={{
            filter: "blur(60px)",
            background:
              "radial-gradient(circle at 40% 55%, rgba(255,115,80,0.38) 0%, transparent 60%), " +
              "radial-gradient(circle at 65% 40%, rgba(255,180,80,0.22) 0%, transparent 55%)",
          }}
        />
        <img
          src="/phone-dummy.avif"
          alt="Phone"
          style={{
            width: "100%",
            display: "block",
            position: "relative",
            zIndex: 2,
          }}
          draggable={false}
        />
        <div
          className="absolute overflow-hidden"
          style={{
            top: "2.2%",
            left: "5.2%",
            right: "5.2%",
            bottom: "2.2%",
            borderRadius: "13%/9%",
            zIndex: 1,
          }}
        >
          <Image
            src="/profile-dummy-1.png"
            alt="Profile preview"
            fill
            sizes="310px"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>
      </div>
    </div>
  );
}

const heroWords: { text: string; accent: boolean }[] = [
  { text: "Build", accent: false },
  { text: "Your", accent: false },
  { text: "Page", accent: false },
  { text: "Before", accent: true },
  { text: "Your", accent: true },
  { text: "Coffee", accent: false },
  { text: "Gets", accent: false },
  { text: "Cold", accent: false },
];

function HeroDesktop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cardsTriggered = useRef(false);
  // Stable 0 on server; updated to Date.now() after hydration so framer-motion
  // re-runs word animations on client navigations without causing an SSR mismatch.
  const [mountId, setMountId] = useState(0);
  useEffect(() => {
    setMountId(Date.now());
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "start -100%"],
  });

  // Desktop transforms
  const textYDesktop = useTransform(scrollYProgress, [0, 0.1], [-20, -50]);
  const textScaleDesktop = useTransform(scrollYProgress, [0.15, 1], [1, 0.3]);

  // Mobile transforms
  const textYMobile = useTransform(scrollYProgress, [0, 0.1], [0, -2]);
  const textScaleMobile = useTransform(scrollYProgress, [0.15, 1], [1, 0.3]);

  const textY = isMobile ? textYMobile : textYDesktop;
  const textScale = isMobile ? textScaleMobile : textScaleDesktop;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const shouldShow = v > 0.1;

    if (shouldShow !== cardsTriggered.current) {
      cardsTriggered.current = shouldShow;
      setCardsVisible(shouldShow);
    }
  });

  return (
    <div
      ref={sectionRef}
      className="block relative lg:h-[170dvh] h-[120dvh]"
      // style={{ height: "220dvh" }}
    >
      {/* Background scrolls normally with the section */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
        style={{ height: "100vh", zIndex: 0 }}
      >
        <Image
          src="/background.jpg"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>

      {/* Content column — text is sticky, phone scrolls normally */}
      <div
        className="relative flex flex-col items-center px-4 lg:px-11 pt-16  lg:pt-[120px]"
        style={{ gap: 16, zIndex: 1 }}
      >
        {/* Sticky text */}
        <div className="sticky top-[80px] lg:top-[120px] z-10 w-full flex justify-center pointer-events-none select-none mt-[40px]">
          <motion.h1
            className="text-center font-black leading-[1.1] lg:leading-[1.05] tracking-tight text-gray-900 w-full "
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(2.4rem, 9vw, 88px)",
              y: textY,
              scale: textScale,
              marginTop: 0,
              transformOrigin: "center center",
              maxWidth: 800,
            }}
          >
            <span className="flex flex-wrap justify-center gap-x-[0.22em] gap-y-0">
              {heroWords.map((w, i) => (
                <Word
                  key={mountId + w.text + i}
                  delay={0.1 + i * 0.065}
                  className={w.accent ? "text-primary" : ""}
                >
                  {w.text}
                </Word>
              ))}
            </span>
          </motion.h1>
        </div>

        {/* Phone — normal flow, scrolls naturally */}
        <div
          className="relative flex items-start justify-center shrink-0 w-full"
          style={{ maxWidth: 800 }}
        >
          <PhoneWithCards cardsVisible={cardsVisible} />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return <HeroDesktop />;
}

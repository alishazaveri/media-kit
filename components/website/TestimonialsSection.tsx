const testimonials = [
  {
    quote:
      "Kloot literally got me my first brand deal. I sent one link and the brand came back the same day.",
    name: "Priya Sharma",
    role: "Lifestyle Creator ",
    initials: "PS",
    color: "#ff7350",
    followers: "80K followers",
  },
  {
    quote:
      "I used to send a 12-page PDF. Now I send a Kloot link and brands immediately get it. Response rate is insane.",
    name: "Marcus Cole",
    role: "Tech Reviewer",
    initials: "MC",
    color: "#6366f1",
    followers: "42K followers",
  },
  {
    quote:
      "The analytics page alone is worth it. Brands love seeing real numbers instead of screenshots.",
    name: "Anika Reyes",
    role: "Travel Creator",
    initials: "AR",
    color: "#0ea5e9",
    followers: "19K followers",
  },
  {
    quote:
      "Set it up in 10 minutes. My media kit used to take a week to update — now it's instant.",
    name: "Jordan Lee",
    role: "Fitness Creator",
    initials: "JL",
    color: "#10b981",
    followers: "25K followers",
  },
  {
    quote:
      "Closed a ₹3L deal within 48 hours of going live. The page just looks so professional.",
    name: "Riya Kapoor",
    role: "Beauty Creator",
    initials: "RK",
    color: "#f59e0b",
    followers: "80K followers",
  },
  {
    quote:
      "Brands stopped ghosting me after I switched to Kloot. The data builds so much trust.",
    name: "Dev Patel",
    role: "Comedy Creator",
    initials: "DP",
    color: "#ec4899",
    followers: "15K followers",
  },
  {
    quote:
      "Every creator friend I've referred has signed a deal within their first month. Game changer.",
    name: "Sana Mirza",
    role: "Food Creator",
    initials: "SM",
    color: "#8b5cf6",
    followers: "28K followers",
  },
];

function TestimonialCard({
  quote,
  name,
  role,
  initials,
  color,
  followers,
}: (typeof testimonials)[0]) {
  return (
    <div className="shrink-0 w-[300px] bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mx-3 flex flex-col gap-4">
      <p className="text-md text-gray-700 leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-3">
        {/* <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: color }}
        >
          {initials}
        </div> */}
        <div>
          <p className="text-sm font-semibold text-gray-900">{role}</p>
          <p className="text-xs text-gray-400">{followers}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      className="py-24 overflow-hidden"
      // style={{ background: "#FAF8F5" }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center mb-14">
        <h2
          className="font-black text-gray-900 leading-[1.1] tracking-tight"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(1.9rem, 4.5vw, 56px)",
          }}
        >
          The internet <span className="text-primary">loves Kloot.</span>
          <br />
          You will too.
        </h2>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10"
          style={{
            background: "linear-gradient(to right, #FAF8F5, transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10"
          style={{
            background: "linear-gradient(to left, #FAF8F5, transparent)",
          }}
        />
        <div className="animate-marquee-right">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
          {testimonials.map((t, i) => (
            <TestimonialCard key={`dup-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

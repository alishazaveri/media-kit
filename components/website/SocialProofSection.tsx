const BRANDS = [
  { name: "Myntra",             domain: "myntra.com" },
  { name: "Mamaearth",          domain: "mamaearth.in" },
  { name: "boAt",               domain: "boat-lifestyle.com" },
  { name: "Nykaa",              domain: "nykaa.com" },
  { name: "Swiggy",             domain: "swiggy.com" },
  { name: "Minimalist",         domain: "beminimalist.co" },
  { name: "FabIndia",           domain: "fabindia.com" },
  { name: "PhonePe",            domain: "phonepe.com" },
  { name: "Plum",               domain: "plumgoodness.com" },
  { name: "Manyavar",           domain: "manyavar.com" },
  { name: "Foxtale",            domain: "foxtale.in" },
  { name: "Zomato",             domain: "zomato.com" },
  { name: "Dot & Key",          domain: "dotandkey.com" },
  { name: "H&M",                domain: "hm.com" },
  { name: "mCaffeine",          domain: "mcaffeine.com" },
  { name: "Sleepy Owl",         domain: "sleepyowl.co" },
  { name: "Nykaa Fashion",      domain: "nykaafashion.com" },
  { name: "WOW Skin Science",   domain: "buywow.in" },
  { name: "Lakme",              domain: "lakmeindia.com" },
  { name: "The Derma Co",       domain: "thedermaco.com" },
];

const ALL = [...BRANDS, ...BRANDS];

export default function SocialProofSection() {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 text-center mb-14">
        <h2
          className="font-black text-gray-900 leading-[1.1] tracking-tight"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(1.9rem, 4.5vw, 56px)",
          }}
        >
          Brands that have worked with <span className="text-primary">creators on Kloot</span>
        </h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />
        <div className="marquee">
          <div className="marquee__track">
            {ALL.map((brand, i) => (
              <div key={`${brand.domain}-${i}`} style={{ flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.brandfetch.io/${brand.domain}/w/200/h/80/logo`}
                  alt={i < BRANDS.length ? brand.name : ""}
                  aria-hidden={i >= BRANDS.length}
                  style={{ height: "clamp(24px, 5vw, 40px)", width: "auto", maxWidth: "clamp(90px, 18vw, 150px)" }}
                  className="grayscale opacity-50 hover:opacity-90 hover:grayscale-0 transition-all duration-300 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

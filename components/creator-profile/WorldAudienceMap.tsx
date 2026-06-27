"use client";

import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";
import type { Coordinates } from "@vnedyalk0v/react19-simple-maps";
import isoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

isoCountries.registerLocale(enLocale);

type Tab = "cities" | "countries";

// India boundary per Survey of India (Kashmir as integral part of India)
const GEO_URL = "/countries-india.json";

// Display name overrides for the legend (shorter / cleaner than ISO standard)
const DISPLAY_OVERRIDES: Record<string, string> = {
  AE: "UAE",
  TW: "Taiwan",
};

// ISO 3166-1 alpha-2 → short readable name for the legend
function isoToDisplay(code: string): string {
  return DISPLAY_OVERRIDES[code] ?? isoCountries.getName(code, "en") ?? code;
}

// Flag emoji computed from ISO alpha-2 — no lookup table needed
function isoToFlag(code: string): string {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

const CITY_COORDS: Record<string, [number, number]> = {
  "new york": [-74.006, 40.713],
  "los angeles": [-118.244, 34.052],
  chicago: [-87.629, 41.878],
  houston: [-95.37, 29.76],
  miami: [-80.192, 25.774],
  "san francisco": [-122.419, 37.775],
  london: [-0.128, 51.507],
  manchester: [-2.244, 53.48],
  birmingham: [-1.899, 52.48],
  paris: [2.352, 48.857],
  berlin: [13.405, 52.52],
  munich: [11.576, 48.137],
  hamburg: [9.993, 53.551],
  frankfurt: [8.682, 50.11],
  rome: [12.496, 41.902],
  milan: [9.19, 45.465],
  madrid: [-3.703, 40.417],
  barcelona: [2.154, 41.39],
  amsterdam: [4.9, 52.37],
  brussels: [4.352, 50.85],
  vienna: [16.373, 48.208],
  zurich: [8.541, 47.376],
  stockholm: [18.063, 59.333],
  oslo: [10.739, 59.913],
  copenhagen: [12.568, 55.676],
  warsaw: [21.012, 52.229],
  prague: [14.421, 50.088],
  budapest: [19.04, 47.498],
  tokyo: [139.692, 35.69],
  osaka: [135.502, 34.694],
  seoul: [126.978, 37.567],
  busan: [129.075, 35.18],
  beijing: [116.407, 39.904],
  shanghai: [121.474, 31.23],
  "hong kong": [114.178, 22.3],
  singapore: [103.82, 1.352],
  jakarta: [106.845, -6.208],
  bangkok: [100.501, 13.756],
  mumbai: [72.878, 19.076],
  delhi: [77.209, 28.614],
  bangalore: [77.594, 12.972],
  hyderabad: [78.486, 17.385],
  chennai: [80.27, 13.082],
  dubai: [55.296, 25.204],
  "abu dhabi": [54.367, 24.466],
  istanbul: [28.978, 41.015],
  cairo: [31.235, 30.044],
  lagos: [3.379, 6.455],
  nairobi: [36.817, -1.292],
  johannesburg: [28.047, -26.204],
  toronto: [-79.383, 43.653],
  vancouver: [-123.121, 49.283],
  montreal: [-73.568, 45.509],
  sydney: [151.209, -33.868],
  melbourne: [144.963, -37.814],
  "mexico city": [-99.133, 19.433],
  "sao paulo": [-46.634, -23.543],
  "rio de janeiro": [-43.172, -22.907],
  "buenos aires": [-58.381, -34.603],
  lima: [-77.028, -12.046],
  bogota: [-74.072, 4.711],
  karachi: [67.01, 24.861],
  lahore: [74.343, 31.558],
  dhaka: [90.413, 23.81],
  riyadh: [46.675, 24.688],
  tehran: [51.388, 35.694],
  baghdad: [44.361, 33.341],
  "kuala lumpur": [101.686, 3.148],
  manila: [120.984, 14.599],
  "ho chi minh city": [106.66, 10.823],
  hanoi: [105.835, 21.028],
  taipei: [121.565, 25.033],
  moscow: [37.618, 55.752],
  kyiv: [30.523, 50.45],
  athens: [23.728, 37.984],
  lisbon: [-9.139, 38.722],
  "cape town": [18.424, -33.925],
  casablanca: [-7.589, 33.573],
  accra: [-0.187, 5.556],
  "addis ababa": [38.737, 9.024],
  // India — major cities and states
  ahmedabad: [72.585, 23.033],
  gandhinagar: [72.636, 23.216],
  surat: [72.831, 21.17],
  mehsana: [72.387, 23.6],
  vadodara: [73.18, 22.307],
  rajkot: [70.802, 22.303],
  anand: [72.928, 22.556],
  bharuch: [72.997, 21.706],
  jamnagar: [70.057, 22.47],
  bhavnagar: [72.152, 21.767],
  junagadh: [70.457, 21.522],
  morbi: [70.837, 22.817],
  pune: [73.856, 18.52],
  kolkata: [88.363, 22.572],
  jaipur: [75.787, 26.912],
  lucknow: [80.946, 26.847],
  kanpur: [80.347, 26.449],
  nagpur: [79.082, 21.146],
  visakhapatnam: [83.218, 17.686],
  bhopal: [77.412, 23.259],
  patna: [85.144, 25.594],
  ludhiana: [75.848, 30.901],
  agra: [78.008, 27.177],
  nashik: [73.79, 19.998],
  meerut: [77.706, 28.984],
  srinagar: [74.797, 34.084],
  aurangabad: [75.343, 19.877],
  amritsar: [74.872, 31.634],
  indore: [75.857, 22.719],
  coimbatore: [76.962, 11.017],
  kochi: [76.267, 9.931],
  chandigarh: [76.779, 30.733],
  guwahati: [91.745, 26.185],
  bhubaneswar: [85.822, 20.296],
  thiruvananthapuram: [76.945, 8.524],
  dehradun: [78.032, 30.324],
  raipur: [81.629, 21.251],
  "new delhi": [77.209, 28.614],
};

// Instagram returns "City, State" — try full name then city-only part
function getCityCoords(name: string): [number, number] | null {
  const lower = name.toLowerCase();
  if (CITY_COORDS[lower]) return CITY_COORDS[lower];
  const cityOnly = lower.split(",")[0].trim();
  return CITY_COORDS[cityOnly] ?? null;
}

// Compute map center + scale to frame all known city coordinates
function computeProjection(coords: ([number, number] | null)[]): {
  scale: number;
  center: [number, number];
} {
  const valid = coords.filter((c): c is [number, number] => c !== null);
  if (valid.length === 0) return { scale: 130, center: [10, 20] };

  const lons = valid.map((c) => c[0]);
  const lats = valid.map((c) => c[1]);
  const minLon = Math.min(...lons),
    maxLon = Math.max(...lons);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;

  const span = Math.max(maxLon - minLon, maxLat - minLat);
  // 1.8× padding around bounds, min 8° so single-city still shows context
  const paddedSpan = Math.max(span * 1.8, 8);
  // scale 140 ≈ full world (360°); invert to zoom in

  const scale = Math.min(1500, Math.round((140 * 360) / paddedSpan));
  return { scale, center: [centerLon, centerLat] };
}

const DUMMY_COUNTRIES = [
  { country: "US", count: 220 },
  { country: "GB", count: 180 },
  { country: "KR", count: 140 },
  { country: "DE", count: 90 },
  { country: "JP", count: 70 },
  { country: "FR", count: 60 },
];

const DUMMY_CITIES = [
  { city: "New York", count: 220 },
  { city: "London", count: 180 },
  { city: "Seoul", count: 140 },
  { city: "Berlin", count: 90 },
  { city: "Tokyo", count: 70 },
  { city: "Paris", count: 60 },
];

export function WorldAudienceMap({
  topCountries,
  topCities,
  accentColor,
  baseColor,
  contrastColor,
}: {
  topCountries: { country: string; count: number }[];
  topCities: { city: string; count: number }[];
  accentColor: string;
  baseColor: string;
  contrastColor: string;
}) {
  const rawCountries = topCountries.length > 0 ? topCountries : DUMMY_COUNTRIES;
  const rawCities = topCities.length > 0 ? topCities : DUMMY_CITIES;

  // Cap both lists to min(countries, cities) for visual parity
  const n = Math.min(rawCountries.length, rawCities.length, 6);
  const countries = rawCountries.slice(0, n);
  const cities = rawCities.slice(0, n);

  // Country highlighting on map (countries tab)
  const maxCountryCount = Math.max(...countries.map((c) => c.count), 1);
  // New geography file uses iso_code (alpha-3); convert alpha-2 → alpha-3 for matching
  const countryIntensity = new Map<string, number>(
    countries.flatMap((c) => {
      const a3 = isoCountries.alpha2ToAlpha3(c.country);
      return a3 ? [[a3, c.count / maxCountryCount] as [string, number]] : [];
    }),
  );

  // City markers
  const cityTotal = cities.reduce((s, c) => s + c.count, 0);
  const cityMarkers = cities.map((c, i) => ({
    rank: i + 1,
    name: c.city,
    count: c.count,
    pct: cityTotal > 0 ? Math.round((c.count / cityTotal) * 100) : 0,
    coords: getCityCoords(c.city),
  }));

  // Auto-zoom the map to frame all known city coordinates
  const projection = computeProjection(cityMarkers.map((m) => m.coords));

  // Country legend entries
  const countryTotal = countries.reduce((s, c) => s + c.count, 0);
  const countryItems = countries.map((c) => ({
    code: c.country,
    name: isoToDisplay(c.country),
    flag: isoToFlag(c.country),
    pct: countryTotal > 0 ? Math.round((c.count / countryTotal) * 100) : 0,
    count: c.count,
  }));

  const [tab, setTab] = useState<Tab>("cities");
  const [geoData, setGeoData] = useState<object | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col border-1 "
      style={{ backgroundColor: "white", borderColor: "rgba(0,0,0,0.1)" }}
    >
      {/* Header + Tabs */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <h3 className="text-[17px] font-bold text-gray-900">Top locations</h3>
        {/* Tab switcher */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-xl"
          style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
        >
          {(["cities", "countries"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer"
              style={
                tab === t
                  ? { backgroundColor: contrastColor, color: "white" }
                  : { color: "rgba(0,0,0,0.4)" }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Legend side by side on md+ */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Map */}
        <div
          className="md:flex-1 w-full relative md:h-[430px] h-[200px] "
          style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
        >
          {/* CSS pulse animation for city markers */}
          <style>{`
            @keyframes rsm-city-pulse {
              0%   { transform: scale(1);   opacity: 0.55; }
              100% { transform: scale(3.8); opacity: 0; }
            }
            .rsm-city-pulse {
              animation: rsm-city-pulse 2.2s ease-out infinite;
              transform-box: fill-box;
              transform-origin: center;
            }
          `}</style>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={
              tab === "cities"
                ? {
                    scale: projection.scale,
                    center: projection.center as Coordinates,
                  }
                : { scale: 130, center: [0, 35] as Coordinates }
            }
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies
              geography={geoData ?? { type: "FeatureCollection", features: [] }}
            >
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoA3: string = geo.properties?.iso_code ?? "";
                  const intensity = countryIntensity.get(isoA3) ?? 0;

                  let fill = baseColor;
                  let fillOpacity = 1;

                  if (tab === "countries" && intensity > 0) {
                    fill = accentColor;
                    fillOpacity = 0.35 + intensity * 0.65;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* City markers — cities tab only */}
            {tab === "cities" &&
              cityMarkers
                .filter((m) => m.coords !== null)
                .map((m) => (
                  <Marker key={m.name} coordinates={m.coords as Coordinates}>
                    {/* Pulsing ring via CSS animation */}
                    <circle
                      r={11}
                      fill={accentColor}
                      className="rsm-city-pulse"
                      style={{ animationDelay: `${m.rank * 0.35}s` }}
                    />
                    {/* Solid dot */}
                    <circle
                      r={11}
                      fill={accentColor}
                      stroke="rgba(0, 0, 0, 0.25)"
                      strokeWidth={2}
                    />
                    {/* Rank number */}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="#ffffff"
                      style={{
                        fontSize: "8px",
                        fontWeight: 900,
                        fontFamily: "sans-serif",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {m.rank}
                    </text>
                  </Marker>
                ))}
          </ComposableMap>
        </div>

        {/* Legend panel */}
        <div
          className="md:w-[38%] shrink-0 flex flex-col px-6 py-5 md:border-l border-t md:border-t-0"
          style={{ borderColor: "rgba(0,0,0,0.1)" }}
        >
          {/* Items — spread to fill full height */}
          <div className="flex flex-col flex-1 justify-between gap-6">
            {tab === "cities"
              ? cityMarkers.map((m) => (
                  <div key={m.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                          style={{ backgroundColor: accentColor }}
                        >
                          {m.rank}
                        </span>
                        <span className="text-[13px] font-medium text-gray-600 truncate">
                          {m.name}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900 ml-2 shrink-0">
                        {m.pct}%
                      </span>
                    </div>
                    <div
                      className="md:h-6 h-2 rounded-lg overflow-hidden"
                      style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                    >
                      <div
                        className="h-full rounded-lg"
                        style={{
                          width: `${m.pct}%`,
                          backgroundColor: accentColor,
                        }}
                      />
                    </div>
                  </div>
                ))
              : countryItems.map((c) => (
                  <div key={c.code}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0 leading-none">
                          {c.flag}
                        </span>
                        <span className="text-[13px] font-medium text-gray-600 truncate">
                          {c.name}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900 ml-2 shrink-0">
                        {c.pct}%
                      </span>
                    </div>
                    <div
                      className="md:h-6 h-2 rounded-lg overflow-hidden"
                      style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                    >
                      <div
                        className="h-full rounded-lg"
                        style={{
                          width: `${c.pct}%`,
                          backgroundColor: accentColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
          </div>

          {/* Footer */}
          {/* <p
            className="text-[10px] font-semibold tracking-widest uppercase mt-4 shrink-0"
            style={{ color: "rgba(0,0,0,0.35)" }}
          >
            Instagram · Last 30 days
          </p> */}
        </div>
      </div>
    </div>
  );
}

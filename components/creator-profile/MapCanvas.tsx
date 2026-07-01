"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";
import type { Coordinates } from "@vnedyalk0v/react19-simple-maps";

type CityMarker = {
  rank: number;
  name: string;
  count: number;
  pct: number;
  coords: [number, number] | null;
};

export function MapCanvas({
  geoData,
  tab,
  projection,
  cityMarkers,
  countryIntensity,
  baseColor,
  accentColor,
}: {
  geoData: object | null;
  tab: "cities" | "countries";
  projection: { scale: number; center: [number, number] };
  cityMarkers: CityMarker[];
  countryIntensity: Map<string, number>;
  baseColor: string;
  accentColor: string;
}) {
  return (
    <>
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

        {tab === "cities" &&
          cityMarkers
            .filter((m) => m.coords !== null)
            .map((m) => (
              <Marker key={m.name} coordinates={m.coords as Coordinates}>
                <circle
                  r={11}
                  fill={accentColor}
                  className="rsm-city-pulse"
                  style={{ animationDelay: `${m.rank * 0.35}s` }}
                />
                <circle
                  r={11}
                  fill={accentColor}
                  stroke="rgba(0, 0, 0, 0.25)"
                  strokeWidth={2}
                />
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
    </>
  );
}

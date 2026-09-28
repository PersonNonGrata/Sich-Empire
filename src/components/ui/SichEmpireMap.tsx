import { useEffect, useMemo, useState } from 'react';

type Variant = 'prologue' | 'state';

type GeoFeature = {
  type: 'Feature';
  properties?: { NAME?: string; [key: string]: unknown };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
};

type GeoJSONCollection = {
  type: 'FeatureCollection';
  features: GeoFeature[];
};

const WORLD_1700_URL =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/da7a4b735ecef70aebdc9c73e409d8a2500d50f3/geojson/world_1700.geojson';

const TARGET_NAMES = new Set([
  'Polish–Lithuanian Commonwealth',
  'Polish-Lithuanian Commonwealth',
  'Tsardom of Muscovy',
]);

const CITIES = [
  { name: 'Львів', lon: 24.03, lat: 49.84, dx: -8, dy: -9, anchor: 'end' as const },
  { name: 'Вільно', lon: 25.28, lat: 54.69, dx: 8, dy: -9, anchor: 'start' as const },
  { name: 'КИЇВ', lon: 30.52, lat: 50.45, dx: 9, dy: -2, anchor: 'start' as const, capital: true },
  { name: 'МОСКВА', lon: 37.62, lat: 55.76, dx: 9, dy: -5, anchor: 'start' as const },
  { name: 'КАЗАНЬ', lon: 49.12, lat: 55.79, dx: 8, dy: -5, anchor: 'start' as const },
  { name: 'АРХАНГЕЛЬСЬК', lon: 40.52, lat: 64.54, dx: 8, dy: -5, anchor: 'start' as const },
  { name: 'ТОБОЛЬСЬК', lon: 68.25, lat: 58.20, dx: 8, dy: -5, anchor: 'start' as const },
];

function collectPoints(coordinates: unknown, out: number[][] = []) {
  if (!Array.isArray(coordinates)) return out;
  if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    out.push([coordinates[0] as number, coordinates[1] as number]);
    return out;
  }
  for (const child of coordinates) collectPoints(child, out);
  return out;
}

function project(lon: number, lat: number, bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }) {
  const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 1000;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 520;
  return [x, y] as const;
}

function ringToPath(ring: number[][], bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }) {
  return ring.map(([lon, lat], index) => {
    const [x, y] = project(lon, lat, bounds);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

function geometryToPaths(
  geometry: GeoFeature['geometry'],
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }
) {
  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][]).map((ring) => ringToPath(ring, bounds));
  }
  return (geometry.coordinates as number[][][][]).flatMap((polygon) =>
    polygon.map((ring) => ringToPath(ring, bounds))
  );
}

export function SichEmpireMap({ variant = 'prologue' }: { variant?: Variant }) {
  const compact = variant === 'prologue';
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(WORLD_1700_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Map request failed: ${response.status}`);
        return response.json() as Promise<GeoJSONCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        const selected = data.features.filter((feature) =>
          TARGET_NAMES.has(feature.properties?.NAME ?? '')
        );
        if (!selected.length) throw new Error('Historical empire polygons not found');
        setFeatures(selected);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bounds = useMemo(() => {
    const points = features.flatMap((feature) => collectPoints(feature.geometry.coordinates));
    // Focus the view on Eastern Europe + the core Muscovite/Siberian extent.
    const minLon = 10;
    const maxLon = 90;
    const minLat = 43;
    const maxLat = 70;
    if (!points.length) return { minLon, maxLon, minLat, maxLat };
    return { minLon, maxLon, minLat, maxLat };
  }, [features]);

  const paths = useMemo(
    () => features.flatMap((feature) => geometryToPaths(feature.geometry, bounds)),
    [features, bounds]
  );

  return (
    <svg
      viewBox="0 0 1000 520"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Історично зорієнтована карта Імперії Січ"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="sichMapLand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8B76D" />
          <stop offset="0.55" stopColor="#B48B43" />
          <stop offset="1" stopColor="#806333" />
        </linearGradient>
        <radialGradient id="sichMapSea" cx="42%" cy="42%">
          <stop offset="0" stopColor="#1D3441" />
          <stop offset="1" stopColor="#08131B" />
        </radialGradient>
        <filter id="sichMapGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="1000" height="520" fill="url(#sichMapSea)" />

      {error ? (
        <g>
          <text x="500" y="245" textAnchor="middle" fill="#C9A96E" fontSize="18" fontFamily="Georgia, serif">
            Карту не вдалося завантажити
          </text>
          <text x="500" y="270" textAnchor="middle" fill="#8E93A0" fontSize="11" fontFamily="monospace">
            Потрібне з'єднання з історичним набором геоданих
          </text>
        </g>
      ) : paths.length ? (
        <g>
          {/* Real historical polygons from the 1700 historical-basemaps dataset.
              Adjacent/overlapping historical territories share one fill and no internal stroke,
              producing the alternate-history union used by the game. */}
          {paths.map((d, index) => (
            <path key={index} d={d} fill="url(#sichMapLand)" stroke="#D8AD58" strokeWidth="1.8" />
          ))}

          {/* Major rivers / orientation only. Political borders are deliberately omitted. */}
          <path
            d="M258 52 C255 105 270 143 263 185 C256 222 267 259 260 303 C254 342 269 375 286 405"
            fill="none" stroke="#6B9294" strokeWidth="2.4" opacity=".72"
          />

          {CITIES.map((city) => {
            const [x, y] = project(city.lon, city.lat, bounds);
            return (
              <g key={city.name}>
                <circle
                  cx={x}
                  cy={y}
                  r={city.capital ? 9 : 3.5}
                  fill="#11161A"
                  stroke="#E2BE65"
                  strokeWidth={city.capital ? 2.5 : 1.4}
                  filter={city.capital ? 'url(#sichMapGlow)' : undefined}
                />
                {city.capital && <path d={`M${x} ${y - 16} l-5 8 h10 Z`} fill="#E2BE65" />}
                {!compact || city.capital ? (
                  <text
                    x={x + city.dx}
                    y={y + city.dy}
                    textAnchor={city.anchor}
                    fill={city.capital ? '#FFF1C9' : '#E8E0CF'}
                    fontSize={city.capital ? 15 : 9}
                    fontFamily="Georgia, serif"
                    fontWeight={city.capital ? 700 : 500}
                  >
                    {city.name}
                  </text>
                ) : null}
              </g>
            );
          })}

          <text x="500" y="330" textAnchor="middle" fill="#2A2116"
            fontSize={compact ? 25 : 30} fontFamily="Georgia, serif"
            fontWeight="700" letterSpacing="4">
            ІМПЕРІЯ СІЧ
          </text>
        </g>
      ) : (
        <g>
          <text x="500" y="250" textAnchor="middle" fill="#C9A96E" fontSize="12" fontFamily="monospace" letterSpacing="2">
            ЗАВАНТАЖЕННЯ ІСТОРИЧНОЇ КАРТИ…
          </text>
        </g>
      )}

      <text x="42" y="35" fill="#C9A96E" fontSize="10" fontFamily="monospace" letterSpacing="2">
        ІСТОРИЧНА ОСНОВА · 1700
      </text>
      <text x="48" y="486" fill="#78909A" fontSize="11" fontFamily="Georgia, serif">ЧОРНЕ МОРЕ</text>
      <text x="800" y="65" fill="#78909A" fontSize="10" fontFamily="Georgia, serif">СХІД</text>

      <g transform="translate(70 405)">
        <circle r="24" fill="none" stroke="#B89A5B" strokeWidth="1" />
        <path d="M0 -18 L5 0 L0 18 L-5 0Z" fill="#B89A5B" />
        <text x="-3" y="-28" fill="#C9A96E" fontSize="8">N</text>
      </g>
    </svg>
  );
}

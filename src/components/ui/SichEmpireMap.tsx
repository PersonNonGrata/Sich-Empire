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

const COUNTRY_LABELS = [
  { name: 'ФРАНЦІЯ', lon: 2.3, lat: 46.2, size: 10 },
  { name: 'ІСПАНІЯ', lon: -3.5, lat: 40.2, size: 9 },
  { name: 'АНГЛІЯ', lon: -1.5, lat: 52.0, size: 8 },
  { name: 'СВЯЩЕННА РИМСЬКА ІМПЕРІЯ', lon: 10.5, lat: 50.2, size: 7 },
  { name: 'АВСТРІЯ', lon: 15.4, lat: 48.4, size: 8 },
  { name: 'ОСМАНСЬКА ІМПЕРІЯ', lon: 27.2, lat: 41.3, size: 7 },
  { name: 'ШВЕЦІЯ', lon: 16.0, lat: 61.2, size: 8 },
  { name: 'МОСКОВІЯ', lon: 39.0, lat: 58.8, size: 8 },
];

const CITIES = [
  { name: 'ЛЬВІВ', lon: 24.03, lat: 49.84, dx: -9, dy: -9, anchor: 'end' as const },
  { name: 'ВІЛЬНО', lon: 25.28, lat: 54.69, dx: 8, dy: -9, anchor: 'start' as const },
  { name: 'КИЇВ', lon: 30.52, lat: 50.45, dx: 10, dy: -4, anchor: 'start' as const, capital: true },
  { name: 'ВАРШАВА', lon: 21.01, lat: 52.23, dx: 8, dy: 12, anchor: 'start' as const },
  { name: 'МОСКВА', lon: 37.62, lat: 55.76, dx: 8, dy: -7, anchor: 'start' as const },
  { name: 'ВІДЕНЬ', lon: 16.37, lat: 48.21, dx: -8, dy: -8, anchor: 'end' as const },
  { name: 'БЕРЛІН', lon: 13.40, lat: 52.52, dx: -8, dy: -8, anchor: 'end' as const },
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
  const [contextFeatures, setContextFeatures] = useState<GeoFeature[]>([]);
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
        const contextNames = new Set([
          'Sweden', 'Prussia', 'Austrian Empire', 'Holy Roman Empire',
          'Ottoman Empire', 'Denmark-Norway', 'France', 'Spain', 'Portugal',
          'England', 'Scotland', 'Dutch Republic', 'Venice', 'Papal States',
          'Kingdom of Hungary', 'Transylvania', 'Crimean Khanate', 'Moldavia',
          'Wallachia', 'Brandenburg'
        ]);
        setContextFeatures(data.features.filter((feature) => contextNames.has(feature.properties?.NAME ?? '')));
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
    // Europe-first framing. The eastern edge stops around Moscow/European Russia;
    // Siberia and the distant Asian extent are intentionally outside the composition.
    const minLon = -12;
    const maxLon = 62;
    const minLat = 35;
    const maxLat = 71;
    if (!points.length) return { minLon, maxLon, minLat, maxLat };
    return { minLon, maxLon, minLat, maxLat };
  }, [features]);

  const paths = useMemo(
    () => features.flatMap((feature) => geometryToPaths(feature.geometry, bounds)),
    [features, bounds]
  );

  const contextPaths = useMemo(
    () => contextFeatures.flatMap((feature) => geometryToPaths(feature.geometry, bounds)),
    [contextFeatures, bounds]
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
              The viewport is deliberately European; the alternate-history union is clipped by the map frame. */}
          {contextPaths.map((d, index) => (
            <path key={`context-${index}`} d={d} fill="#26333A" stroke="#56636A" strokeWidth="1" opacity=".72" />
          ))}
          {paths.map((d, index) => (
            <path key={index} d={d} fill="url(#sichMapLand)" stroke="#E7C77A" strokeWidth="1.25" />
          ))}

          {/* Political labels keep the map readable as an atlas rather than a technical GIS layer. */}
          {COUNTRY_LABELS.map((label) => {
            const [x, y] = project(label.lon, label.lat, bounds);
            return (
              <text
                key={label.name}
                x={x}
                y={y}
                textAnchor="middle"
                fill="#AAB0AE"
                opacity=".82"
                fontSize={label.size}
                fontFamily="Georgia, serif"
                letterSpacing="1.5"
              >
                {label.name}
              </text>
            );
          })}

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
                {!compact || ['ЛЬВІВ', 'ВІЛЬНО', 'КИЇВ', 'ВАРШАВА', 'МОСКВА'].includes(city.name) ? (
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
            fontSize={compact ? 21 : 30} fontFamily="Georgia, serif"
            fontWeight="700" letterSpacing="3">
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

      <text x="48" y="486" fill="#78909A" fontSize="11" fontFamily="Georgia, serif">ЧОРНЕ МОРЕ</text>
      <text x="815" y="430" fill="#71818A" fontSize="10" fontFamily="Georgia, serif">КАСПІЙСЬКЕ МОРЕ</text>

      <g transform="translate(70 405)" opacity=".82">
        <circle r="24" fill="none" stroke="#B89A5B" strokeWidth="1" />
        <path d="M0 -18 L5 0 L0 18 L-5 0Z" fill="#B89A5B" />
        <text x="-3" y="-28" fill="#C9A96E" fontSize="8">N</text>
      </g>
    </svg>
  );
}

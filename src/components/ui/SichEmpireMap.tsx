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
const UKRAINE_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/ukraine.geojson';

const TARGET_NAMES = new Set([
  'Polish–Lithuanian Commonwealth',
  'Polish-Lithuanian Commonwealth',
  'Tsardom of Muscovy',
]);

const COUNTRY_LABELS = [
  { name: 'ПОРТУГАЛІЯ', lon: -7.7, lat: 39.6, size: 7 },
  { name: 'ІСПАНІЯ', lon: -3.2, lat: 40.2, size: 8 },
  { name: 'АНГЛІЯ', lon: -0.7, lat: 52.7, size: 8, power: 'england' as const },
  { name: 'ФРАНЦІЯ', lon: 2.2, lat: 46.4, size: 9, power: 'france' as const },
  { name: 'НІДЕРЛАНДИ', lon: 5.3, lat: 52.2, size: 6 },
  { name: 'БЕЛЬГІЯ', lon: 4.5, lat: 50.8, size: 6 },
  { name: 'ШВЕЦІЯ', lon: 16.0, lat: 61.0, size: 8, power: 'sweden' as const },
  { name: 'ДАНІЯ', lon: 10.0, lat: 56.2, size: 6 },
  { name: 'ПРУССІЯ', lon: 19.2, lat: 53.2, size: 7, power: 'germany' as const },
  { name: 'НІМЕЧЧИНА', lon: 10.5, lat: 50.5, size: 9, power: 'germany' as const },
  { name: 'АВСТРІЯ', lon: 14.4, lat: 47.6, size: 8, power: 'austria' as const },
  { name: 'ШВЕЙЦАРІЯ', lon: 8.2, lat: 46.8, size: 6 },
  { name: 'БАВАРІЯ', lon: 11.4, lat: 48.9, size: 6 },
  { name: 'САКСОНІЯ', lon: 13.3, lat: 51.0, size: 6 },
  { name: 'ІТАЛІЯ', lon: 12.4, lat: 42.3, size: 9, power: 'italy' as const },
  { name: 'ОСМАНСЬКА ІМПЕРІЯ', lon: 27.0, lat: 40.8, size: 7, power: 'ottoman' as const },
  { name: 'ГРЕЦІЯ', lon: 22.4, lat: 39.2, size: 6 },
  { name: 'СЕРБІЯ', lon: 20.7, lat: 44.0, size: 6 },
  { name: 'МОЛДАВІЯ', lon: 27.7, lat: 47.0, size: 5 },
  { name: 'ВАЛАХІЯ', lon: 25.2, lat: 44.7, size: 5 },
];

const POWER_COLORS = {
  sich: '#C9A55B',
  ottoman: '#765039',
  austria: '#D9D6CA',
  germany: '#304A63',
  sweden: '#5D9BB2',
  france: '#5A7185',
  england: '#7A5360',
  italy: '#76664D',
} as const;

type PowerKey = keyof typeof POWER_COLORS;

const POWER_LEGEND: { name: string; power: PowerKey }[] = [
  { name: 'ІМПЕРІЯ СІЧ', power: 'sich' },
  { name: 'ОСМАНИ', power: 'ottoman' },
  { name: 'АВСТРІЯ', power: 'austria' },
  { name: 'НІМЕЧЧИНА', power: 'germany' },
  { name: 'ШВЕЦІЯ', power: 'sweden' },
  { name: 'ФРАНЦІЯ', power: 'france' },
  { name: 'АНГЛІЯ', power: 'england' },
  { name: 'ІТАЛІЯ', power: 'italy' },
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
  const mapId = compact ? 'prologue' : 'state';
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [contextFeatures, setContextFeatures] = useState<GeoFeature[]>([]);
  const [ukraineFeature, setUkraineFeature] = useState<GeoFeature | null>(null);
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
          'England', 'Scotland', 'Ireland', 'Dutch Republic', 'Venice', 'Papal States',
          'Kingdom of Hungary', 'Transylvania', 'Moldavia', 'Wallachia', 'Brandenburg',
          'Bavaria', 'Saxony', 'Hanover', 'Switzerland', 'Sardinia-Piedmont',
          'Kingdom of Naples', 'Tuscany', 'Piedmont', 'Two Sicilies', 'Greece'
        ]);
        setContextFeatures(data.features.filter((feature) => contextNames.has(feature.properties?.NAME ?? '')));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    fetch(UKRAINE_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Ukraine geometry request failed: ${response.status}`);
        return response.json() as Promise<GeoFeature>;
      })
      .then((feature) => {
        if (!cancelled) setUkraineFeature(feature);
      })
      .catch(() => {
        if (!cancelled) setUkraineFeature(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bounds = useMemo(() => ({
    // Europe-first framing. Siberia and the distant Asian extent stay outside the composition.
    minLon: -12,
    maxLon: 62,
    minLat: 35,
    maxLat: 71,
  }), []);

  const paths = useMemo(
    () => features.flatMap((feature) => geometryToPaths(feature.geometry, bounds)),
    [features, bounds]
  );

  const contextPaths = useMemo(
    () => contextFeatures.map((feature) => ({
      name: feature.properties?.NAME ?? '',
      paths: geometryToPaths(feature.geometry, bounds),
    })),
    [contextFeatures, bounds]
  );

  const ukrainePaths = useMemo(
    () => ukraineFeature ? geometryToPaths(ukraineFeature.geometry, bounds) : [],
    [ukraineFeature, bounds]
  );

  // The Sich is rendered as one visual political silhouette. Historical polygons and
  // modern Ukraine are united through a single luminance mask, so internal source
  // boundaries can never become visible seams.
  const sichPaths = useMemo(
    () => [...paths, ...ukrainePaths],
    [paths, ukrainePaths]
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
        <linearGradient id={`sichMapLand-${mapId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8B76D" />
          <stop offset="0.55" stopColor="#B48B43" />
          <stop offset="1" stopColor="#806333" />
        </linearGradient>

        <radialGradient id={`sichMapSea-${mapId}`} cx="42%" cy="42%">
          <stop offset="0" stopColor="#1D3441" />
          <stop offset="1" stopColor="#08131B" />
        </radialGradient>

        <filter id={`sichMapGlow-${mapId}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`sichMapSoftBorder-${mapId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.15" />
        </filter>

        <filter id={`sichMapOuterBorder-${mapId}`} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="dilated" />
          <feGaussianBlur in="dilated" stdDeviation="1.4" result="soft" />
          <feFlood floodColor="#E6C477" floodOpacity=".42" result="haloColor" />
          <feComposite in="haloColor" in2="soft" operator="in" result="halo" />
          <feFlood floodColor="#F2D48F" floodOpacity=".78" result="coreColor" />
          <feComposite in="coreColor" in2="dilated" operator="in" result="core" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="core" />
          </feMerge>
        </filter>

        <mask
          id={`sichMapMask-${mapId}`}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1000"
          height="520"
        >
          <rect x="0" y="0" width="1000" height="520" fill="black" />
          {sichPaths.map((d, index) => (
            <path key={`mask-${index}`} d={d} fill="white" fillRule="evenodd" />
          ))}
        </mask>
      </defs>

      <rect width="1000" height="520" fill={`url(#sichMapSea-${mapId})`} />

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
          {contextPaths.flatMap(({ name, paths: featurePaths }) => featurePaths.map((d, index) => {
            const power: PowerKey | null =
              name === 'Ottoman Empire' ? 'ottoman' :
              name === 'Austrian Empire' ? 'austria' :
              name === 'Prussia' || name === 'Holy Roman Empire' || name === 'Brandenburg' ||
              name === 'Bavaria' || name === 'Saxony' || name === 'Hanover' ? 'germany' :
              name === 'Sweden' ? 'sweden' :
              name === 'France' ? 'france' :
              name === 'England' ? 'england' :
              name === 'Venice' || name === 'Papal States' || name === 'Sardinia-Piedmont' ||
              name === 'Kingdom of Naples' || name === 'Tuscany' || name === 'Piedmont' ||
              name === 'Two Sicilies' ? 'italy' : null;
            const fill = power ? POWER_COLORS[power] : '#273640';
            const stroke = power === 'austria' ? '#FFFFFF' : '#71818A';

            return (
              <g key={`context-${name}-${index}`}>
                <path d={d} fill={fill} opacity={name === 'Austrian Empire' ? '.94' : '.9'} />
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="2.8"
                  strokeOpacity=".24"
                  filter={`url(#sichMapSoftBorder-${mapId})`}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={name === 'Austrian Empire' ? 0.85 : 0.7}
                  strokeOpacity={name === 'Austrian Empire' ? '.62' : '.46'}
                />
              </g>
            );
          }))}

          {/* One canonical silhouette for the Sich Empire.
              The historical Commonwealth + Muscovy polygons and the whole of modern
              Ukraine, including Crimea, are merged visually through one luminance mask.
              No individual Sich polygon receives a stroke, so there are no internal seams. */}
          <g filter={`url(#sichMapOuterBorder-${mapId})`}>
            <rect
              x="0"
              y="0"
              width="1000"
              height="520"
              fill="#E7C878"
              opacity=".96"
              mask={`url(#sichMapMask-${mapId})`}
            />
          </g>

          <rect
            x="0"
            y="0"
            width="1000"
            height="520"
            fill={`url(#sichMapLand-${mapId})`}
            mask={`url(#sichMapMask-${mapId})`}
          />

          {/* Political labels keep the map readable as an atlas rather than a technical GIS layer. */}
          {POWER_LEGEND.map((item, index) => (
            <g key={item.power} transform={'translate(' + (705 + (index % 2) * 118) + ' ' + (72 + Math.floor(index / 2) * 14) + ')'}>
              <rect width="8" height="8" rx="1" fill={POWER_COLORS[item.power]} />
              <text x="13" y="8" fill="#D9D6CA" fontSize="7.5" fontFamily="Georgia, serif" letterSpacing=".7">
                {item.name}
              </text>
            </g>
          ))}

          {COUNTRY_LABELS.map((label) => {
            const [x, y] = project(label.lon, label.lat, bounds);
            return (
              <text
                key={label.name}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={label.power ? POWER_COLORS[label.power] : "#D0D4D0"}
                opacity=".94"
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
                  filter={city.capital ? `url(#sichMapGlow-${mapId})` : undefined}
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

          {(() => {
            const [lx, ly] = project(31.5, 53.5, bounds);
            return (
              <g transform={`translate(${lx} ${ly})`}>
                <rect x="-82" y="-18" width="164" height="32" rx="3"
                  fill="#8B672F" opacity=".58" stroke="#F0D18A" strokeWidth=".7" />
                <text x="0" y="4" textAnchor="middle" fill="#FFF1C9"
                  fontSize={compact ? 15 : 24} fontFamily="Georgia, serif"
                  fontWeight="700" letterSpacing="2">
                  ІМПЕРІЯ СІЧ
                </text>
              </g>
            );
          })()}
        </g>
      ) : (
        <g>
          <text x="500" y="250" textAnchor="middle" fill="#C9A96E" fontSize="12" fontFamily="monospace" letterSpacing="2">
            ЗАВАНТАЖЕННЯ ІСТОРИЧНОЇ КАРТИ…
          </text>
        </g>
      )}

      <text x="52" y="96" fill="#71818A" fontSize="9" fontFamily="Georgia, serif" letterSpacing="1.5">ПІВНІЧНЕ МОРЕ</text>
      <text x="52" y="486" fill="#8A9AA0" fontSize="11" fontFamily="Georgia, serif" letterSpacing="1">ЧОРНЕ МОРЕ</text>
      <text x="745" y="450" fill="#71818A" fontSize="9" fontFamily="Georgia, serif" letterSpacing="1">КАСПІЙСЬКЕ МОРЕ</text>
      <text x="470" y="500" fill="#71818A" fontSize="9" fontFamily="Georgia, serif" letterSpacing="2">СЕРЕДЗЕМНЕ МОРЕ</text>

      <g transform="translate(70 405)" opacity=".82">
        <circle r="24" fill="none" stroke="#B89A5B" strokeWidth="1" />
        <path d="M0 -18 L5 0 L0 18 L-5 0Z" fill="#B89A5B" />
        <text x="-3" y="-28" fill="#C9A96E" fontSize="8">N</text>
      </g>
    </svg>
  );
}

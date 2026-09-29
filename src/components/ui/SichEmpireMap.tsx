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

const WORLD_1848_BASE_URL =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1815.geojson';
const SICH_CANON_URL =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/da7a4b735ecef70aebdc9c73e409d8a2500d50f3/geojson/world_1700.geojson';
const UKRAINE_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/ukraine.geojson';
const BRITAIN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/united kingdom.geojson';
const ITALY_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/italy.geojson';
const SWEDEN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/sweden.geojson';
const NORWAY_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/norway.geojson';
const DENMARK_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/denmark.geojson';
const FINLAND_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/finland.geojson';
const ESTONIA_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/estonia.geojson';
const LATVIA_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/latvia.geojson';
const LITHUANIA_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/lithuania.geojson';
const KAZAKHSTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/kazakhstan.geojson';
const GEORGIA_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/georgia.geojson';
const ARMENIA_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/armenia.geojson';
const AZERBAIJAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/azerbaijan.geojson';
const IRAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/iran.geojson';
const AFGHANISTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/afghanistan.geojson';
const UZBEKISTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/uzbekistan.geojson';
const TURKMENISTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/turkmenistan.geojson';
const TAJIKISTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/tajikistan.geojson';
const KYRGYZSTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/kyrgyzstan.geojson';
const PAKISTAN_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/pakistan.geojson';
const CHINA_URL =
  'https://raw.githubusercontent.com/glynnbird/countriesgeojson/master/china.geojson';
const KRASNODAR_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Krasnodarskiy-kray.geojson';
const ADYGEYA_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Adygeya.geojson';
const NORTH_OSSETIA_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Severnaya-Osetiya-Alaniya.geojson';
const KABARDINO_BALKARIA_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Kabardino-Balkarskaya.geojson';
const KARACHAY_CHERKESSIA_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Karachayevo-Cherkesskaya.geojson';
const INGUSHETIA_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Ingushskaya.geojson';
const CHECHNYA_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Chechenskaya.geojson';
const DAGESTAN_URL =
  'https://raw.githubusercontent.com/simp37/Russia_geoJSON/master/Dagestan.geojson';

const TARGET_NAMES = new Set([
  'Polish–Lithuanian Commonwealth',
  'Polish-Lithuanian Commonwealth',
  'Tsardom of Muscovy',
]);

const COUNTRY_LABELS = [
  { name: 'ІМПЕРІЯ СІЧ', lon: 31.5, lat: 53.5, size: 24, power: 'sich' as const, weight: 700 },
  { name: 'ОСМАНСЬКА ІМПЕРІЯ', lon: 27.0, lat: 40.8, size: 11, power: 'ottoman' as const, weight: 700 },
  { name: 'АВСТРІЯ', lon: 14.4, lat: 47.6, size: 12, power: 'austria' as const, weight: 700 },
  { name: 'НІМЕЦЬКИЙ СОЮЗ', lon: 10.5, lat: 50.5, size: 12, power: 'germany' as const, weight: 700 },
  { name: 'ШВЕЦІЯ-НОРВЕГІЯ', lon: 16.5, lat: 62.2, size: 10, power: 'sweden' as const, weight: 700 },
  { name: 'ФРАНЦІЯ', lon: 2.2, lat: 46.4, size: 12, power: 'france' as const, weight: 700 },
  { name: 'ВЕЛИКА БРИТАНІЯ', lon: -0.7, lat: 52.7, size: 10, power: 'england' as const, weight: 700 },
  { name: 'ІТАЛІЙСЬКІ ДЕРЖАВИ', lon: 12.4, lat: 42.3, size: 10, power: 'italy' as const, weight: 700 },
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
type LabelPowerKey = PowerKey | 'iran';

const LABEL_COLORS: Record<LabelPowerKey, string> = {
  sich: '#241A0C',
  ottoman: '#F4E8D4',
  austria: '#24262A',
  germany: '#F4E7CB',
  sweden: '#10252D',
  france: '#F5EDE2',
  england: '#F6E7E7',
  italy: '#F4E9D5',
  iran: '#E8DCC4',
};

const LABEL_STROKES: Record<LabelPowerKey, string> = {
  sich: '#E8D19A',
  ottoman: '#241A18',
  austria: '#F0E9D8',
  germany: '#1A2025',
  sweden: '#D6E8E8',
  france: '#29333B',
  england: '#2B2024',
  italy: '#2C2720',
  iran: '#27231D',
};

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
  const [britainFeature, setBritainFeature] = useState<GeoFeature | null>(null);
  const [italyFeature, setItalyFeature] = useState<GeoFeature | null>(null);
  const [swedenFeature, setSwedenFeature] = useState<GeoFeature | null>(null);
  const [norwayFeature, setNorwayFeature] = useState<GeoFeature | null>(null);
  const [denmarkFeature, setDenmarkFeature] = useState<GeoFeature | null>(null);
  const [finlandFeature, setFinlandFeature] = useState<GeoFeature | null>(null);
  const [estoniaFeature, setEstoniaFeature] = useState<GeoFeature | null>(null);
  const [latviaFeature, setLatviaFeature] = useState<GeoFeature | null>(null);
  const [lithuaniaFeature, setLithuaniaFeature] = useState<GeoFeature | null>(null);
  const [kazakhstanFeature, setKazakhstanFeature] = useState<GeoFeature | null>(null);
  const [georgiaFeature, setGeorgiaFeature] = useState<GeoFeature | null>(null);
  const [armeniaFeature, setArmeniaFeature] = useState<GeoFeature | null>(null);
  const [azerbaijanFeature, setAzerbaijanFeature] = useState<GeoFeature | null>(null);
  const [iranFeature, setIranFeature] = useState<GeoFeature | null>(null);
  const [afghanistanFeature, setAfghanistanFeature] = useState<GeoFeature | null>(null);
  const [uzbekistanFeature, setUzbekistanFeature] = useState<GeoFeature | null>(null);
  const [turkmenistanFeature, setTurkmenistanFeature] = useState<GeoFeature | null>(null);
  const [tajikistanFeature, setTajikistanFeature] = useState<GeoFeature | null>(null);
  const [kyrgyzstanFeature, setKyrgyzstanFeature] = useState<GeoFeature | null>(null);
  const [pakistanFeature, setPakistanFeature] = useState<GeoFeature | null>(null);
  const [chinaFeature, setChinaFeature] = useState<GeoFeature | null>(null);
  const [krasnodarFeature, setKrasnodarFeature] = useState<GeoFeature | null>(null);
  const [adygeyaFeature, setAdygeyaFeature] = useState<GeoFeature | null>(null);
  const [northOssetiaFeature, setNorthOssetiaFeature] = useState<GeoFeature | null>(null);
  const [kabardinoBalkariaFeature, setKabardinoBalkariaFeature] = useState<GeoFeature | null>(null);
  const [karachayCherkessiaFeature, setKarachayCherkessiaFeature] = useState<GeoFeature | null>(null);
  const [ingushetiaFeature, setIngushetiaFeature] = useState<GeoFeature | null>(null);
  const [chechnyaFeature, setChechnyaFeature] = useState<GeoFeature | null>(null);
  const [dagestanFeature, setDagestanFeature] = useState<GeoFeature | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(WORLD_1848_BASE_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Map request failed: ${response.status}`);
        return response.json() as Promise<GeoJSONCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        // Keep every named historical polygon in the European frame so there are
        // no artificial gaps between countries. The Sich mask later replaces its
        // alternate-history territory on top of this base.
        const quietMapExclusions = new Set([
          'Iceland', 'Ireland', 'Faroe Islands', 'Shetland Islands',
          'Orkney Islands', 'Svalbard', 'Greenland',
          'Novaya Zemlya', 'Franz Josef Land', 'Severny Island',
          'Yuzhny Island', 'Vaygach Island', 'Kolguyev Island',
          'Wrangel Island',
          'China', 'Qing China', 'Persia', 'Persian Empire',
          'Afghanistan', 'Bukhara', 'Khiva', 'Kokand',
          'Georgia', 'Armenia', 'Azerbaijan'
        ]);
        setContextFeatures(
          data.features.filter((feature) => {
            const name = feature.properties?.NAME ?? '';
            const normalized = name.toLowerCase();
            const isIslandNoise =
              normalized.includes('island') ||
              normalized.includes('islands') ||
              normalized.includes('archipelago') ||
              normalized.includes('insel');
            return Boolean(name) && !quietMapExclusions.has(name) && !isIslandNoise;
          })
        );
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    fetch(SICH_CANON_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Sich canon request failed: ${response.status}`);
        return response.json() as Promise<GeoJSONCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        const selected = data.features.filter((feature) => TARGET_NAMES.has(feature.properties?.NAME ?? ''));
        if (!selected.length) throw new Error('Historical Sich canon polygons not found');
        setFeatures(selected);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    fetch(BRITAIN_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Britain geometry request failed: ${response.status}`);
        return response.json() as Promise<GeoFeature>;
      })
      .then((feature) => {
        if (!cancelled) setBritainFeature(feature);
      })
      .catch(() => {
        if (!cancelled) setBritainFeature(null);
      });

    fetch(ITALY_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Italy geometry request failed: ${response.status}`);
        return response.json() as Promise<GeoFeature>;
      })
      .then((feature) => {
        if (!cancelled) setItalyFeature(feature);
      })
      .catch(() => {
        if (!cancelled) setItalyFeature(null);
      });

    fetch(SWEDEN_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Sweden geometry request failed: ${response.status}`);
        return response.json() as Promise<GeoFeature>;
      })
      .then((feature) => {
        if (!cancelled) setSwedenFeature(feature);
      })
      .catch(() => {
        if (!cancelled) setSwedenFeature(null);
      });

    fetch(NORWAY_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Norway geometry request failed: ${response.status}`);
        return response.json() as Promise<GeoFeature>;
      })
      .then((feature) => {
        if (!cancelled) setNorwayFeature(feature);
      })
      .catch(() => {
        if (!cancelled) setNorwayFeature(null);
      });

    fetch(DENMARK_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Denmark geometry request failed: ${response.status}`);
        return response.json() as Promise<GeoFeature>;
      })
      .then((feature) => {
        if (!cancelled) setDenmarkFeature(feature);
      })
      .catch(() => {
        if (!cancelled) setDenmarkFeature(null);
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

    const loadFeature = (url: string, setter: (feature: GeoFeature | null) => void) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`Geometry request failed: ${response.status}`);
          return response.json() as Promise<GeoFeature>;
        })
        .then((feature) => {
          if (!cancelled) setter(feature);
        })
        .catch(() => {
          if (!cancelled) setter(null);
        });
    };

    loadFeature(FINLAND_URL, setFinlandFeature);
    loadFeature(ESTONIA_URL, setEstoniaFeature);
    loadFeature(LATVIA_URL, setLatviaFeature);
    loadFeature(LITHUANIA_URL, setLithuaniaFeature);
    loadFeature(KAZAKHSTAN_URL, setKazakhstanFeature);
    loadFeature(GEORGIA_URL, setGeorgiaFeature);
    loadFeature(ARMENIA_URL, setArmeniaFeature);
    loadFeature(AZERBAIJAN_URL, setAzerbaijanFeature);
    loadFeature(IRAN_URL, setIranFeature);
    loadFeature(AFGHANISTAN_URL, setAfghanistanFeature);
    loadFeature(UZBEKISTAN_URL, setUzbekistanFeature);
    loadFeature(TURKMENISTAN_URL, setTurkmenistanFeature);
    loadFeature(TAJIKISTAN_URL, setTajikistanFeature);
    loadFeature(KYRGYZSTAN_URL, setKyrgyzstanFeature);
    loadFeature(PAKISTAN_URL, setPakistanFeature);
    loadFeature(CHINA_URL, setChinaFeature);
    loadFeature(KRASNODAR_URL, setKrasnodarFeature);
    loadFeature(ADYGEYA_URL, setAdygeyaFeature);
    loadFeature(NORTH_OSSETIA_URL, setNorthOssetiaFeature);
    loadFeature(KABARDINO_BALKARIA_URL, setKabardinoBalkariaFeature);
    loadFeature(KARACHAY_CHERKESSIA_URL, setKarachayCherkessiaFeature);
    loadFeature(INGUSHETIA_URL, setIngushetiaFeature);
    loadFeature(CHECHNYA_URL, setChechnyaFeature);
    loadFeature(DAGESTAN_URL, setDagestanFeature);

    return () => {
      cancelled = true;
    };
  }, []);

  const bounds = useMemo(() => ({
    // Europe-first framing for the current map pass.
    // Asia is intentionally deferred until the European composition is finished.
    minLon: -12,
    maxLon: 62,
    minLat: 35,
    maxLat: 72,
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

  const britainPaths = useMemo(
    () => britainFeature ? geometryToPaths(britainFeature.geometry, bounds) : [],
    [britainFeature, bounds]
  );

  const italyPaths = useMemo(
    () => italyFeature ? geometryToPaths(italyFeature.geometry, bounds) : [],
    [italyFeature, bounds]
  );
  const swedenPaths = useMemo(
    () => swedenFeature ? geometryToPaths(swedenFeature.geometry, bounds) : [],
    [swedenFeature, bounds]
  );
  const norwayPaths = useMemo(
    () => norwayFeature ? geometryToPaths(norwayFeature.geometry, bounds) : [],
    [norwayFeature, bounds]
  );
  const denmarkPaths = useMemo(
    () => denmarkFeature ? geometryToPaths(denmarkFeature.geometry, bounds) : [],
    [denmarkFeature, bounds]
  );
  const finlandPaths = useMemo(
    () => finlandFeature ? geometryToPaths(finlandFeature.geometry, bounds) : [],
    [finlandFeature, bounds]
  );
  const estoniaPaths = useMemo(
    () => estoniaFeature ? geometryToPaths(estoniaFeature.geometry, bounds) : [],
    [estoniaFeature, bounds]
  );
  const latviaPaths = useMemo(
    () => latviaFeature ? geometryToPaths(latviaFeature.geometry, bounds) : [],
    [latviaFeature, bounds]
  );
  const lithuaniaPaths = useMemo(
    () => lithuaniaFeature ? geometryToPaths(lithuaniaFeature.geometry, bounds) : [],
    [lithuaniaFeature, bounds]
  );
  const kazakhstanPaths = useMemo(
    () => kazakhstanFeature ? geometryToPaths(kazakhstanFeature.geometry, bounds) : [],
    [kazakhstanFeature, bounds]
  );

  const caucasusPaths = useMemo(
    () => [
      ...(georgiaFeature ? geometryToPaths(georgiaFeature.geometry, bounds) : []),
      ...(armeniaFeature ? geometryToPaths(armeniaFeature.geometry, bounds) : []),
      ...(azerbaijanFeature ? geometryToPaths(azerbaijanFeature.geometry, bounds) : []),
      ...(krasnodarFeature ? geometryToPaths(krasnodarFeature.geometry, bounds) : []),
      ...(adygeyaFeature ? geometryToPaths(adygeyaFeature.geometry, bounds) : []),
      ...(northOssetiaFeature ? geometryToPaths(northOssetiaFeature.geometry, bounds) : []),
      ...(kabardinoBalkariaFeature ? geometryToPaths(kabardinoBalkariaFeature.geometry, bounds) : []),
      ...(karachayCherkessiaFeature ? geometryToPaths(karachayCherkessiaFeature.geometry, bounds) : []),
      ...(ingushetiaFeature ? geometryToPaths(ingushetiaFeature.geometry, bounds) : []),
      ...(chechnyaFeature ? geometryToPaths(chechnyaFeature.geometry, bounds) : []),
      ...(dagestanFeature ? geometryToPaths(dagestanFeature.geometry, bounds) : []),
    ],
    [
      georgiaFeature, armeniaFeature, azerbaijanFeature,
      krasnodarFeature, adygeyaFeature, northOssetiaFeature,
      kabardinoBalkariaFeature, karachayCherkessiaFeature, ingushetiaFeature,
      chechnyaFeature, dagestanFeature, bounds
    ]
  );

  const iranPaths = useMemo(
    () => [
      ...(iranFeature ? geometryToPaths(iranFeature.geometry, bounds) : []),
      ...(afghanistanFeature ? geometryToPaths(afghanistanFeature.geometry, bounds) : []),
      ...(uzbekistanFeature ? geometryToPaths(uzbekistanFeature.geometry, bounds) : []),
      ...(turkmenistanFeature ? geometryToPaths(turkmenistanFeature.geometry, bounds) : []),
      ...(tajikistanFeature ? geometryToPaths(tajikistanFeature.geometry, bounds) : []),
      ...(kyrgyzstanFeature ? geometryToPaths(kyrgyzstanFeature.geometry, bounds) : []),
      ...(pakistanFeature ? geometryToPaths(pakistanFeature.geometry, bounds) : []),
    ],
    [
      iranFeature, afghanistanFeature, uzbekistanFeature, turkmenistanFeature,
      tajikistanFeature, kyrgyzstanFeature, pakistanFeature, bounds
    ]
  );

  const chinaPaths = useMemo(
    () => chinaFeature ? geometryToPaths(chinaFeature.geometry, bounds) : [],
    [chinaFeature, bounds]
  );

  // The Sich is rendered as one visual political silhouette. Historical polygons and
  // modern Ukraine are united through a single luminance mask, so internal source
  // boundaries can never become visible seams.
  const sichPaths = useMemo(
    () => [
      ...paths,
      ...ukrainePaths,
      ...finlandPaths,
      ...estoniaPaths,
      ...latviaPaths,
      ...lithuaniaPaths,
      ...kazakhstanPaths,
      ...caucasusPaths,
    ],
    [
      paths, ukrainePaths, finlandPaths, estoniaPaths,
      latviaPaths, lithuaniaPaths, kazakhstanPaths, caucasusPaths
    ]
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

        <radialGradient id={`sichMapSea-${mapId}`} cx="48%" cy="42%" r="72%">
          <stop offset="0" stopColor="#3A3E42" />
          <stop offset="0.42" stopColor="#292D31" />
          <stop offset="0.78" stopColor="#1B1F23" />
          <stop offset="1" stopColor="#0D1013" />
        </radialGradient>

        <linearGradient id={`sichMapWaterDepth-${mapId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#45494D" stopOpacity=".20" />
          <stop offset=".45" stopColor="#181C20" stopOpacity=".02" />
          <stop offset="1" stopColor="#050608" stopOpacity=".34" />
        </linearGradient>

        <radialGradient id={`sichMapWaterVignette-${mapId}`} cx="50%" cy="48%" r="72%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".035" />
          <stop offset=".58" stopColor="#000000" stopOpacity=".08" />
          <stop offset="1" stopColor="#000000" stopOpacity=".48" />
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
      <rect width="1000" height="520" fill={`url(#sichMapWaterDepth-${mapId})`} />
      <rect width="1000" height="520" fill={`url(#sichMapWaterVignette-${mapId})`} />

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
          {/* Historical European base: the nearest broad continental snapshot available
              in the source dataset to the game's 1848 start date. */}
          {contextPaths.flatMap(({ name, paths: featurePaths }) => featurePaths.map((d, index) => {
            const power: PowerKey | null =
              name === 'Ottoman Empire' ? 'ottoman' :
              name === 'Austrian Empire' ? 'austria' :
              name === 'Prussia' || name === 'German Confederation' || name === 'Brandenburg' ||
              name === 'Bavaria' || name === 'Saxony' || name === 'Hanover' ? 'germany' :
              name === 'Sweden' ? 'sweden' :
              name === 'France' ? 'france' :
              name === 'England' ? 'england' :
              name === 'Venice' || name === 'Papal States' || name === 'Sardinia-Piedmont' ||
              name === 'Kingdom of Naples' || name === 'Tuscany' || name === 'Piedmont' ||
              name === 'Two Sicilies' ? 'italy' : null;
            const fill = power ? POWER_COLORS[power] : '#273640';
            const stroke = power === 'austria' ? '#FFFFFF' : '#71818A';
            const germanStates = new Set([
              'Prussia', 'German Confederation', 'Brandenburg', 'Bavaria', 'Saxony',
              'Hanover', 'Hesse', 'Hesse-Kassel', 'Hesse-Darmstadt', 'Württemberg',
              'Baden', 'Mecklenburg-Schwerin', 'Mecklenburg-Strelitz', 'Oldenburg',
              'Brunswick', 'Nassau', 'Saxe-Weimar-Eisenach', 'Saxe-Coburg-Gotha',
              'Saxe-Meiningen', 'Saxe-Altenburg', 'Anhalt-Dessau', 'Anhalt-Bernburg',
              'Lippe', 'Schaumburg-Lippe', 'Waldeck-Pyrmont', 'Reuss', 'Schwarzburg-Rudolstadt',
              'Schwarzburg-Sondershausen', 'Free City of Frankfurt', 'Free City of Lübeck',
              'Free City of Bremen', 'Free City of Hamburg'
            ]);
            const isGermany = power === 'germany' || germanStates.has(name);

            return (
              <g key={`context-${name}-${index}`}>
                <path d={d} fill={fill} opacity={name === 'Austrian Empire' ? '.94' : '.9'} />
                {!isGermany && (
                  <>
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
                  </>
                )}
              </g>
            );
          }))}

          {/* Dedicated modern coastlines guarantee that Britain and Italy remain visibly present
              even when the historical base layer differs from the alternate canon. */}
          {britainPaths.map((d, index) => (
            <g key={`britain-${index}`}>
              <path d={d} fill={POWER_COLORS.england} fillOpacity=".9" />
              <path d={d} fill="none" stroke="#A98A8F" strokeWidth="1.2" strokeOpacity=".72" />
            </g>
          ))}
          {italyPaths.map((d, index) => (
            <g key={`italy-${index}`}>
              <path d={d} fill={POWER_COLORS.italy} fillOpacity=".9" />
              <path d={d} fill="none" stroke="#A89A7B" strokeWidth="1.2" strokeOpacity=".72" />
            </g>
          ))}

          {/* Scandinavia is rendered explicitly because the 1848 base dataset can
              omit or rename the Scandinavian polygons between historical snapshots. */}
          {[
            ...swedenPaths.map((d, index) => ({ d, key: `sweden-${index}` })),
            ...norwayPaths.map((d, index) => ({ d, key: `norway-${index}` })),
            ...denmarkPaths.map((d, index) => ({ d, key: `denmark-${index}` })),
            ...finlandPaths.map((d, index) => ({ d, key: `finland-${index}` })),
          ].map(({ d, key }) => (
            <g key={key}>
              <path d={d} fill={POWER_COLORS.sweden} fillOpacity=".88" />
              <path d={d} fill="none" stroke="#8FBBC8" strokeWidth="1.15" strokeOpacity=".7" />
            </g>
          ))}

          {/* Baltic lands, Finland, Kazakhstan, Kuban and the Caucasus are folded into the Sich canon. */}
          <g>
            {[
              ...estoniaPaths.map((d, index) => ({ d, key: `sich-estonia-${index}` })),
              ...latviaPaths.map((d, index) => ({ d, key: `sich-latvia-${index}` })),
              ...lithuaniaPaths.map((d, index) => ({ d, key: `sich-lithuania-${index}` })),
              ...kazakhstanPaths.map((d, index) => ({ d, key: `sich-kazakhstan-${index}` })),
              ...caucasusPaths.map((d, index) => ({ d, key: `sich-caucasus-${index}` })),
            ].map(({ d, key }) => <path key={key} d={d} fill={`url(#sichMapLand-${mapId})`} />)}
          </g>

          {/* Asia is intentionally deferred in Map 2.0 until the European composition is complete. */}
          {/* One canonical silhouette for the alternate 1848 Sich Empire.
              Its territorial canon is kept separate from the real-world 1848 base,
              so the surrounding European powers retain their historical geography.
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
          {[
            ...COUNTRY_LABELS,
          ].map((label) => {
            const [x, y] = project(label.lon, label.lat, bounds);
            return (
              <text
                key={label.name}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={label.power && label.power in LABEL_COLORS ? LABEL_COLORS[label.power as LabelPowerKey] : "#F0E8D8"}
                opacity=".98"
                fontSize={label.power === 'sich' ? label.size + 1 : label.size}
                fontFamily="Georgia, serif"
                fontWeight={label.weight}
                letterSpacing={label.power === 'sich' ? "2.2" : "1.5"}
                paintOrder="stroke"
                stroke={label.power && label.power in LABEL_STROKES ? LABEL_STROKES[label.power as LabelPowerKey] : "#15191D"}
                strokeWidth={label.power === 'sich' ? 2.8 : 2.1}
                strokeOpacity=".95"
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
        </g>
      ) : (
        <g>
          <text x="500" y="250" textAnchor="middle" fill="#C9A96E" fontSize="12" fontFamily="monospace" letterSpacing="2">
            ЗАВАНТАЖЕННЯ ІСТОРИЧНОЇ КАРТИ…
          </text>
        </g>
      )}

      {[
        { name: 'ПІВНІЧНЕ МОРЕ', lon: 4.0, lat: 57.0, size: 8.5 },
        { name: 'ЧОРНЕ МОРЕ', lon: 35.2, lat: 44.4, size: 9.5 },
        { name: 'КАСПІЙСЬКЕ МОРЕ', lon: 53.0, lat: 42.5, size: 8.5 },
        { name: 'СЕРЕДЗЕМНЕ МОРЕ', lon: 18.0, lat: 38.8, size: 8.5 },
      ].map((sea) => {
        const [x, y] = project(sea.lon, sea.lat, bounds);
        return (
          <text
            key={sea.name}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#7B8084"
            opacity=".72"
            fontSize={sea.size}
            fontFamily="Georgia, serif"
            letterSpacing="1.4"
            paintOrder="stroke"
            stroke="#111417"
            strokeWidth="2"
            strokeOpacity=".65"
          >
            {sea.name}
          </text>
        );
      })}

      <g transform="translate(70 405)" opacity=".82">
        <circle r="24" fill="none" stroke="#B89A5B" strokeWidth="1" />
        <path d="M0 -18 L5 0 L0 18 L-5 0Z" fill="#B89A5B" />
        <text x="-3" y="-28" fill="#C9A96E" fontSize="8">N</text>
      </g>
    </svg>
  );
}

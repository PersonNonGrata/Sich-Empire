import { Region, RegionInfrastructure, RegionEconomicPotential } from '../../types/index.ts';

export interface DetailedRegion extends Region {
  population: string;          // Formatted string or number e.g. "3.2M"
  wealth: number;              // 0 to 100
  security: number;            // 0 to 100
  cultureTags: string[];
  dominantFactions: string[];  // factionIds
  taxContribution: number;     // Projected annual tax yield in mln
  tradeContribution: number;   // Regional trade turnover index
  infrastructure: RegionInfrastructure;
  economicPotential: RegionEconomicPotential;
}

export const BASE_REGIONS: DetailedRegion[] = [
  {
    id: 'region_sich_core',
    name: 'Запоріжжя (Хортицьке Ядро)',
    population: '1.4M козаків та міщан',
    wealth: 65,
    stability: 85,
    loyalty: 85,
    prosperity: 60,
    security: 85,
    unrest: 10,
    tension: 10,
    autonomy: 40,
    garrisonStrength: 80,
    taxContribution: 16,
    tradeContribution: 60,
    cultureTags: ['козацька_воля', 'степ', 'зброярство', 'клейноди'],
    dominantFactions: ['faction_old_sich', 'faction_military_command'],
    infrastructure: {
      roads: 55,
      ports: 50,
      railways: 0,
      administration: 60,
    },
    economicPotential: {
      trade: 60,
      tax: 55,
      resources: 65,
      industry: 75,
    },
    description: 'Серце Січової держави, оплот військової слави, курені, ливарні арсенали та гетьманська резиденція на острові Хортиця.',
  },
  {
    id: 'region_podillia',
    name: 'Київ та Правобережжя',
    population: '4.8M міщан та селян',
    wealth: 75,
    stability: 65,
    loyalty: 65,
    prosperity: 70,
    security: 60,
    unrest: 20,
    tension: 20,
    autonomy: 50,
    garrisonStrength: 50,
    taxContribution: 26,
    tradeContribution: 75,
    cultureTags: ['давня_столиця', 'академії', 'чорноземи', 'магістрати'],
    dominantFactions: ['faction_communities', 'faction_intellectuals', 'faction_reformers'],
    infrastructure: {
      roads: 65,
      ports: 45,
      railways: 0,
      administration: 80,
    },
    economicPotential: {
      trade: 75,
      tax: 80,
      resources: 70,
      industry: 60,
    },
    description: 'Древній Золотоверхий Київ, культурна колиска нації, найбагатші чорноземи, центри друкарства та міського самоврядування.',
  },
  {
    id: 'region_galicia',
    name: 'Галичина та Пограниччя',
    population: '3.1M шляхтичів та міщан',
    wealth: 60,
    stability: 55,
    loyalty: 55,
    prosperity: 58,
    security: 50,
    unrest: 30,
    tension: 30,
    autonomy: 65,
    garrisonStrength: 45,
    taxContribution: 18,
    tradeContribution: 80,
    cultureTags: ['шляхетські_сеймики', 'соляні_промисли', 'європейські_звичаї'],
    dominantFactions: ['faction_landed_aristocracy', 'faction_intellectuals'],
    infrastructure: {
      roads: 60,
      ports: 0,
      railways: 0,
      administration: 65,
    },
    economicPotential: {
      trade: 85,
      tax: 55,
      resources: 75,
      industry: 45,
    },
    description: 'Землі давнього Королівства Русі: шляхетські сеймики, нафтові та соляні багатства Прикарпаття, висока чутливість до автономії.',
  },
  {
    id: 'region_muscovy',
    name: 'Московська земля (Східний Домен)',
    population: '2.9M жителів',
    wealth: 40,
    stability: 45,
    loyalty: 40,
    prosperity: 45,
    security: 40,
    unrest: 40,
    tension: 40,
    autonomy: 25,
    garrisonStrength: 70,
    taxContribution: 14,
    tradeContribution: 45,
    cultureTags: ['східний_рубіж', 'прикордонна_стража', 'складні_традиції'],
    dominantFactions: ['faction_military_command', 'faction_merchants'],
    infrastructure: {
      roads: 35,
      ports: 0,
      railways: 0,
      administration: 40,
    },
    economicPotential: {
      trade: 45,
      tax: 45,
      resources: 80,
      industry: 35,
    },
    description: 'Східний домен під гетьманським протекторатом: сильні військові залоги, високі витрати на нагляд та багатий ресурсний потенціал руд і лісу.',
  },
];

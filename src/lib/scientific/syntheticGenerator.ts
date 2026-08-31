/**
 * Digital Livelihood Twin - Synthetic Data Generator & Harmonizer
 * 
 * Generates calibrated synthetic microdata for:
 * 1. Brazil (Nordeste / Semiárido - PNAD Contínua calibrated)
 * 2. Chile (Araucanía / Maule - CASEN calibrated)
 * 3. Ecuador (Sierra Central / Manabí - ENIGHUR calibrated)
 * 
 * Rules:
 * - MUST ALWAYS label data_source="SYNTHETIC"
 * - Log-normal distributions for household income
 * - Calibrated demographic and agricultural parameters
 * - Deterministic pseudo-random numbers based on seed
 */

import { Country, CountryCode, DigitalTwin, Household, HouseholdMember, Region, TwinState, LivelihoodCapitals } from '../../types';

// Simple seeded pseudo-random number generator (Mulberry32)
export function createRNG(seed: number) {
  let s = Math.imul(seed ^ 0x6d2b79f5, 1);
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const COUNTRIES_CONFIG: Record<CountryCode, Country> = {
  BRA: {
    id: 'BRA',
    name: 'Brasil',
    code: 'BRA',
    flag: '🇧🇷',
    currency: 'BRL',
    currencySymbol: 'R$',
    exchangeRateToUSD: 5.20,
    nationalPovertyLineUSD: 175,
    extremePovertyLineUSD: 90,
    officialSurveyName: 'PNAD Contínua (IBGE)',
    benchmarkCCTProgram: 'Programa Bolsa Família',
    regions: [
      {
        id: 'BRA-NE-01',
        countryId: 'BRA',
        name: 'Sertão Nordestino (Semiárido)',
        code: 'NE_SERTAO',
        climateZone: 'SEMI_ARID',
        baseDroughtRisk: 0.72,
        coordinates: { lat: -8.05, lng: -38.5 },
        ruralPovertyRate: 42.5,
        meanIncomeUSD: 210,
      },
      {
        id: 'BRA-NE-02',
        countryId: 'BRA',
        name: 'Agreste Pernambucano',
        code: 'NE_AGRESTE',
        climateZone: 'TROPICAL_WET',
        baseDroughtRisk: 0.45,
        coordinates: { lat: -8.45, lng: -36.2 },
        ruralPovertyRate: 34.0,
        meanIncomeUSD: 260,
      },
      {
        id: 'BRA-NO-03',
        countryId: 'BRA',
        name: 'Amazônia Rural (Pará / Tapajós)',
        code: 'NO_AMAZONIA',
        climateZone: 'TROPICAL_WET',
        baseDroughtRisk: 0.32,
        coordinates: { lat: -2.44, lng: -54.71 },
        ruralPovertyRate: 38.8,
        meanIncomeUSD: 235,
      },
    ],
  },
  COL: {
    id: 'COL',
    name: 'Colombia',
    code: 'COL',
    flag: '🇨🇴',
    currency: 'COP',
    currencySymbol: 'COP$',
    exchangeRateToUSD: 4150,
    nationalPovertyLineUSD: 165,
    extremePovertyLineUSD: 80,
    officialSurveyName: 'GEIH (DANE)',
    benchmarkCCTProgram: 'Renta Ciudadana / Familias en Acción',
    regions: [
      {
        id: 'COL-PC-01',
        countryId: 'COL',
        name: 'Chocó Biogeográfico (Pacífico)',
        code: 'PAC_CHOCO',
        climateZone: 'TROPICAL_WET',
        baseDroughtRisk: 0.22,
        coordinates: { lat: 5.69, lng: -76.65 },
        ruralPovertyRate: 52.4,
        meanIncomeUSD: 175,
      },
      {
        id: 'COL-GUA-02',
        countryId: 'COL',
        name: 'Alta y Media Guajira (Secano)',
        code: 'GUA_SECO',
        climateZone: 'ARID',
        baseDroughtRisk: 0.78,
        coordinates: { lat: 11.54, lng: -72.90 },
        ruralPovertyRate: 58.2,
        meanIncomeUSD: 160,
      },
      {
        id: 'COL-AND-03',
        countryId: 'COL',
        name: 'Huila Macizo & Eje Cafetero',
        code: 'AND_HUILA',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.40,
        coordinates: { lat: 2.92, lng: -75.28 },
        ruralPovertyRate: 31.6,
        meanIncomeUSD: 285,
      },
    ],
  },
  PER: {
    id: 'PER',
    name: 'Perú',
    code: 'PER',
    flag: '🇵🇪',
    currency: 'PEN',
    currencySymbol: 'S/.',
    exchangeRateToUSD: 3.75,
    nationalPovertyLineUSD: 160,
    extremePovertyLineUSD: 78,
    officialSurveyName: 'ENAHO (INEI Perú)',
    benchmarkCCTProgram: 'Programa Nacional Juntos',
    regions: [
      {
        id: 'PER-PUN-01',
        countryId: 'PER',
        name: 'Puno Altiplano (Sierra Sur)',
        code: 'SIE_PUNO',
        climateZone: 'ANDES_HIGHLAND',
        baseDroughtRisk: 0.68,
        coordinates: { lat: -15.84, lng: -70.02 },
        ruralPovertyRate: 46.8,
        meanIncomeUSD: 185,
      },
      {
        id: 'PER-CUS-02',
        countryId: 'PER',
        name: 'Cusco Valles Interandinos',
        code: 'SIE_CUSCO',
        climateZone: 'ANDES_HIGHLAND',
        baseDroughtRisk: 0.48,
        coordinates: { lat: -13.53, lng: -71.96 },
        ruralPovertyRate: 36.2,
        meanIncomeUSD: 240,
      },
      {
        id: 'PER-LOR-03',
        countryId: 'PER',
        name: 'Loreto Rural Ribereño (Selva)',
        code: 'SEL_LORETO',
        climateZone: 'TROPICAL_WET',
        baseDroughtRisk: 0.28,
        coordinates: { lat: -3.74, lng: -73.25 },
        ruralPovertyRate: 44.1,
        meanIncomeUSD: 205,
      },
    ],
  },
  CHL: {
    id: 'CHL',
    name: 'Chile',
    code: 'CHL',
    flag: '🇨🇱',
    currency: 'CLP',
    currencySymbol: 'CLP$',
    exchangeRateToUSD: 940,
    nationalPovertyLineUSD: 230,
    extremePovertyLineUSD: 120,
    officialSurveyName: 'Encuesta CASEN (MDSyF)',
    benchmarkCCTProgram: 'Subsistema Seguridades y Oportunidades',
    regions: [
      {
        id: 'CHL-AR-01',
        countryId: 'CHL',
        name: 'Araucanía Rural (Cautín/Malleco)',
        code: 'AR_RURAL',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.38,
        coordinates: { lat: -38.74, lng: -72.59 },
        ruralPovertyRate: 24.8,
        meanIncomeUSD: 360,
      },
      {
        id: 'CHL-ML-02',
        countryId: 'CHL',
        name: 'Maule Sur Secano Interior',
        code: 'ML_SECANO',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.52,
        coordinates: { lat: -35.43, lng: -71.65 },
        ruralPovertyRate: 19.5,
        meanIncomeUSD: 410,
      },
      {
        id: 'CHL-LL-03',
        countryId: 'CHL',
        name: 'Los Lagos Chiloé Rural',
        code: 'LL_CHILOE',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.25,
        coordinates: { lat: -42.47, lng: -73.77 },
        ruralPovertyRate: 21.0,
        meanIncomeUSD: 390,
      },
    ],
  },
  ECU: {
    id: 'ECU',
    name: 'Ecuador',
    code: 'ECU',
    flag: '🇪🇨',
    currency: 'USD',
    currencySymbol: '$',
    exchangeRateToUSD: 1.0,
    nationalPovertyLineUSD: 185,
    extremePovertyLineUSD: 95,
    officialSurveyName: 'ENEMDU (INEC Ecuador)',
    benchmarkCCTProgram: 'Bono de Desarrollo Humano (BDH)',
    regions: [
      {
        id: 'ECU-SI-01',
        countryId: 'ECU',
        name: 'Chimborazo (Sierra Central Andina)',
        code: 'SI_CHIMBORAZO',
        climateZone: 'ANDES_HIGHLAND',
        baseDroughtRisk: 0.58,
        coordinates: { lat: -1.67, lng: -78.65 },
        ruralPovertyRate: 48.2,
        meanIncomeUSD: 195,
      },
      {
        id: 'ECU-CO-02',
        countryId: 'ECU',
        name: 'Manabí Rural Seco',
        code: 'CO_MANABI',
        climateZone: 'SEMI_ARID',
        baseDroughtRisk: 0.64,
        coordinates: { lat: -0.95, lng: -80.45 },
        ruralPovertyRate: 39.0,
        meanIncomeUSD: 230,
      },
      {
        id: 'ECU-OR-03',
        countryId: 'ECU',
        name: 'Napo Amazonía Kichwa Rural',
        code: 'OR_NAPO',
        climateZone: 'TROPICAL_WET',
        baseDroughtRisk: 0.20,
        coordinates: { lat: -0.99, lng: -77.81 },
        ruralPovertyRate: 45.3,
        meanIncomeUSD: 210,
      },
    ],
  },
  ARG: {
    id: 'ARG',
    name: 'Argentina',
    code: 'ARG',
    flag: '🇦🇷',
    currency: 'ARS',
    currencySymbol: 'ARS$',
    exchangeRateToUSD: 1050,
    nationalPovertyLineUSD: 210,
    extremePovertyLineUSD: 105,
    officialSurveyName: 'EPH / INDEC Rural',
    benchmarkCCTProgram: 'Asignación Universal por Hijo (AUH)',
    regions: [
      {
        id: 'ARG-NOA-01',
        countryId: 'ARG',
        name: 'NOA Jujuy/Salta Quebrada & Puna',
        code: 'NOA_QUEBRADA',
        climateZone: 'ANDES_HIGHLAND',
        baseDroughtRisk: 0.62,
        coordinates: { lat: -23.57, lng: -65.35 },
        ruralPovertyRate: 44.5,
        meanIncomeUSD: 240,
      },
      {
        id: 'ARG-NEA-02',
        countryId: 'ARG',
        name: 'NEA Chaco Impenetrable Seco',
        code: 'NEA_CHACO',
        climateZone: 'SEMI_ARID',
        baseDroughtRisk: 0.74,
        coordinates: { lat: -26.18, lng: -60.44 },
        ruralPovertyRate: 49.8,
        meanIncomeUSD: 220,
      },
      {
        id: 'ARG-CUY-03',
        countryId: 'ARG',
        name: 'Cuyo Mendoza Secano Rural',
        code: 'CUY_MENDOZA',
        climateZone: 'ARID',
        baseDroughtRisk: 0.66,
        coordinates: { lat: -32.88, lng: -68.84 },
        ruralPovertyRate: 32.0,
        meanIncomeUSD: 310,
      },
    ],
  },
  BOL: {
    id: 'BOL',
    name: 'Bolivia',
    code: 'BOL',
    flag: '🇧🇴',
    currency: 'BOB',
    currencySymbol: 'Bs.',
    exchangeRateToUSD: 6.96,
    nationalPovertyLineUSD: 145,
    extremePovertyLineUSD: 70,
    officialSurveyName: 'Encuesta de Hogares (INE Bolivia)',
    benchmarkCCTProgram: 'Bono Juancito Pinto / Renta Dignidad',
    regions: [
      {
        id: 'BOL-ALT-01',
        countryId: 'BOL',
        name: 'Altiplano Norte La Paz / Omasuyos',
        code: 'ALT_LAPAZ',
        climateZone: 'ANDES_HIGHLAND',
        baseDroughtRisk: 0.70,
        coordinates: { lat: -16.03, lng: -68.64 },
        ruralPovertyRate: 54.6,
        meanIncomeUSD: 155,
      },
      {
        id: 'BOL-VAL-02',
        countryId: 'BOL',
        name: 'Valles Altos Cochabamba',
        code: 'VAL_COCHABAMBA',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.50,
        coordinates: { lat: -17.39, lng: -66.15 },
        ruralPovertyRate: 38.2,
        meanIncomeUSD: 215,
      },
      {
        id: 'BOL-CHA-03',
        countryId: 'BOL',
        name: 'Gran Chaco Tarijeño (Secano)',
        code: 'CHA_TARIJA',
        climateZone: 'SEMI_ARID',
        baseDroughtRisk: 0.75,
        coordinates: { lat: -21.53, lng: -64.73 },
        ruralPovertyRate: 46.0,
        meanIncomeUSD: 190,
      },
    ],
  },
  PRY: {
    id: 'PRY',
    name: 'Paraguay',
    code: 'PRY',
    flag: '🇵🇾',
    currency: 'PYG',
    currencySymbol: '₲',
    exchangeRateToUSD: 7800,
    nationalPovertyLineUSD: 155,
    extremePovertyLineUSD: 75,
    officialSurveyName: 'EPHC (INE Paraguay)',
    benchmarkCCTProgram: 'Programa Tekoporã Mbarete',
    regions: [
      {
        id: 'PRY-OR-01',
        countryId: 'PRY',
        name: 'Caazapá / San Pedro Rural',
        code: 'REG_ORIENTAL',
        climateZone: 'TROPICAL_WET',
        baseDroughtRisk: 0.44,
        coordinates: { lat: -26.18, lng: -56.37 },
        ruralPovertyRate: 41.2,
        meanIncomeUSD: 195,
      },
      {
        id: 'PRY-CHA-02',
        countryId: 'PRY',
        name: 'Chaco Boquerón Occidental',
        code: 'REG_CHACO',
        climateZone: 'SEMI_ARID',
        baseDroughtRisk: 0.76,
        coordinates: { lat: -22.38, lng: -60.03 },
        ruralPovertyRate: 47.5,
        meanIncomeUSD: 180,
      },
    ],
  },
  URY: {
    id: 'URY',
    name: 'Uruguay',
    code: 'URY',
    flag: '🇺🇾',
    currency: 'UYU',
    currencySymbol: '$U',
    exchangeRateToUSD: 42.0,
    nationalPovertyLineUSD: 240,
    extremePovertyLineUSD: 125,
    officialSurveyName: 'ECH (INE Uruguay)',
    benchmarkCCTProgram: 'Asignaciones Familiares (Plan de Equidad)',
    regions: [
      {
        id: 'URY-NOR-01',
        countryId: 'URY',
        name: 'Norte Fronterizo (Artigas / Rivera)',
        code: 'NOR_ARTIGAS',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.42,
        coordinates: { lat: -30.40, lng: -56.46 },
        ruralPovertyRate: 18.2,
        meanIncomeUSD: 440,
      },
      {
        id: 'URY-LIT-02',
        countryId: 'URY',
        name: 'Litoral Río Negro & Soriano',
        code: 'LIT_RIONEGRO',
        climateZone: 'TEMPERATE',
        baseDroughtRisk: 0.35,
        coordinates: { lat: -32.80, lng: -57.50 },
        ruralPovertyRate: 14.5,
        meanIncomeUSD: 520,
      },
    ],
  },
};

export class SyntheticDataGenerator {
  /**
   * Generates N calibrated rural households and digital twins for a country
   */
  static generateCountryData(
    countryCode: CountryCode,
    nHouseholds = 100,
    seed = 42
  ): { households: Household[]; twins: DigitalTwin[] } {
    const rng = createRNG(seed);
    const country = COUNTRIES_CONFIG[countryCode];
    const households: Household[] = [];
    const twins: DigitalTwin[] = [];
    
    const regions = country.regions;

    for (let i = 0; i < nHouseholds; i++) {
      const region = regions[Math.floor(rng() * regions.length)];
      const householdId = `HH-${countryCode}-${String(i + 1).padStart(4, '0')}`;
      const twinId = `TWIN-${countryCode}-${String(i + 1).padStart(4, '0')}`;
      const anonCode = `RUR-${countryCode}-${Math.floor(1000 + rng() * 9000)}`;
      
      // Demographics
      const size = Math.floor(2 + rng() * 5); // 2 to 6 members
      const childrenCount = Math.max(0, Math.min(size - 1, Math.floor(rng() * 4)));
      const elderlyCount = rng() < 0.25 ? 1 : 0;
      const adultsCount = Math.max(1, size - childrenCount - elderlyCount);
      
      // Member list
      const members: HouseholdMember[] = [];
      members.push({
        id: `${householdId}-M01`,
        householdId,
        name: `Jefe/a de Hogar ${i + 1}`,
        relationToHead: 'HEAD',
        age: Math.floor(28 + rng() * 40),
        sex: rng() < 0.35 ? 'F' : 'M',
        educationYears: Math.floor(2 + rng() * 9),
        enrolledInSchool: false,
        healthStatus: rng() < 0.85 ? 'GOOD' : 'FAIR',
        employmentStatus: rng() < 0.65 ? 'AGRICULTURAL_SELF' : 'AGRICULTURAL_WAGE',
        monthlyWageUSD: 0,
      });

      if (adultsCount > 1) {
        members.push({
          id: `${householdId}-M02`,
          householdId,
          name: `Cónyuge ${i + 1}`,
          relationToHead: 'SPOUSE',
          age: Math.max(18, members[0].age - 3 + Math.floor(rng() * 6)),
          sex: members[0].sex === 'M' ? 'F' : 'M',
          educationYears: Math.floor(3 + rng() * 8),
          enrolledInSchool: false,
          healthStatus: 'GOOD',
          employmentStatus: rng() < 0.5 ? 'AGRICULTURAL_SELF' : 'NON_AGRICULTURAL',
          monthlyWageUSD: 0,
        });
      }

      for (let c = 0; c < childrenCount; c++) {
        const childAge = Math.floor(3 + rng() * 14);
        members.push({
          id: `${householdId}-C0${c + 1}`,
          householdId,
          name: `Hijo/a ${c + 1}`,
          relationToHead: 'CHILD',
          age: childAge,
          sex: rng() < 0.5 ? 'M' : 'F',
          educationYears: Math.max(0, Math.min(childAge - 5, 10)),
          enrolledInSchool: childAge >= 5 && rng() < 0.92,
          healthStatus: 'GOOD',
          employmentStatus: 'STUDENT',
          monthlyWageUSD: 0,
        });
      }

      // Geo coordinates with small jitter around region center
      const lat = region.coordinates.lat + (rng() - 0.5) * 0.4;
      const lng = region.coordinates.lng + (rng() - 0.5) * 0.4;

      const household: Household = {
        id: householdId,
        anonymousCode: anonCode,
        countryId: countryCode,
        regionId: region.id,
        dataSource: 'SYNTHETIC',
        dataSourceVersion: 'HRHS_V2.1_CALIBRATED',
        size,
        childrenCount,
        elderlyCount,
        members,
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lng.toFixed(4)),
        createdAt: '2026-01-15T00:00:00Z',
      };

      // Economic calibrated generation (Log-normal income distribution)
      // Normal standard variate Box-Muller
      const u1 = Math.max(0.0001, rng());
      const u2 = rng();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      
      const logMu = Math.log(region.meanIncomeUSD * 0.85);
      const logSigma = 0.55;
      const totalGeneratedIncome = Math.max(60, Math.exp(logMu + logSigma * z));
      
      const agShare = 0.5 + (rng() - 0.5) * 0.4;
      const agIncome = Math.max(20, totalGeneratedIncome * agShare);
      const nonAgIncome = Math.max(0, totalGeneratedIncome * (1 - agShare) * 0.85);
      const remittances = rng() < 0.25 ? Math.floor(20 + rng() * 60) : 0;
      const baseCCT = rng() < 0.4 ? Math.floor(25 + rng() * 35) : 0;
      
      const monthlyTotal = agIncome + nonAgIncome + remittances + baseCCT;
      const perCapita = monthlyTotal / size;
      
      // 5 Capitals
      const landHa = Number((0.5 + rng() * 4.5).toFixed(1));
      const livestock = Math.floor(rng() * 6);
      const avgEdu = members.reduce((acc, m) => acc + m.educationYears, 0) / size;
      
      const humanScore = Math.min(100, Math.max(15, (avgEdu / 12) * 60 + (adultsCount / size) * 40));
      const physicalScore = Math.min(100, Math.max(10, 30 + (rng() * 50)));
      const financialScore = Math.min(100, Math.max(10, (monthlyTotal / 450) * 100));
      const socialScore = Math.min(100, Math.max(20, 40 + (rng() * 50)));
      const naturalScore = Math.min(100, Math.max(10, (landHa / 5) * 40 + (livestock / 5) * 30 + (1 - region.baseDroughtRisk) * 30));
      
      const capitals: LivelihoodCapitals = {
        human: {
          score: Number(humanScore.toFixed(1)),
          averageEducationYears: Number(avgEdu.toFixed(1)),
          workingAgeMembers: adultsCount,
          healthIndex: Math.floor(70 + rng() * 25),
          dependencyRatio: Number(((childrenCount + elderlyCount) / Math.max(1, adultsCount)).toFixed(2)),
        },
        physical: {
          score: Number(physicalScore.toFixed(1)),
          housingQuality: Math.floor(30 + rng() * 60),
          electricityAccess: rng() < 0.88,
          improvedSanitation: rng() < 0.70,
          cleanWaterAccess: rng() < 0.75,
          agriculturalEquipmentScore: Math.floor(20 + rng() * 60),
        },
        financial: {
          score: Number(financialScore.toFixed(1)),
          monthlyIncomeUSD: Number(monthlyTotal.toFixed(2)),
          savingsUSD: Math.floor(rng() * 120),
          debtUSD: rng() < 0.4 ? Math.floor(50 + rng() * 200) : 0,
          accessToCredit: rng() < 0.35,
          incomeDiversificationIndex: Number((0.2 + rng() * 0.6).toFixed(2)),
        },
        social: {
          score: Number(socialScore.toFixed(1)),
          communityNetworkScore: Math.floor(40 + rng() * 50),
          cooperativeMembership: rng() < 0.4,
          institutionalTrust: Math.floor(30 + rng() * 50),
          emergencySupportAccess: rng() < 0.6,
        },
        natural: {
          score: Number(naturalScore.toFixed(1)),
          landHectares: landHa,
          soilQualityIndex: Math.floor(30 + rng() * 55),
          waterAvailabilityIndex: Math.floor(20 + (1 - region.baseDroughtRisk) * 70),
          livestockUnits: livestock,
          forestResourceAccess: rng() < 0.5,
        },
        compositeResilienceIndex: 0,
      };

      const wHuman = 0.25;
      const wPhysical = 0.20;
      const wFinancial = 0.25;
      const wSocial = 0.15;
      const wNatural = 0.15;
      
      const resilienceScore = Number((
        (humanScore / 100) * wHuman +
        (physicalScore / 100) * wPhysical +
        (financialScore / 100) * wFinancial +
        (socialScore / 100) * wSocial +
        (naturalScore / 100) * wNatural
      ).toFixed(4));
      
      capitals.compositeResilienceIndex = resilienceScore;

      // Poverty & Deprivations
      const isPoverty = perCapita < country.nationalPovertyLineUSD;
      const isExtreme = perCapita < country.extremePovertyLineUSD;
      const povertyGap = isPoverty ? (country.nationalPovertyLineUSD - perCapita) / country.nationalPovertyLineUSD : 0;
      
      const deprivations = {
        nutrition: perCapita < country.extremePovertyLineUSD * 1.1,
        childMortality: false,
        yearsOfSchooling: avgEdu < 5,
        schoolAttendance: members.some((m) => m.relationToHead === 'CHILD' && m.age >= 6 && m.age <= 14 && !m.enrolledInSchool),
        cookingFuel: !capitals.physical.electricityAccess && rng() < 0.7,
        sanitation: !capitals.physical.improvedSanitation,
        drinkingWater: !capitals.physical.cleanWaterAccess,
        electricity: !capitals.physical.electricityAccess,
        housing: capitals.physical.housingQuality < 45,
        assets: capitals.financial.savingsUSD < 20 && landHa < 1.0,
      };

      const depScore = Number((
        (deprivations.nutrition ? 1/6 : 0) +
        (deprivations.childMortality ? 1/6 : 0) +
        (deprivations.yearsOfSchooling ? 1/6 : 0) +
        (deprivations.schoolAttendance ? 1/6 : 0) +
        (deprivations.cookingFuel ? 1/18 : 0) +
        (deprivations.sanitation ? 1/18 : 0) +
        (deprivations.drinkingWater ? 1/18 : 0) +
        (deprivations.electricity ? 1/18 : 0) +
        (deprivations.housing ? 1/18 : 0) +
        (deprivations.assets ? 1/18 : 0)
      ).toFixed(3));

      const observedState: TwinState = {
        id: `STATE-OBS-${twinId}`,
        twinId,
        householdId,
        stateType: 'OBSERVED',
        timestamp: '2026-01-15T00:00:00Z',
        qualityScore: 94,
        dataChecksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
        monthlyAgriculturalIncomeUSD: Number(agIncome.toFixed(2)),
        monthlyNonAgriculturalIncomeUSD: Number(nonAgIncome.toFixed(2)),
        monthlyCCTTransferUSD: baseCCT,
        monthlyRemittancesUSD: remittances,
        monthlyTotalIncomeUSD: Number(monthlyTotal.toFixed(2)),
        perCapitaIncomeUSD: Number(perCapita.toFixed(2)),
        monthlyExpenditureUSD: Number((monthlyTotal * 0.92).toFixed(2)),
        foodExpenditureUSD: Number((monthlyTotal * 0.58).toFixed(2)),
        foodSecurityIndex: Math.floor(40 + rng() * 50),
        savingsUSD: capitals.financial.savingsUSD,
        capitals,
        isPovertyFGT0: isPoverty,
        isExtremePovertyFGT0: isExtreme,
        povertyGap: Number(povertyGap.toFixed(4)),
        povertySeverity: Number(Math.pow(povertyGap, 2).toFixed(4)),
        deprivations,
        deprivationScore: depScore,
        isMultiDimensionallyPoor: depScore >= 0.333,
        riskAversionLambda: 2.25,
        resilienceScore,
        adaptationCapacity: Number((resilienceScore * 0.9).toFixed(3)),
      };

      const twin: DigitalTwin = {
        id: twinId,
        householdId,
        countryCode,
        regionId: region.id,
        modelVersion: 'DLT-ABM-v2.1',
        datasetVersion: 'SYNTHETIC_2026_Q1',
        createdAt: '2026-01-15T00:00:00Z',
        observedState,
        simulatedStates: {},
      };

      households.push(household);
      twins.push(twin);
    }

    return { households, twins };
  }
}

/**
 * Digital Livelihood Twin (DLT) - Comprehensive Type Definitions
 * Grounded in:
 * - DFID Sustainable Livelihoods Framework (5 Capitals)
 * - Kahneman & Tversky (1979) Prospect Theory
 * - Foster-Greer-Thorbecke (1984) Poverty Indices
 * - Alkire & Foster (2011) Multidimensional Poverty Index (MPI)
 */

export type DataSourceType = 
  | 'SYNTHETIC' 
  | 'REAL_PNAD' 
  | 'REAL_CASEN' 
  | 'REAL_ENIGHUR' 
  | 'REAL_GEIH' 
  | 'REAL_ENAHO' 
  | 'REAL_EPH' 
  | 'REAL_EH_BOL' 
  | 'REAL_EPHC' 
  | 'REAL_ECH';

export type UserRole = 'ADMIN' | 'RESEARCHER' | 'ANALYST' | 'VIEWER';

export type CountryCode = 'BRA' | 'COL' | 'PER' | 'CHL' | 'ECU' | 'ARG' | 'BOL' | 'PRY' | 'URY';

export interface Country {
  id: string;
  name: string;
  code: CountryCode;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD: number;
  nationalPovertyLineUSD: number; // monthly per capita USD
  extremePovertyLineUSD: number;
  officialSurveyName: string;
  benchmarkCCTProgram: string;
  regions: Region[];
}

export interface Region {
  id: string;
  countryId: string;
  name: string;
  code: string;
  climateZone: 'ARID' | 'TROPICAL_WET' | 'TEMPERATE' | 'ANDES_HIGHLAND' | 'SEMI_ARID';
  baseDroughtRisk: number; // 0-1
  coordinates: { lat: number; lng: number };
  ruralPovertyRate: number;
  meanIncomeUSD: number;
}

// 5 Capitals according to DFID (1999) Sustainable Livelihoods Framework
export interface LivelihoodCapitals {
  human: {
    score: number; // 0 - 100
    averageEducationYears: number;
    workingAgeMembers: number;
    healthIndex: number; // 0 - 100
    dependencyRatio: number;
  };
  physical: {
    score: number; // 0 - 100
    housingQuality: number; // 0 - 100
    electricityAccess: boolean;
    improvedSanitation: boolean;
    cleanWaterAccess: boolean;
    agriculturalEquipmentScore: number;
  };
  financial: {
    score: number; // 0 - 100
    monthlyIncomeUSD: number;
    savingsUSD: number;
    debtUSD: number;
    accessToCredit: boolean;
    incomeDiversificationIndex: number; // 0 - 1
  };
  social: {
    score: number; // 0 - 100
    communityNetworkScore: number;
    cooperativeMembership: boolean;
    institutionalTrust: number; // 0 - 100
    emergencySupportAccess: boolean;
  };
  natural: {
    score: number; // 0 - 100
    landHectares: number;
    soilQualityIndex: number; // 0 - 100
    waterAvailabilityIndex: number; // 0 - 100
    livestockUnits: number;
    forestResourceAccess: boolean;
  };
  compositeResilienceIndex: number; // 0 - 1
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  name: string;
  relationToHead: 'HEAD' | 'SPOUSE' | 'CHILD' | 'ELDER' | 'OTHER';
  age: number;
  sex: 'M' | 'F';
  educationYears: number;
  enrolledInSchool: boolean;
  healthStatus: 'GOOD' | 'FAIR' | 'CHRONIC_ILLNESS' | 'DISABLED';
  employmentStatus: 'AGRICULTURAL_SELF' | 'AGRICULTURAL_WAGE' | 'NON_AGRICULTURAL' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED';
  monthlyWageUSD: number;
}

export interface Household {
  id: string;
  anonymousCode: string;
  countryId: CountryCode;
  regionId: string;
  dataSource: DataSourceType;
  dataSourceVersion: string;
  size: number;
  childrenCount: number;
  elderlyCount: number;
  members: HouseholdMember[];
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface TwinState {
  id: string;
  twinId: string;
  householdId: string;
  stateType: 'OBSERVED' | 'SIMULATED';
  scenarioId?: string;
  timestamp: string;
  qualityScore: number; // 0 - 100
  dataChecksum: string;
  
  // Economic parameters
  monthlyAgriculturalIncomeUSD: number;
  monthlyNonAgriculturalIncomeUSD: number;
  monthlyCCTTransferUSD: number;
  monthlyRemittancesUSD: number;
  monthlyTotalIncomeUSD: number;
  perCapitaIncomeUSD: number;
  monthlyExpenditureUSD: number;
  foodExpenditureUSD: number;
  foodSecurityIndex: number; // 0 - 100
  savingsUSD: number;
  
  // Capital State
  capitals: LivelihoodCapitals;
  
  // Poverty & Deprivation Status
  isPovertyFGT0: boolean;
  isExtremePovertyFGT0: boolean;
  povertyGap: number; // (z - y) / z if y < z
  povertySeverity: number; // ((z - y) / z)^2
  
  // MPI Alkire-Foster 10 Indicators (deprived = true)
  deprivations: {
    nutrition: boolean;
    childMortality: boolean;
    yearsOfSchooling: boolean;
    schoolAttendance: boolean;
    cookingFuel: boolean;
    sanitation: boolean;
    drinkingWater: boolean;
    electricity: boolean;
    housing: boolean;
    assets: boolean;
  };
  deprivationScore: number; // c in [0, 1]
  isMultiDimensionallyPoor: boolean; // c >= k (usually k=0.333)
  
  // Behavioral & Resilience Metrics
  riskAversionLambda: number; // Prospect Theory loss aversion coefficient (approx 2.25)
  resilienceScore: number; // 0 - 1
  adaptationCapacity: number; // 0 - 1
}

export interface DigitalTwin {
  id: string;
  householdId: string;
  countryCode: CountryCode;
  regionId: string;
  modelVersion: string;
  datasetVersion: string;
  createdAt: string;
  observedState: TwinState;
  simulatedStates: Record<string, TwinState>; // scenarioId -> TwinState
}

// Climate Shock Models
export type ShockType = 'NORMAL' | 'DROUGHT' | 'EXTREME_DROUGHT' | 'HEAVY_RAINFALL' | 'FROST' | 'CUSTOM';

export interface ClimateShock {
  id: string;
  regionId: string;
  shockType: ShockType;
  intensity: number; // 0.0 to 1.0
  durationMonths: number;
  temperatureAnomalyC: number;
  rainfallAnomalyPct: number;
  soilMoistureDeficitPct: number;
  startDate: string;
  cropYieldImpactFactor: number; // e.g. 0.7 = 30% loss
  livestockMortalityRate: number;
}

// CCT Policy Models
export type CCTScenarioType = 'BASELINE' | 'SCENARIO_A_UNIVERSAL' | 'SCENARIO_B_CONDITIONAL' | 'SCENARIO_C_GRADUATED' | 'SCENARIO_D_INTEGRATED';

export interface CCTProgram {
  id: string;
  name: string;
  scenarioType: CCTScenarioType;
  description: string;
  baseTransferUSD: number;
  transferPerChildUSD: number;
  transferPerElderlyUSD: number;
  maxTransferUSD: number;
  paymentFrequency: 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY';
  
  // Targeting
  targetingMethod: 'GEOGRAPHIC' | 'MEANS_TEST' | 'PMT_PROXY_MEANS' | 'UNIVERSAL';
  povertyThresholdUSD: number;
  
  // Conditionalities
  educationCondition: boolean;
  requiredSchoolAttendancePct: number;
  healthCondition: boolean;
  requiredHealthCheckupsPerYear: number;
  
  // Plus components
  includesAgriculturalTraining: boolean;
  includesMicrocreditAccess: boolean;
  includesClimateInsurance: boolean;
  
  // Budget & Admin
  adminCostPercentage: number;
  annualBudgetCapUSD?: number;
}

// Scientific Indicator Summaries
export interface MacroIndicators {
  totalHouseholds: number;
  totalIndividuals: number;
  
  // FGT Measures
  fgt0_headcountRatio: number; // Poverty Rate %
  fgt1_povertyGapIndex: number; // Poverty Gap %
  fgt2_povertySeverityIndex: number; // Poverty Severity %
  extremePovertyRate: number;
  
  // MPI (Alkire-Foster)
  mpi_incidence_H: number; // % of population multidimensionally poor
  mpi_intensity_A: number; // average deprivation share among poor
  mpi_index: number; // H * A
  
  // Inequality
  giniCoefficient: number; // 0 - 1
  palmaRatio: number; // top 10% share / bottom 40% share
  meanIncomeUSD: number;
  medianIncomeUSD: number;
  
  // Resilience & Vulnerability
  meanResilienceScore: number;
  highVulnerabilityPercentage: number; // % households with resilience < 0.35
  
  // CCT Program Performance
  beneficiaryHouseholds: number;
  coverageRatePct: number;
  totalMonthlyCostUSD: number;
  costPerBeneficiaryUSD: number;
  costPerPovertyReductionUSD: number;
  inclusionErrorPct: number; // Non-poor receiving transfers
  exclusionErrorPct: number; // Poor excluded from transfers
  policyEfficiencyScore: number; // 0 - 100
}

export interface SimulationResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  randomSeed: number;
  stepsCount: number;
  replicasCount: number;
  createdAt: string;
  completedAt?: string;
  
  baselineIndicators: MacroIndicators;
  simulatedIndicators: MacroIndicators;
  
  // Confidence intervals (p5, p50, p95) across Monte Carlo replicas
  confidenceIntervals: {
    fgt0: { p5: number; p50: number; p95: number };
    mpi: { p5: number; p50: number; p95: number };
    gini: { p5: number; p50: number; p95: number };
    resilience: { p5: number; p50: number; p95: number };
    cost: { p5: number; p50: number; p95: number };
  };
  
  // Step by step trajectory
  timeSeriesTrajectory: Array<{
    step: number;
    month: string;
    povertyRate: number;
    mpiIndex: number;
    meanIncomeUSD: number;
    meanResilience: number;
    beneficiaries: number;
    totalCostUSD: number;
  }>;
}

export interface RecalculationDiff {
  twinId: string;
  changedVariable: string;
  oldValue: any;
  newValue: any;
  affectedVariables: Record<string, { old: any; new: any }>;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'HOUSEHOLD' | 'TWIN' | 'POLICY' | 'SIMULATION' | 'CLIMATE' | 'DATASET' | 'AUTH';
  entityId: string;
  details: string;
  actor: string;
  twinId?: string;
  targetVariable?: string;
  previousValue?: any;
  newValue?: any;
  stateType?: string;
}

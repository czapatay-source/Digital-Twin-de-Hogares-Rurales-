/**
 * Digital Livelihood Twin - CCT Policy Engine
 * 
 * Implementations of core social transfer policies:
 * - Scenario A: Universal Child/Household Benefit (Universal, unconditional)
 * - Scenario B: Standard Conditional Cash Transfer (Targeted, education/health condition)
 * - Scenario C: Progressive / Graduated Transfer (Base + per child/elderly graduation)
 * - Scenario D: Integrated CCT + Productive Inclusion (Transfer + training + microcredit access)
 */

import { CCTProgram, CCTScenarioType, TwinState, Household, Country } from '../../types';

export class CCTScenarioFactory {
  static baseline(): CCTProgram {
    return {
      id: 'SCENARIO-BASELINE',
      name: 'Status Quo (Línea Base)',
      scenarioType: 'BASELINE',
      description: 'Condiciones actuales observadas sin expansión de programas CCT.',
      baseTransferUSD: 0,
      transferPerChildUSD: 0,
      transferPerElderlyUSD: 0,
      maxTransferUSD: 0,
      paymentFrequency: 'MONTHLY',
      targetingMethod: 'MEANS_TEST',
      povertyThresholdUSD: 140,
      educationCondition: false,
      requiredSchoolAttendancePct: 0,
      healthCondition: false,
      requiredHealthCheckupsPerYear: 0,
      includesAgriculturalTraining: false,
      includesMicrocreditAccess: false,
      includesClimateInsurance: false,
      adminCostPercentage: 5,
    };
  }

  static scenarioAUniversal(baseAmount = 50): CCTProgram {
    return {
      id: 'SCENARIO-A',
      name: 'Escenario A: Transferencia Básica Universal',
      scenarioType: 'SCENARIO_A_UNIVERSAL',
      description: 'Transferencia monetaria no condicionada asignada a todos los hogares rurales.',
      baseTransferUSD: baseAmount,
      transferPerChildUSD: 0,
      transferPerElderlyUSD: 0,
      maxTransferUSD: baseAmount,
      paymentFrequency: 'MONTHLY',
      targetingMethod: 'UNIVERSAL',
      povertyThresholdUSD: 9999,
      educationCondition: false,
      requiredSchoolAttendancePct: 0,
      healthCondition: false,
      requiredHealthCheckupsPerYear: 0,
      includesAgriculturalTraining: false,
      includesMicrocreditAccess: false,
      includesClimateInsurance: false,
      adminCostPercentage: 3.5, // Low admin cost due to zero targeting friction
    };
  }

  static scenarioBConditional(baseAmount = 70, education = true, health = true): CCTProgram {
    return {
      id: 'SCENARIO-B',
      name: 'Escenario B: CCT Condicionado Focalizado',
      scenarioType: 'SCENARIO_B_CONDITIONAL',
      description: 'Transferencia focalizada a hogares bajo línea de pobreza, sujeta a 85% asistencia escolar y controles de salud.',
      baseTransferUSD: baseAmount,
      transferPerChildUSD: 0,
      transferPerElderlyUSD: 0,
      maxTransferUSD: baseAmount,
      paymentFrequency: 'MONTHLY',
      targetingMethod: 'PMT_PROXY_MEANS',
      povertyThresholdUSD: 180,
      educationCondition: education,
      requiredSchoolAttendancePct: 85,
      healthCondition: health,
      requiredHealthCheckupsPerYear: 3,
      includesAgriculturalTraining: false,
      includesMicrocreditAccess: false,
      includesClimateInsurance: false,
      adminCostPercentage: 8.5,
    };
  }

  static scenarioCGraduated(base = 35, perChild = 20, perElderly = 15, max = 115): CCTProgram {
    return {
      id: 'SCENARIO-C',
      name: 'Escenario C: CCT Progresivo Graduado por Carga',
      scenarioType: 'SCENARIO_C_GRADUATED',
      description: 'Monto base más suplementos incrementales por niño escolarizado y adultos mayores dependientes.',
      baseTransferUSD: base,
      transferPerChildUSD: perChild,
      transferPerElderlyUSD: perElderly,
      maxTransferUSD: max,
      paymentFrequency: 'MONTHLY',
      targetingMethod: 'MEANS_TEST',
      povertyThresholdUSD: 180,
      educationCondition: true,
      requiredSchoolAttendancePct: 85,
      healthCondition: true,
      requiredHealthCheckupsPerYear: 3,
      includesAgriculturalTraining: false,
      includesMicrocreditAccess: false,
      includesClimateInsurance: false,
      adminCostPercentage: 7.0,
    };
  }

  static scenarioDIntegrated(amount = 60, training = true, microcredit = true): CCTProgram {
    return {
      id: 'SCENARIO-D',
      name: 'Escenario D: Inclusión Productiva Integrada (CCT+)',
      scenarioType: 'SCENARIO_D_INTEGRATED',
      description: 'Transferencia combinada con asistencia técnica agronómica, seguro agroclimático y microcrédito.',
      baseTransferUSD: amount,
      transferPerChildUSD: 15,
      transferPerElderlyUSD: 10,
      maxTransferUSD: 110,
      paymentFrequency: 'MONTHLY',
      targetingMethod: 'PMT_PROXY_MEANS',
      povertyThresholdUSD: 190,
      educationCondition: true,
      requiredSchoolAttendancePct: 80,
      healthCondition: true,
      requiredHealthCheckupsPerYear: 2,
      includesAgriculturalTraining: training,
      includesMicrocreditAccess: microcredit,
      includesClimateInsurance: true,
      adminCostPercentage: 11.0,
    };
  }
}

/**
 * Checks eligibility of a household for a given CCT program
 */
export function checkEligibility(
  household: Household,
  state: TwinState,
  program: CCTProgram,
  povertyLineUSD = 180
): boolean {
  if (program.scenarioType === 'BASELINE') return false;
  if (program.targetingMethod === 'UNIVERSAL') return true;
  
  // Pre-transfer per capita income
  const preTransferIncome = state.monthlyAgriculturalIncomeUSD + state.monthlyNonAgriculturalIncomeUSD + state.monthlyRemittancesUSD;
  const perCapita = preTransferIncome / (household.size || 4);
  
  if (program.targetingMethod === 'MEANS_TEST') {
    return perCapita <= (program.povertyThresholdUSD || povertyLineUSD);
  }
  
  if (program.targetingMethod === 'PMT_PROXY_MEANS') {
    // Proxy Means Test score based on physical assets, education, sanitation
    const pmtScore = 
      (state.capitals.physical.housingQuality * 0.25) +
      (state.capitals.human.averageEducationYears * 4) +
      (state.capitals.natural.landHectares * 3) +
      (state.capitals.physical.electricityAccess ? 15 : 0) +
      (state.capitals.physical.cleanWaterAccess ? 15 : 0);
      
    // Lower PMT score indicates higher poverty
    return pmtScore <= 60 || perCapita <= program.povertyThresholdUSD;
  }
  
  if (program.targetingMethod === 'GEOGRAPHIC') {
    return true; // regional eligibility assumed
  }
  
  return perCapita <= povertyLineUSD;
}

/**
 * Calculates the exact transfer amount received by an eligible household
 */
export function calculateTransferAmount(
  household: Household,
  isEligible: boolean,
  program: CCTProgram
): number {
  if (!isEligible || program.scenarioType === 'BASELINE') return 0;
  
  let total = program.baseTransferUSD;
  
  if (program.transferPerChildUSD > 0) {
    total += household.childrenCount * program.transferPerChildUSD;
  }
  
  if (program.transferPerElderlyUSD > 0) {
    total += household.elderlyCount * program.transferPerElderlyUSD;
  }
  
  if (program.maxTransferUSD > 0) {
    total = Math.min(total, program.maxTransferUSD);
  }
  
  return Number(total.toFixed(2));
}

/**
 * Creates simulated state branch with the CCT policy applied
 */
export function applyCCTToTwinState(
  state: TwinState,
  household: Household,
  program: CCTProgram,
  povertyLineUSD = 180,
  extremePovertyLineUSD = 95
): TwinState {
  const isEligible = checkEligibility(household, state, program, povertyLineUSD);
  const transferUSD = calculateTransferAmount(household, isEligible, program);
  
  // Productive integration boost
  let agBoost = 1.0;
  let financialAccessBoost = false;
  if (program.includesAgriculturalTraining) {
    agBoost += 0.12; // 12% agronomic productivity improvement
  }
  if (program.includesMicrocreditAccess) {
    financialAccessBoost = true;
  }
  
  const newAgIncome = Number((state.monthlyAgriculturalIncomeUSD * agBoost).toFixed(2));
  const newTotalIncome = Number((newAgIncome + state.monthlyNonAgriculturalIncomeUSD + transferUSD + state.monthlyRemittancesUSD).toFixed(2));
  const newPerCapitaIncome = Number((newTotalIncome / (household.size || 4)).toFixed(2));
  
  const isPoverty = newPerCapitaIncome < povertyLineUSD;
  const isExtreme = newPerCapitaIncome < extremePovertyLineUSD;
  const povertyGap = isPoverty ? (povertyLineUSD - newPerCapitaIncome) / povertyLineUSD : 0;
  const povertySeverity = Math.pow(povertyGap, 2);
  
  // Update human capital if conditions met
  const newHumanScore = Math.min(100, state.capitals.human.score + (program.educationCondition ? 6 : 2));
  const newFinancialScore = Math.min(100, Math.max(10, (newTotalIncome / 450) * 100));
  
  // Update deprivations
  const updatedDeprivations = {
    ...state.deprivations,
    schoolAttendance: program.educationCondition && isEligible ? false : state.deprivations.schoolAttendance,
    nutrition: newPerCapitaIncome > extremePovertyLineUSD ? false : state.deprivations.nutrition,
    assets: program.includesMicrocreditAccess && isEligible ? false : state.deprivations.assets,
  };
  
  const depScore = 
    (updatedDeprivations.nutrition ? 1/6 : 0) +
    (updatedDeprivations.childMortality ? 1/6 : 0) +
    (updatedDeprivations.yearsOfSchooling ? 1/6 : 0) +
    (updatedDeprivations.schoolAttendance ? 1/6 : 0) +
    (updatedDeprivations.cookingFuel ? 1/18 : 0) +
    (updatedDeprivations.sanitation ? 1/18 : 0) +
    (updatedDeprivations.drinkingWater ? 1/18 : 0) +
    (updatedDeprivations.electricity ? 1/18 : 0) +
    (updatedDeprivations.housing ? 1/18 : 0) +
    (updatedDeprivations.assets ? 1/18 : 0);
    
  const isMultiDimensionallyPoor = depScore >= 0.333;
  
  // Updated 5 Capitals
  const updatedCapitals = {
    ...state.capitals,
    human: {
      ...state.capitals.human,
      score: newHumanScore,
    },
    financial: {
      ...state.capitals.financial,
      monthlyIncomeUSD: newTotalIncome,
      score: newFinancialScore,
      accessToCredit: financialAccessBoost || state.capitals.financial.accessToCredit,
    },
  };
  
  const wHuman = 0.25;
  const wPhysical = 0.20;
  const wFinancial = 0.25;
  const wSocial = 0.15;
  const wNatural = 0.15;
  
  const rawResilience = 
    (updatedCapitals.human.score / 100) * wHuman +
    (updatedCapitals.physical.score / 100) * wPhysical +
    (updatedCapitals.financial.score / 100) * wFinancial +
    (updatedCapitals.social.score / 100) * wSocial +
    (updatedCapitals.natural.score / 100) * wNatural;
    
  const updatedResilience = Math.max(0.05, Math.min(1.0, Number(rawResilience.toFixed(4))));

  return {
    ...state,
    stateType: 'SIMULATED',
    scenarioId: program.id,
    timestamp: new Date().toISOString(),
    monthlyAgriculturalIncomeUSD: newAgIncome,
    monthlyCCTTransferUSD: transferUSD,
    monthlyTotalIncomeUSD: newTotalIncome,
    perCapitaIncomeUSD: newPerCapitaIncome,
    isPovertyFGT0: isPoverty,
    isExtremePovertyFGT0: isExtreme,
    povertyGap: Number(povertyGap.toFixed(4)),
    povertySeverity: Number(povertySeverity.toFixed(4)),
    deprivations: updatedDeprivations,
    deprivationScore: Number(depScore.toFixed(3)),
    isMultiDimensionallyPoor,
    capitals: updatedCapitals,
    resilienceScore: updatedResilience,
  };
}

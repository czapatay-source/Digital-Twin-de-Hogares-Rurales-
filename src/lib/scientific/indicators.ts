/**
 * Digital Livelihood Twin - Scientific Indicators Module
 * 
 * Formal Equations:
 * 1. Foster-Greer-Thorbecke (FGT) Poverty Indices:
 *    P_alpha = (1/N) * sum_{i=1}^{Q} ((z - y_i) / z)^alpha
 *    - alpha = 0: Headcount Ratio (Poverty Rate)
 *    - alpha = 1: Poverty Gap Index (Depth of Poverty)
 *    - alpha = 2: Poverty Severity / Squared Poverty Gap
 * 
 * 2. Alkire-Foster Multidimensional Poverty Index (MPI):
 *    MPI = H * A
 *    - H = q / N (Multidimensional Headcount Ratio with cutoff k)
 *    - A = sum_{i in Poor} c_i / (q * d) (Average Deprivation Intensity)
 * 
 * 3. Gini Coefficient of Inequality:
 *    G = sum_{i=1}^n sum_{j=1}^n |y_i - y_j| / (2 * n^2 * y_mean)
 * 
 * 4. DFID 5-Capitals Resilience Index:
 *    R_i = w_h*C_h + w_p*C_p + w_f*C_f + w_s*C_s + w_n*C_n in [0, 1]
 * 
 * 5. Policy Efficiency Score:
 *    PES = 0.35 * PovertyReductionRate + 0.25 * MPIImprovement + 0.20 * TargetingEfficiency - 0.20 * CostPerImpactNormal
 */

import { TwinState, MacroIndicators, CCTProgram, Country } from '../../types';

export const MPI_DIMENSION_WEIGHTS = {
  health: {
    nutrition: 1 / 6,
    childMortality: 1 / 6,
  },
  education: {
    yearsOfSchooling: 1 / 6,
    schoolAttendance: 1 / 6,
  },
  livingStandards: {
    cookingFuel: 1 / 18,
    sanitation: 1 / 18,
    drinkingWater: 1 / 18,
    electricity: 1 / 18,
    housing: 1 / 18,
    assets: 1 / 18,
  },
};

/**
 * Calculates FGT Poverty Index P_alpha for given incomes and poverty line z.
 */
export function calculateFGT(incomes: number[], povertyLineZ: number, alpha: 0 | 1 | 2): number {
  if (incomes.length === 0 || povertyLineZ <= 0) return 0;
  
  const N = incomes.length;
  let sum = 0;
  
  for (const y of incomes) {
    if (y < povertyLineZ) {
      const gap = (povertyLineZ - y) / povertyLineZ;
      if (alpha === 0) {
        sum += 1;
      } else if (alpha === 1) {
        sum += gap;
      } else if (alpha === 2) {
        sum += Math.pow(gap, 2);
      }
    }
  }
  
  return sum / N;
}

/**
 * Calculates Alkire-Foster Multidimensional Poverty Index (MPI = H * A)
 * @param states Array of TwinState
 * @param cutoffK Multidimensional poverty cutoff (standard is 0.333 or 1/3)
 */
export function calculateMPI(states: TwinState[], cutoffK = 0.333): { H: number; A: number; MPI: number } {
  if (states.length === 0) return { H: 0, A: 0, MPI: 0 };
  
  const N = states.length;
  let multidimensionallyPoorCount = 0;
  let totalDeprivationScoreOfPoor = 0;
  
  for (const state of states) {
    const c = state.deprivationScore;
    if (c >= cutoffK) {
      multidimensionallyPoorCount += 1;
      totalDeprivationScoreOfPoor += c;
    }
  }
  
  const H = multidimensionallyPoorCount / N;
  const A = multidimensionallyPoorCount > 0 ? totalDeprivationScoreOfPoor / multidimensionallyPoorCount : 0;
  const MPI = H * A;
  
  return {
    H: Number(H.toFixed(4)),
    A: Number(A.toFixed(4)),
    MPI: Number(MPI.toFixed(4)),
  };
}

/**
 * Calculates Gini Coefficient for income distribution
 */
export function calculateGini(incomes: number[]): number {
  if (incomes.length <= 1) return 0;
  
  const sorted = [...incomes].sort((a, b) => a - b);
  const n = sorted.length;
  let sumY = 0;
  let weightedSum = 0;
  
  for (let i = 0; i < n; i++) {
    const y = Math.max(0, sorted[i]);
    sumY += y;
    weightedSum += (i + 1) * y;
  }
  
  if (sumY === 0) return 0;
  
  const gini = (2 * weightedSum) / (n * sumY) - (n + 1) / n;
  return Math.max(0, Math.min(1, Number(gini.toFixed(4))));
}

/**
 * Calculates Palma Ratio (share of top 10% / share of bottom 40%)
 */
export function calculatePalmaRatio(incomes: number[]): number {
  if (incomes.length < 10) return 1.0;
  const sorted = [...incomes].sort((a, b) => a - b);
  const n = sorted.length;
  
  const bottom40Count = Math.floor(n * 0.4);
  const top10Count = Math.floor(n * 0.1);
  
  const totalIncome = sorted.reduce((a, b) => a + b, 0);
  if (totalIncome === 0) return 1.0;
  
  const bottom40Income = sorted.slice(0, bottom40Count).reduce((a, b) => a + b, 0);
  const top10Income = sorted.slice(n - top10Count).reduce((a, b) => a + b, 0);
  
  if (bottom40Income === 0) return 10.0;
  return Number((top10Income / bottom40Income).toFixed(2));
}

/**
 * Calculates Composite DFID 5-Capitals Resilience Score
 */
export function calculateResilienceScore(capitals: TwinState['capitals']): number {
  const wHuman = 0.25;
  const wPhysical = 0.20;
  const wFinancial = 0.25;
  const wSocial = 0.15;
  const wNatural = 0.15;
  
  const rawScore = 
    (capitals.human.score / 100) * wHuman +
    (capitals.physical.score / 100) * wPhysical +
    (capitals.financial.score / 100) * wFinancial +
    (capitals.social.score / 100) * wSocial +
    (capitals.natural.score / 100) * wNatural;
    
  return Math.max(0, Math.min(1, Number(rawScore.toFixed(4))));
}

/**
 * Computes complete macro indicators dataset from a list of TwinStates
 */
export function computeMacroIndicators(
  states: TwinState[],
  povertyLineUSD: number,
  extremePovertyLineUSD: number,
  program?: CCTProgram,
  baselineFgt0 = 0.35
): MacroIndicators {
  if (states.length === 0) {
    return {
      totalHouseholds: 0,
      totalIndividuals: 0,
      fgt0_headcountRatio: 0,
      fgt1_povertyGapIndex: 0,
      fgt2_povertySeverityIndex: 0,
      extremePovertyRate: 0,
      mpi_incidence_H: 0,
      mpi_intensity_A: 0,
      mpi_index: 0,
      giniCoefficient: 0,
      palmaRatio: 0,
      meanIncomeUSD: 0,
      medianIncomeUSD: 0,
      meanResilienceScore: 0,
      highVulnerabilityPercentage: 0,
      beneficiaryHouseholds: 0,
      coverageRatePct: 0,
      totalMonthlyCostUSD: 0,
      costPerBeneficiaryUSD: 0,
      costPerPovertyReductionUSD: 0,
      inclusionErrorPct: 0,
      exclusionErrorPct: 0,
      policyEfficiencyScore: 0,
    };
  }

  const incomesPerCapita = states.map((s) => s.perCapitaIncomeUSD);
  const totalHouseholds = states.length;
  const totalIndividuals = states.reduce((acc, s) => acc + (s.monthlyTotalIncomeUSD > 0 ? (s.monthlyTotalIncomeUSD / s.perCapitaIncomeUSD) : 4), 0);
  
  // FGT Measures
  const fgt0 = calculateFGT(incomesPerCapita, povertyLineUSD, 0);
  const fgt1 = calculateFGT(incomesPerCapita, povertyLineUSD, 1);
  const fgt2 = calculateFGT(incomesPerCapita, povertyLineUSD, 2);
  const extremePovertyRate = calculateFGT(incomesPerCapita, extremePovertyLineUSD, 0);
  
  // MPI
  const mpi = calculateMPI(states);
  
  // Inequality
  const gini = calculateGini(incomesPerCapita);
  const palma = calculatePalmaRatio(incomesPerCapita);
  
  const sortedIncomes = [...incomesPerCapita].sort((a, b) => a - b);
  const meanIncomeUSD = Number((incomesPerCapita.reduce((a, b) => a + b, 0) / totalHouseholds).toFixed(2));
  const medianIncomeUSD = Number(sortedIncomes[Math.floor(totalHouseholds / 2)].toFixed(2));
  
  // Resilience
  const resilienceScores = states.map((s) => s.resilienceScore);
  const meanResilienceScore = Number((resilienceScores.reduce((a, b) => a + b, 0) / totalHouseholds).toFixed(3));
  const highVulnerabilityCount = states.filter((s) => s.resilienceScore < 0.38).length;
  const highVulnerabilityPercentage = Number(((highVulnerabilityCount / totalHouseholds) * 100).toFixed(1));
  
  // CCT Performance
  const beneficiaries = states.filter((s) => s.monthlyCCTTransferUSD > 0);
  const beneficiaryCount = beneficiaries.length;
  const coverageRatePct = Number(((beneficiaryCount / totalHouseholds) * 100).toFixed(1));
  
  const directTransfersUSD = states.reduce((acc, s) => acc + s.monthlyCCTTransferUSD, 0);
  const adminMultiplier = program ? 1 + (program.adminCostPercentage / 100) : 1.08;
  const totalMonthlyCostUSD = Number((directTransfersUSD * adminMultiplier).toFixed(2));
  
  const costPerBeneficiaryUSD = beneficiaryCount > 0 ? Number((totalMonthlyCostUSD / beneficiaryCount).toFixed(2)) : 0;
  
  // Targeting errors:
  // Inclusion error: Household is NOT poor by observed pre-transfer standard, but received transfer
  // Exclusion error: Household IS poor by observed pre-transfer standard, but received NO transfer
  let inclusionCount = 0;
  let exclusionCount = 0;
  let poorHouseholdsCount = 0;
  
  for (const s of states) {
    const isPreTransferPoor = (s.monthlyTotalIncomeUSD - s.monthlyCCTTransferUSD) / (s.monthlyTotalIncomeUSD / s.perCapitaIncomeUSD || 4) < povertyLineUSD;
    if (isPreTransferPoor) {
      poorHouseholdsCount += 1;
      if (s.monthlyCCTTransferUSD === 0) exclusionCount += 1;
    } else {
      if (s.monthlyCCTTransferUSD > 0) inclusionCount += 1;
    }
  }
  
  const nonPoorCount = totalHouseholds - poorHouseholdsCount;
  const inclusionErrorPct = nonPoorCount > 0 ? Number(((inclusionCount / nonPoorCount) * 100).toFixed(1)) : 0;
  const exclusionErrorPct = poorHouseholdsCount > 0 ? Number(((exclusionCount / poorHouseholdsCount) * 100).toFixed(1)) : 0;
  
  const povertyReduction = Math.max(0, baselineFgt0 - fgt0);
  const householdsLifted = Math.round(povertyReduction * totalHouseholds);
  const costPerPovertyReductionUSD = householdsLifted > 0 ? Number(((totalMonthlyCostUSD * 12) / householdsLifted).toFixed(2)) : 0;
  
  // Policy Efficiency Score (0-100)
  const povertyScore = Math.min(100, (povertyReduction / (baselineFgt0 || 0.35)) * 100);
  const targetingScore = Math.max(0, 100 - (inclusionErrorPct * 0.5 + exclusionErrorPct * 0.5));
  const mpiScore = Math.min(100, (1 - mpi.MPI) * 100);
  const resilienceScoreComponent = meanResilienceScore * 100;
  
  const rawEfficiency = (povertyScore * 0.35) + (targetingScore * 0.25) + (mpiScore * 0.20) + (resilienceScoreComponent * 0.20);
  const policyEfficiencyScore = Number(Math.max(0, Math.min(100, rawEfficiency)).toFixed(1));

  return {
    totalHouseholds,
    totalIndividuals: Math.round(totalIndividuals),
    fgt0_headcountRatio: Number((fgt0 * 100).toFixed(2)),
    fgt1_povertyGapIndex: Number((fgt1 * 100).toFixed(2)),
    fgt2_povertySeverityIndex: Number((fgt2 * 100).toFixed(2)),
    extremePovertyRate: Number((extremePovertyRate * 100).toFixed(2)),
    mpi_incidence_H: Number((mpi.H * 100).toFixed(2)),
    mpi_intensity_A: Number((mpi.A * 100).toFixed(2)),
    mpi_index: mpi.MPI,
    giniCoefficient: gini,
    palmaRatio: palma,
    meanIncomeUSD,
    medianIncomeUSD,
    meanResilienceScore,
    highVulnerabilityPercentage,
    beneficiaryHouseholds: beneficiaryCount,
    coverageRatePct,
    totalMonthlyCostUSD,
    costPerBeneficiaryUSD,
    costPerPovertyReductionUSD,
    inclusionErrorPct,
    exclusionErrorPct,
    policyEfficiencyScore,
  };
}

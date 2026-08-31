/**
 * Digital Livelihood Twin - Behavioral Economics & Prospect Theory Engine
 * 
 * Theoretical Framework:
 * - Kahneman & Tversky (1979) Cumulative Prospect Theory
 *   Value function:
 *     v(x) = x^alpha           if x >= 0 (Gains)
 *     v(x) = -lambda * (-x)^beta if x < 0 (Losses)
 *   Standard empirical calibrations (Tversky & Kahneman 1992):
 *     alpha = 0.88, beta = 0.88, lambda = 2.25 (Loss aversion parameter)
 * 
 * - Decision weighting function:
 *     w(p) = p^gamma / (p^gamma + (1-p)^gamma)^(1/gamma)
 *     gamma = 0.61 for gains, 0.69 for losses
 */

import { TwinState, CCTProgram } from '../../types';

export interface ProspectTheoryParameters {
  alpha: number; // Diminishing sensitivity for gains (0.88)
  beta: number;  // Diminishing sensitivity for losses (0.88)
  lambda: number; // Loss aversion multiplier (2.25)
  gammaGains: number; // 0.61
  gammaLosses: number; // 0.69
}

export const DEFAULT_PROSPECT_THEORY_PARAMS: ProspectTheoryParameters = {
  alpha: 0.88,
  beta: 0.88,
  lambda: 2.25,
  gammaGains: 0.61,
  gammaLosses: 0.69,
};

/**
 * Computes subjective value v(x) under reference-dependent Prospect Theory
 * @param deltaX Outcome relative to reference point (e.g., minimum subsistence or previous income)
 * @param params PT parameters
 */
export function prospectValueFunction(
  deltaX: number,
  params: ProspectTheoryParameters = DEFAULT_PROSPECT_THEORY_PARAMS
): number {
  if (deltaX >= 0) {
    return Math.pow(deltaX, params.alpha);
  } else {
    return -params.lambda * Math.pow(-deltaX, params.beta);
  }
}

/**
 * Probability weighting function
 */
export function prospectProbabilityWeight(
  p: number,
  isGain = true,
  params: ProspectTheoryParameters = DEFAULT_PROSPECT_THEORY_PARAMS
): number {
  const gamma = isGain ? params.gammaGains : params.gammaLosses;
  const pGamma = Math.pow(p, gamma);
  const denominator = Math.pow(pGamma + Math.pow(1 - p, gamma), 1 / gamma);
  return pGamma / denominator;
}

/**
 * Simulates microeconomic household decisions in response to income, CCT, and climate risk:
 * 1. Consumption decision (subsistence food vs non-food)
 * 2. Precautionary savings based on subjective loss aversion
 * 3. Human capital investment (school attendance / health compliance)
 * 4. Labor allocation (farm vs off-farm diversification)
 */
export function simulateHouseholdDecisions(
  state: TwinState,
  cctTransferUSD: number,
  climateRiskScore: number, // 0 to 1
  program?: CCTProgram,
  params: ProspectTheoryParameters = DEFAULT_PROSPECT_THEORY_PARAMS
): {
  consumptionUSD: number;
  foodConsumptionUSD: number;
  savingsDeltaUSD: number;
  educationInvestmentUSD: number;
  schoolCompliance: boolean;
  healthCompliance: boolean;
  laborOffFarmShare: number;
} {
  const totalAvailableIncome = state.monthlyAgriculturalIncomeUSD + state.monthlyNonAgriculturalIncomeUSD + cctTransferUSD + state.monthlyRemittancesUSD;
  const householdSize = state.capitals.human.workingAgeMembers + state.capitals.human.dependencyRatio * state.capitals.human.workingAgeMembers || 4;
  const subsistenceLevel = householdSize * 45; // ~$45 per person/month for extreme food subsistence
  
  // Reference point is basic subsistence
  const surplus = totalAvailableIncome - subsistenceLevel;
  
  // Subjective evaluation of potential climate shock loss
  const potentialLoss = state.monthlyAgriculturalIncomeUSD * climateRiskScore * 0.5;
  const subjectiveLossValue = prospectValueFunction(-potentialLoss, params);
  
  // Savings propensity increases with loss aversion and climate risk
  const lossFearFactor = Math.min(0.35, (Math.abs(subjectiveLossValue) / (totalAvailableIncome + 1)) * 0.05);
  const marginalPropensityToSave = Math.max(0.05, Math.min(0.30, 0.08 + lossFearFactor));
  
  let savingsDeltaUSD = 0;
  let consumptionUSD = 0;
  
  if (surplus > 0) {
    savingsDeltaUSD = surplus * marginalPropensityToSave;
    consumptionUSD = subsistenceLevel + (surplus - savingsDeltaUSD);
  } else {
    // Deficit spending / dissaving
    consumptionUSD = Math.max(totalAvailableIncome * 0.95, subsistenceLevel * 0.85);
    savingsDeltaUSD = -(consumptionUSD - totalAvailableIncome);
  }
  
  // Food vs Non-food Engel Curve (lower income spends higher share on food)
  const foodShare = Math.max(0.40, Math.min(0.75, 0.72 - (consumptionUSD / (householdSize * 200)) * 0.25));
  const foodConsumptionUSD = consumptionUSD * foodShare;
  
  // Human capital / CCT compliance decision
  let educationInvestmentUSD = Math.max(5, (consumptionUSD - foodConsumptionUSD) * 0.2);
  let schoolCompliance = true;
  let healthCompliance = true;
  
  if (program && program.educationCondition) {
    // If receiving CCT with condition, opportunity cost of child labor is offset by transfer
    const cctIncentive = cctTransferUSD > 20 ? 0.95 : 0.75;
    schoolCompliance = Math.random() < cctIncentive;
    if (schoolCompliance) {
      educationInvestmentUSD += Math.min(25, cctTransferUSD * 0.2);
    }
  }
  
  if (program && program.healthCondition) {
    healthCompliance = true;
  }
  
  // Labor allocation: When climate risk is elevated, diversify away from pure agriculture
  const baseOffFarm = state.monthlyNonAgriculturalIncomeUSD / (totalAvailableIncome + 1);
  const laborOffFarmShare = Math.max(0.1, Math.min(0.8, baseOffFarm + climateRiskScore * 0.25));
  
  return {
    consumptionUSD: Number(consumptionUSD.toFixed(2)),
    foodConsumptionUSD: Number(foodConsumptionUSD.toFixed(2)),
    savingsDeltaUSD: Number(savingsDeltaUSD.toFixed(2)),
    educationInvestmentUSD: Number(educationInvestmentUSD.toFixed(2)),
    schoolCompliance,
    healthCompliance,
    laborOffFarmShare: Number(laborOffFarmShare.toFixed(2)),
  };
}

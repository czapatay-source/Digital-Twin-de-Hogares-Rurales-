/**
 * Digital Livelihood Twin - Climate Engine & Shock Propagation
 * 
 * Formal shock propagation chain:
 * 1. Shock Intensity (S in [0, 1]) & Duration (D months)
 * 2. Crop Yield Factor:
 *      Y = Y_base * (1 - 0.45 * S_drought - 0.35 * S_flood - 0.40 * S_frost)
 * 3. Agricultural Output Value:
 *      V_ag = V_base * Y * (1 - 0.15 * LivestockMortality)
 * 4. Agricultural Household Income:
 *      I_ag = max(0, V_ag - FixedCosts)
 * 5. Food Security Index:
 *      FSI = min(100, max(0, (I_total / Subsistence) * 60 + NaturalCapital * 0.4))
 * 6. Downstream impact on 5 Capitals & Resilience Score.
 */

import { ClimateShock, ShockType, TwinState } from '../../types';

export function createClimateShock(
  shockType: ShockType,
  intensity = 0.5,
  durationMonths = 6,
  regionId = 'REG-01'
): ClimateShock {
  let tempAnomaly = 0;
  let rainAnomaly = 0;
  let soilMoistureDeficit = 0;
  let cropYieldImpactFactor = 1.0;
  let livestockMortalityRate = 0.0;
  
  switch (shockType) {
    case 'DROUGHT':
      tempAnomaly = 1.5 * intensity;
      rainAnomaly = -45 * intensity; // -45% rainfall
      soilMoistureDeficit = 55 * intensity;
      cropYieldImpactFactor = Math.max(0.2, 1.0 - 0.45 * intensity);
      livestockMortalityRate = 0.08 * intensity;
      break;
      
    case 'EXTREME_DROUGHT':
      tempAnomaly = 3.2 * intensity;
      rainAnomaly = -75 * intensity;
      soilMoistureDeficit = 85 * intensity;
      cropYieldImpactFactor = Math.max(0.1, 1.0 - 0.70 * intensity);
      livestockMortalityRate = 0.20 * intensity;
      break;
      
    case 'HEAVY_RAINFALL':
      tempAnomaly = -0.5 * intensity;
      rainAnomaly = 110 * intensity; // +110% rainfall / flooding
      soilMoistureDeficit = 0;
      cropYieldImpactFactor = Math.max(0.3, 1.0 - 0.40 * intensity); // flood crop loss
      livestockMortalityRate = 0.05 * intensity;
      break;
      
    case 'FROST':
      tempAnomaly = -6.0 * intensity;
      rainAnomaly = -10 * intensity;
      soilMoistureDeficit = 10 * intensity;
      cropYieldImpactFactor = Math.max(0.25, 1.0 - 0.55 * intensity);
      livestockMortalityRate = 0.12 * intensity;
      break;
      
    case 'CUSTOM':
      tempAnomaly = 2.0 * intensity;
      rainAnomaly = -50 * intensity;
      soilMoistureDeficit = 60 * intensity;
      cropYieldImpactFactor = Math.max(0.2, 1.0 - 0.5 * intensity);
      livestockMortalityRate = 0.10 * intensity;
      break;
      
    case 'NORMAL':
    default:
      tempAnomaly = 0;
      rainAnomaly = 0;
      soilMoistureDeficit = 0;
      cropYieldImpactFactor = 1.0;
      livestockMortalityRate = 0.0;
      break;
  }
  
  return {
    id: `SHOCK-${Date.now()}-${shockType}`,
    regionId,
    shockType,
    intensity,
    durationMonths,
    temperatureAnomalyC: Number(tempAnomaly.toFixed(1)),
    rainfallAnomalyPct: Number(rainAnomaly.toFixed(1)),
    soilMoistureDeficitPct: Number(soilMoistureDeficit.toFixed(1)),
    startDate: new Date().toISOString().split('T')[0],
    cropYieldImpactFactor: Number(cropYieldImpactFactor.toFixed(3)),
    livestockMortalityRate: Number(livestockMortalityRate.toFixed(3)),
  };
}

/**
 * Propagates climate shock through household livelihood system
 */
export function propagateClimateShockToTwin(
  state: TwinState,
  shock: ClimateShock,
  povertyLineUSD = 180,
  extremePovertyLineUSD = 95
): TwinState {
  if (shock.shockType === 'NORMAL' || shock.intensity === 0) {
    return state;
  }
  
  // 1. Crop yield degradation
  const newAgIncome = Math.max(0, state.monthlyAgriculturalIncomeUSD * shock.cropYieldImpactFactor);
  
  // 2. Natural capital degradation
  const soilImpact = shock.intensity * 25;
  const waterImpact = shock.shockType.includes('DROUGHT') ? shock.intensity * 40 : 10;
  const newSoilQuality = Math.max(10, state.capitals.natural.soilQualityIndex - soilImpact);
  const newWaterAvail = Math.max(5, state.capitals.natural.waterAvailabilityIndex - waterImpact);
  const newLivestock = Math.max(0, state.capitals.natural.livestockUnits * (1 - shock.livestockMortalityRate));
  
  const updatedNaturalScore = Math.max(
    5,
    Math.min(100, (newSoilQuality * 0.35 + newWaterAvail * 0.35 + (newLivestock / 5) * 30))
  );
  
  // 3. Financial updates
  const newTotalIncome = newAgIncome + state.monthlyNonAgriculturalIncomeUSD + state.monthlyCCTTransferUSD + state.monthlyRemittancesUSD;
  const householdSize = state.monthlyTotalIncomeUSD > 0 ? (state.monthlyTotalIncomeUSD / state.perCapitaIncomeUSD) : 4;
  const newPerCapitaIncome = Number((newTotalIncome / (householdSize || 4)).toFixed(2));
  
  // 4. Food security & consumption
  const subsistenceReq = householdSize * 45;
  const newFoodSecurityIndex = Math.min(
    100,
    Math.max(10, Number(((newTotalIncome / subsistenceReq) * 55 + (updatedNaturalScore * 0.45)).toFixed(1)))
  );
  
  // 5. Poverty check
  const isPoverty = newPerCapitaIncome < povertyLineUSD;
  const isExtreme = newPerCapitaIncome < extremePovertyLineUSD;
  const povertyGap = isPoverty ? (povertyLineUSD - newPerCapitaIncome) / povertyLineUSD : 0;
  const povertySeverity = Math.pow(povertyGap, 2);
  
  // 6. Deprivations (Nutrition deprivation triggers if food security < 45)
  const updatedDeprivations = {
    ...state.deprivations,
    nutrition: newFoodSecurityIndex < 45 ? true : state.deprivations.nutrition,
    assets: shock.intensity > 0.7 ? true : state.deprivations.assets,
  };
  
  // Recalculate deprivation score c
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
  
  // 7. Update Resilience
  const updatedCapitals = {
    ...state.capitals,
    financial: {
      ...state.capitals.financial,
      monthlyIncomeUSD: newTotalIncome,
      score: Math.max(5, Math.min(100, (newTotalIncome / 400) * 100)),
    },
    natural: {
      ...state.capitals.natural,
      soilQualityIndex: newSoilQuality,
      waterAvailabilityIndex: newWaterAvail,
      livestockUnits: newLivestock,
      score: updatedNaturalScore,
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
    monthlyAgriculturalIncomeUSD: Number(newAgIncome.toFixed(2)),
    monthlyTotalIncomeUSD: Number(newTotalIncome.toFixed(2)),
    perCapitaIncomeUSD: newPerCapitaIncome,
    foodSecurityIndex: newFoodSecurityIndex,
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

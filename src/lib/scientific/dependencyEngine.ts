/**
 * Digital Livelihood Twin - Reactive Dependency Engine & State Manager
 * 
 * Invariants:
 * 1. OBSERVED STATE IS IMMUTABLE: It represents verified ground truth.
 * 2. WHAT-IF & SCENARIOS CREATE VIRTUAL BRANCHES.
 * 3. REACTIVE GRAPH: Modifying an antecedent variable (e.g. agricultural income, climate shock, CCT transfer)
 *    triggers an exact topological recalculation of all downstream economic and deprivation indicators.
 */

import { TwinState, Household, RecalculationDiff, AuditLogEntry } from '../../types';

export type EventType = 
  | 'HOUSEHOLD_UPDATED' 
  | 'INCOME_CHANGED' 
  | 'CLIMATE_UPDATED' 
  | 'POLICY_CHANGED' 
  | 'SIMULATION_COMPLETED' 
  | 'RECALCULATION_TRIGGERED';

export type EventHandler = (payload: any) => void;

export class EventBus {
  private static listeners: Record<string, EventHandler[]> = {};

  static subscribe(event: EventType, handler: EventHandler): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
    return () => {
      this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
    };
  }

  static publish(event: EventType, payload: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((handler) => {
        try {
          handler(payload);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }
}

/**
 * Executes reactive recalculation of a household twin state given an altered variable.
 */
export function recalculateTwin(
  currentState: TwinState,
  household: Household,
  changedVariable: string,
  newValue: number | boolean,
  povertyLineUSD = 180,
  extremePovertyLineUSD = 95
): { newState: TwinState; diff: RecalculationDiff } {
  const oldState = { ...currentState };
  let state = { ...currentState, timestamp: new Date().toISOString() };
  
  // 1. Apply primary change
  switch (changedVariable) {
    case 'monthlyAgriculturalIncomeUSD':
      state.monthlyAgriculturalIncomeUSD = Number(newValue);
      break;
    case 'monthlyNonAgriculturalIncomeUSD':
      state.monthlyNonAgriculturalIncomeUSD = Number(newValue);
      break;
    case 'monthlyCCTTransferUSD':
      state.monthlyCCTTransferUSD = Number(newValue);
      break;
    case 'monthlyRemittancesUSD':
      state.monthlyRemittancesUSD = Number(newValue);
      break;
    case 'landHectares':
      state.capitals.natural.landHectares = Number(newValue);
      break;
    case 'livestockUnits':
      state.capitals.natural.livestockUnits = Number(newValue);
      break;
    default:
      break;
  }
  
  // 2. Cascade 1: Total income
  state.monthlyTotalIncomeUSD = Number((
    state.monthlyAgriculturalIncomeUSD +
    state.monthlyNonAgriculturalIncomeUSD +
    state.monthlyCCTTransferUSD +
    state.monthlyRemittancesUSD
  ).toFixed(2));
  
  // 3. Cascade 2: Per capita income
  const size = household.size || 4;
  state.perCapitaIncomeUSD = Number((state.monthlyTotalIncomeUSD / size).toFixed(2));
  
  // 4. Cascade 3: FGT Poverty metrics
  state.isPovertyFGT0 = state.perCapitaIncomeUSD < povertyLineUSD;
  state.isExtremePovertyFGT0 = state.perCapitaIncomeUSD < extremePovertyLineUSD;
  state.povertyGap = state.isPovertyFGT0 ? Number(((povertyLineUSD - state.perCapitaIncomeUSD) / povertyLineUSD).toFixed(4)) : 0;
  state.povertySeverity = Number(Math.pow(state.povertyGap, 2).toFixed(4));
  
  // 5. Cascade 4: Food Security Index & Nutrition Deprivation
  const subsistence = size * 45;
  state.foodSecurityIndex = Math.min(100, Math.max(10, Number(((state.monthlyTotalIncomeUSD / subsistence) * 60 + state.capitals.natural.score * 0.4).toFixed(1))));
  
  const updatedDeprivations = {
    ...state.deprivations,
    nutrition: state.foodSecurityIndex < 45,
  };
  state.deprivations = updatedDeprivations;
  
  // 6. Cascade 5: Deprivation score & MPI status
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
    
  state.deprivationScore = Number(depScore.toFixed(3));
  state.isMultiDimensionallyPoor = state.deprivationScore >= 0.333;
  
  // 7. Cascade 6: 5 Capitals Financial score & Composite Resilience
  const financialScore = Math.min(100, Math.max(5, (state.monthlyTotalIncomeUSD / 450) * 100));
  state.capitals = {
    ...state.capitals,
    financial: {
      ...state.capitals.financial,
      monthlyIncomeUSD: state.monthlyTotalIncomeUSD,
      score: Number(financialScore.toFixed(1)),
    },
  };
  
  const wHuman = 0.25;
  const wPhysical = 0.20;
  const wFinancial = 0.25;
  const wSocial = 0.15;
  const wNatural = 0.15;
  
  const rawResilience = 
    (state.capitals.human.score / 100) * wHuman +
    (state.capitals.physical.score / 100) * wPhysical +
    (state.capitals.financial.score / 100) * wFinancial +
    (state.capitals.social.score / 100) * wSocial +
    (state.capitals.natural.score / 100) * wNatural;
    
  state.resilienceScore = Math.max(0.05, Math.min(1.0, Number(rawResilience.toFixed(4))));

  // Construct audit diff
  const diff: RecalculationDiff = {
    twinId: state.twinId,
    changedVariable,
    oldValue: (oldState as any)[changedVariable] ?? 'N/A',
    newValue,
    affectedVariables: {
      monthlyTotalIncomeUSD: { old: oldState.monthlyTotalIncomeUSD, new: state.monthlyTotalIncomeUSD },
      perCapitaIncomeUSD: { old: oldState.perCapitaIncomeUSD, new: state.perCapitaIncomeUSD },
      isPovertyFGT0: { old: oldState.isPovertyFGT0, new: state.isPovertyFGT0 },
      povertyGap: { old: oldState.povertyGap, new: state.povertyGap },
      deprivationScore: { old: oldState.deprivationScore, new: state.deprivationScore },
      isMultiDimensionallyPoor: { old: oldState.isMultiDimensionallyPoor, new: state.isMultiDimensionallyPoor },
      resilienceScore: { old: oldState.resilienceScore, new: state.resilienceScore },
    },
    timestamp: new Date().toISOString(),
  };

  EventBus.publish('RECALCULATION_TRIGGERED', diff);
  return { newState: state, diff };
}

/**
 * Digital Livelihood Twin - Simulation Engine (Monte Carlo & ABM Runner)
 * 
 * Executes agent-based policy evaluations with:
 * - Multi-period time horizons (12 - 36 months)
 * - Stochastic climate shocks
 * - Behavioral Prospect Theory agent micro-decisions
 * - Confidence intervals (5th, 50th, 95th percentiles) across replicas
 */

import { CCTProgram, ClimateShock, DigitalTwin, Household, MacroIndicators, SimulationResult, TwinState } from '../../types';
import { applyCCTToTwinState } from './cctEngine';
import { propagateClimateShockToTwin } from './climateEngine';
import { computeMacroIndicators } from './indicators';
import { simulateHouseholdDecisions } from './prospectTheory';
import { createRNG } from './syntheticGenerator';

export class SimulationEngine {
  /**
   * Runs a complete Monte Carlo multi-agent simulation
   */
  static runSimulation(
    twins: DigitalTwin[],
    households: Household[],
    program: CCTProgram,
    climateShock?: ClimateShock,
    stepsCount = 12,
    replicasCount = 50,
    seed = 1234,
    povertyLineUSD = 180,
    extremePovertyLineUSD = 95
  ): SimulationResult {
    const hhMap = new Map<string, Household>();
    households.forEach((h) => hhMap.set(h.id, h));

    const baselineStates = twins.map((t) => t.observedState);
    const baselineIndicators = computeMacroIndicators(baselineStates, povertyLineUSD, extremePovertyLineUSD, undefined);

    const fgt0Replicas: number[] = [];
    const mpiReplicas: number[] = [];
    const giniReplicas: number[] = [];
    const resilienceReplicas: number[] = [];
    const costReplicas: number[] = [];

    const trajectorySum = Array.from({ length: stepsCount }, (_, idx) => ({
      step: idx + 1,
      month: `Mes ${idx + 1}`,
      povertyRate: 0,
      mpiIndex: 0,
      meanIncomeUSD: 0,
      meanResilience: 0,
      beneficiaries: 0,
      totalCostUSD: 0,
    }));

    let lastSimulatedStates: TwinState[] = [];

    // Run Monte Carlo replicas
    for (let r = 0; r < replicasCount; r++) {
      const replicaRNG = createRNG(seed + r * 1000);
      let currentStates: TwinState[] = twins.map((t) => ({ ...t.observedState }));

      for (let step = 0; step < stepsCount; step++) {
        const stepStates: TwinState[] = [];
        
        // Check if climate shock hits during this step
        const isShockActive = climateShock && climateShock.shockType !== 'NORMAL' && step < (climateShock.durationMonths || 6);

        for (let i = 0; i < currentStates.length; i++) {
          const prevState = currentStates[i];
          const hh = hhMap.get(prevState.householdId);
          if (!hh) {
            stepStates.push(prevState);
            continue;
          }

          // 1. Apply CCT Policy
          let stateAfterPolicy = applyCCTToTwinState(prevState, hh, program, povertyLineUSD, extremePovertyLineUSD);

          // 2. Apply Climate Shock if active
          if (isShockActive && climateShock) {
            stateAfterPolicy = propagateClimateShockToTwin(stateAfterPolicy, climateShock, povertyLineUSD, extremePovertyLineUSD);
          }

          // 3. Behavioral Agent Decisions (Prospect Theory)
          const decisions = simulateHouseholdDecisions(
            stateAfterPolicy,
            stateAfterPolicy.monthlyCCTTransferUSD,
            isShockActive ? (climateShock?.intensity || 0.5) : 0.1,
            program
          );

          // Dynamic update of savings & capital
          const updatedSavings = Math.max(0, stateAfterPolicy.savingsUSD + decisions.savingsDeltaUSD);
          const stateAfterDecisions: TwinState = {
            ...stateAfterPolicy,
            savingsUSD: updatedSavings,
            monthlyExpenditureUSD: decisions.consumptionUSD,
            foodExpenditureUSD: decisions.foodConsumptionUSD,
            capitals: {
              ...stateAfterPolicy.capitals,
              financial: {
                ...stateAfterPolicy.capitals.financial,
                savingsUSD: updatedSavings,
              },
            },
          };

          stepStates.push(stateAfterDecisions);
        }

        currentStates = stepStates;

        // Accumulate trajectory metrics
        const stepInd = computeMacroIndicators(stepStates, povertyLineUSD, extremePovertyLineUSD, program, baselineIndicators.fgt0_headcountRatio / 100);
        trajectorySum[step].povertyRate += stepInd.fgt0_headcountRatio;
        trajectorySum[step].mpiIndex += stepInd.mpi_index;
        trajectorySum[step].meanIncomeUSD += stepInd.meanIncomeUSD;
        trajectorySum[step].meanResilience += stepInd.meanResilienceScore;
        trajectorySum[step].beneficiaries += stepInd.beneficiaryHouseholds;
        trajectorySum[step].totalCostUSD += stepInd.totalMonthlyCostUSD;
      }

      // Collect end-of-horizon indicators for replica
      const endIndicators = computeMacroIndicators(currentStates, povertyLineUSD, extremePovertyLineUSD, program, baselineIndicators.fgt0_headcountRatio / 100);
      fgt0Replicas.push(endIndicators.fgt0_headcountRatio);
      mpiReplicas.push(endIndicators.mpi_index);
      giniReplicas.push(endIndicators.giniCoefficient);
      resilienceReplicas.push(endIndicators.meanResilienceScore);
      costReplicas.push(endIndicators.totalMonthlyCostUSD);

      if (r === replicasCount - 1) {
        lastSimulatedStates = currentStates;
      }
    }

    // Sort replicas to extract percentiles (p5, p50, p95)
    const getPercentiles = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const n = sorted.length;
      return {
        p5: Number(sorted[Math.floor(n * 0.05)].toFixed(2)),
        p50: Number(sorted[Math.floor(n * 0.50)].toFixed(2)),
        p95: Number(sorted[Math.floor(n * 0.95)].toFixed(2)),
      };
    };

    const simulatedIndicators = computeMacroIndicators(
      lastSimulatedStates,
      povertyLineUSD,
      extremePovertyLineUSD,
      program,
      baselineIndicators.fgt0_headcountRatio / 100
    );

    const timeSeriesTrajectory = trajectorySum.map((t) => ({
      step: t.step,
      month: t.month,
      povertyRate: Number((t.povertyRate / replicasCount).toFixed(2)),
      mpiIndex: Number((t.mpiIndex / replicasCount).toFixed(3)),
      meanIncomeUSD: Number((t.meanIncomeUSD / replicasCount).toFixed(2)),
      meanResilience: Number((t.meanResilience / replicasCount).toFixed(3)),
      beneficiaries: Math.round(t.beneficiaries / replicasCount),
      totalCostUSD: Number((t.totalCostUSD / replicasCount).toFixed(2)),
    }));

    return {
      id: `SIM-${Date.now()}-${program.scenarioType}`,
      scenarioId: program.id,
      scenarioName: program.name,
      status: 'COMPLETED',
      randomSeed: seed,
      stepsCount,
      replicasCount,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      baselineIndicators,
      simulatedIndicators,
      confidenceIntervals: {
        fgt0: getPercentiles(fgt0Replicas),
        mpi: getPercentiles(mpiReplicas),
        gini: getPercentiles(giniReplicas),
        resilience: getPercentiles(resilienceReplicas),
        cost: getPercentiles(costReplicas),
      },
      timeSeriesTrajectory,
    };
  }
}

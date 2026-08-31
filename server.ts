/**
 * Digital Livelihood Twin (DLT) - Backend API Server
 * 
 * Exposes REST API endpoints for:
 * - Digital Twins & Household Microdata
 * - Climate Engine & Shock Ingestion
 * - CCT Policy Simulator & Scenario Comparison
 * - Indicators (FGT, MPI, Gini, Resilience, PES)
 * - Bayesian Calibration (ABC)
 * - Reports & Audit Logs
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { AppDataStore } from './src/lib/store';
import { CCTScenarioFactory } from './src/lib/scientific/cctEngine';
import { createClimateShock } from './src/lib/scientific/climateEngine';
import { ABCCalibrator } from './src/lib/scientific/abcCalibrator';
import { computeMacroIndicators } from './src/lib/scientific/indicators';
import { COUNTRIES_CONFIG, SyntheticDataGenerator } from './src/lib/scientific/syntheticGenerator';
import { CountryCode } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize in-memory scientific data store
  AppDataStore.initialize();

  // ----------------------------------------------------
  // API Routes (FIRST)
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      system: 'Digital Livelihood Twin (DLT)',
      version: '2.1.0-Q1',
      theoreticalFrameworks: [
        'DFID Sustainable Livelihoods Framework (1999)',
        'Kahneman & Tversky Prospect Theory (1979)',
        'Foster-Greer-Thorbecke Poverty Indices (1984)',
        'Alkire-Foster Multidimensional Poverty Index (2011)',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // Country metadata
  app.get('/api/countries', (req: Request, res: Response) => {
    res.json({
      activeCountry: AppDataStore.getActiveCountry(),
      countries: COUNTRIES_CONFIG,
    });
  });

  app.post('/api/countries/select', (req: Request, res: Response) => {
    const { countryCode } = req.body;
    if (countryCode && COUNTRIES_CONFIG[countryCode as CountryCode]) {
      AppDataStore.setActiveCountry(countryCode as CountryCode);
      res.json({ success: true, activeCountry: countryCode });
    } else {
      res.status(400).json({ error: 'Invalid country code' });
    }
  });

  // Digital Twins
  app.get('/api/twins', (req: Request, res: Response) => {
    const country = (req.query.country as CountryCode) || AppDataStore.getActiveCountry();
    const twins = AppDataStore.getDigitalTwins(country);
    res.json({
      country,
      total: twins.length,
      twins,
    });
  });

  app.get('/api/twins/:id', (req: Request, res: Response) => {
    const twin = AppDataStore.getDigitalTwinById(req.params.id);
    if (twin) {
      const hh = AppDataStore.getHouseholdById(twin.householdId);
      res.json({ twin, household: hh });
    } else {
      res.status(404).json({ error: 'Digital Twin not found' });
    }
  });

  // Reactive Recalculation Endpoint
  app.post('/api/twins/:id/recalculate', (req: Request, res: Response) => {
    const { variable, value } = req.body;
    if (!variable || value === undefined) {
      return res.status(400).json({ error: 'Missing variable or value in request' });
    }
    const result = AppDataStore.performReactiveRecalculation(req.params.id, variable, value);
    if (result) {
      res.json({
        success: true,
        diff: result.diff,
        updatedTwin: result.twin,
      });
    } else {
      res.status(404).json({ error: 'Twin or household not found' });
    }
  });

  // Households Microdata
  app.get('/api/households', (req: Request, res: Response) => {
    const country = (req.query.country as CountryCode) || AppDataStore.getActiveCountry();
    const households = AppDataStore.getHouseholds(country);
    res.json({
      country,
      total: households.length,
      households,
    });
  });

  // Climate Engine
  app.get('/api/climate/conditions', (req: Request, res: Response) => {
    const shock = AppDataStore.getActiveClimateShock();
    res.json({ currentShock: shock });
  });

  app.post('/api/climate/shock', (req: Request, res: Response) => {
    const { shockType, intensity, durationMonths, regionId } = req.body;
    const shock = createClimateShock(shockType || 'DROUGHT', intensity ?? 0.5, durationMonths ?? 6, regionId || 'REG-01');
    AppDataStore.setClimateShock(shock);
    res.json({ success: true, activeShock: shock });
  });

  // CCT Policies
  app.get('/api/policies/scenarios', (req: Request, res: Response) => {
    res.json({
      activeScenario: AppDataStore.getActiveScenario(),
      presetScenarios: [
        CCTScenarioFactory.baseline(),
        CCTScenarioFactory.scenarioAUniversal(50),
        CCTScenarioFactory.scenarioBConditional(70),
        CCTScenarioFactory.scenarioCGraduated(35, 20, 15, 115),
        CCTScenarioFactory.scenarioDIntegrated(60, true, true),
      ],
    });
  });

  app.post('/api/policies/select', (req: Request, res: Response) => {
    const { program } = req.body;
    if (program) {
      AppDataStore.setActiveScenario(program);
      res.json({ success: true, activeScenario: program });
    } else {
      res.status(400).json({ error: 'Missing program definition' });
    }
  });

  // Simulation Engine (Monte Carlo ABM)
  app.post('/api/simulations/run', (req: Request, res: Response) => {
    const { program, climateShock, steps, replicas, seed } = req.body;
    const activeProgram = program || AppDataStore.getActiveScenario();
    const activeShock = climateShock || AppDataStore.getActiveClimateShock();

    const result = AppDataStore.runScenarioSimulation(
      activeProgram,
      activeShock,
      steps || 12,
      replicas || 50,
      seed || 1234
    );

    res.json({ success: true, simulation: result });
  });

  app.get('/api/simulations/history', (req: Request, res: Response) => {
    res.json({
      history: AppDataStore.getSimulationHistory(),
    });
  });

  // Macro Indicators
  app.get('/api/indicators', (req: Request, res: Response) => {
    const countryCode = AppDataStore.getActiveCountry();
    const country = COUNTRIES_CONFIG[countryCode];
    const twins = AppDataStore.getDigitalTwins(countryCode);
    const states = twins.map((t) => t.simulatedStates[AppDataStore.getActiveScenario().id] || t.observedState);

    const indicators = computeMacroIndicators(
      states,
      country.nationalPovertyLineUSD,
      country.extremePovertyLineUSD,
      AppDataStore.getActiveScenario()
    );

    res.json({
      country: countryCode,
      activeScenario: AppDataStore.getActiveScenario().name,
      indicators,
    });
  });

  // Calibration (ABC)
  app.post('/api/calibration/run', (req: Request, res: Response) => {
    const { nSimulations, tolerance, seed } = req.body;
    const result = ABCCalibrator.runABCCalibration(
      { meanIncomeUSD: 235, povertyRate: 38.0, gini: 0.45 },
      nSimulations || 2000,
      tolerance || 0.12,
      seed || 888
    );
    res.json(result);
  });

  // ETL / Synthetic Data Ingestion
  app.post('/api/etl/generate-synthetic', (req: Request, res: Response) => {
    const { countryCode, nHouseholds, seed } = req.body;
    const c = (countryCode as CountryCode) || 'BRA';
    const n = nHouseholds || 100;
    const s = seed || 42;

    const data = SyntheticDataGenerator.generateCountryData(c, n, s);
    res.json({
      success: true,
      message: `Generados exitosamente ${data.households.length} hogares sintéticos para ${COUNTRIES_CONFIG[c].name}`,
      totalHouseholds: data.households.length,
      sampleHousehold: data.households[0],
      sampleTwin: data.twins[0],
    });
  });

  // Audit Logs
  app.get('/api/audit', (req: Request, res: Response) => {
    res.json({
      logs: AppDataStore.getAuditLogs(),
    });
  });

  // ----------------------------------------------------
  // Vite Integration for Full-Stack
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DLT Server] Digital Livelihood Twin API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

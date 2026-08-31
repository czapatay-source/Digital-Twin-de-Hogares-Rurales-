/**
 * Digital Livelihood Twin - Central Application Data Store
 * 
 * Provides unified state management, caching, and reactivity across all modules.
 */

import { 
  CountryCode, 
  DigitalTwin, 
  Household, 
  ClimateShock, 
  CCTProgram, 
  SimulationResult, 
  RecalculationDiff, 
  AuditLogEntry, 
  UserRole, 
  Country, 
  MacroIndicators 
} from '../types';
import { CCTScenarioFactory } from './scientific/cctEngine';
import { createClimateShock } from './scientific/climateEngine';
import { recalculateTwin } from './scientific/dependencyEngine';
import { SimulationEngine } from './scientific/simulationEngine';
import { COUNTRIES_CONFIG, SyntheticDataGenerator } from './scientific/syntheticGenerator';
import { computeMacroIndicators } from './scientific/indicators';

type StoreListener = () => void;

export class AppDataStore {
  private static activeCountry: CountryCode = 'BRA';
  private static activeRole: UserRole = 'RESEARCHER';
  private static householdsByCountry: Partial<Record<CountryCode, Household[]>> = {};
  private static twinsByCountry: Partial<Record<CountryCode, DigitalTwin[]>> = {};
  private static activeClimateShock: ClimateShock = createClimateShock('NORMAL', 0, 6);
  private static activeScenario: CCTProgram = CCTScenarioFactory.scenarioBConditional(70);
  private static simulationsHistory: SimulationResult[] = [];
  private static recalculationHistory: RecalculationDiff[] = [];
  private static auditLogs: AuditLogEntry[] = [];
  private static listeners: Set<StoreListener> = new Set();
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    // Generate 100 calibrated synthetic households for all 9 South American countries
    const allCountryCodes: CountryCode[] = ['BRA', 'COL', 'PER', 'CHL', 'ECU', 'ARG', 'BOL', 'PRY', 'URY'];
    allCountryCodes.forEach((code, idx) => {
      const generated = SyntheticDataGenerator.generateCountryData(code, 100, 100 * (idx + 1) + 42);
      this.householdsByCountry[code] = generated.households;
      this.twinsByCountry[code] = generated.twins;
    });

    this.logAudit({
      action: 'INITIALIZE',
      entityType: 'DATASET',
      entityId: 'GLOBAL',
      details: 'Inicialización de microdatos sintéticos armonizados para 9 países de Sudamérica (BRA, COL, PER, CHL, ECU, ARG, BOL, PRY, UYU).',
    });
    this.isInitialized = true;
  }

  public static subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach((l) => l());
  }

  public static getAvailableCountries(): Country[] {
    return Object.values(COUNTRIES_CONFIG);
  }

  public static getActiveCountry(): CountryCode {
    this.initialize();
    return this.activeCountry;
  }

  public static setSelectedCountry(country: CountryCode | string): void {
    this.setActiveCountry(country as CountryCode);
  }

  public static setActiveCountry(country: CountryCode): void {
    this.initialize();
    this.activeCountry = country;
    this.logAudit({
      action: 'CHANGE_COUNTRY',
      entityType: 'DATASET',
      entityId: country,
      details: `País activo cambiado a ${COUNTRIES_CONFIG[country]?.name || country}`,
    });
    this.notifyListeners();
  }

  public static getActiveRole(): UserRole {
    return this.activeRole;
  }

  public static setActiveRole(role: UserRole): void {
    this.activeRole = role;
    this.logAudit({
      action: 'CHANGE_ROLE',
      entityType: 'AUTH',
      entityId: role,
      details: `Rol de usuario cambiado a ${role}`,
    });
    this.notifyListeners();
  }

  public static getHouseholds(country?: CountryCode): Household[] {
    this.initialize();
    const c = country || this.activeCountry;
    return this.householdsByCountry[c] || [];
  }

  public static getDigitalTwins(country?: CountryCode): DigitalTwin[] {
    this.initialize();
    const c = country || this.activeCountry;
    return this.twinsByCountry[c] || [];
  }

  public static getDigitalTwinsByCountry(countryCode: string): DigitalTwin[] {
    this.initialize();
    return this.twinsByCountry[countryCode as CountryCode] || this.twinsByCountry.BRA;
  }

  public static getDigitalTwinById(twinId: string): DigitalTwin | undefined {
    this.initialize();
    const allCodes = Object.keys(COUNTRIES_CONFIG) as CountryCode[];
    for (const c of allCodes) {
      const found = this.twinsByCountry[c]?.find((t) => t.id === twinId);
      if (found) return found;
    }
    return undefined;
  }

  public static getHouseholdById(hhId: string): Household | undefined {
    this.initialize();
    const allCodes = Object.keys(COUNTRIES_CONFIG) as CountryCode[];
    for (const c of allCodes) {
      const found = this.householdsByCountry[c]?.find((h) => h.id === hhId);
      if (found) return found;
    }
    return undefined;
  }

  public static getClimateShock(): ClimateShock {
    return this.activeClimateShock;
  }

  public static getActiveClimateShock(): ClimateShock {
    return this.activeClimateShock;
  }

  public static setClimateShock(shock: ClimateShock): void {
    this.activeClimateShock = shock;
    this.logAudit({
      action: 'SET_CLIMATE_SHOCK',
      entityType: 'CLIMATE',
      entityId: shock.id,
      details: `Choque climático configurado: ${shock.shockType} (intensidad ${shock.intensity})`,
    });
    this.notifyListeners();
  }

  public static getActiveScenario(): CCTProgram {
    return this.activeScenario;
  }

  public static setActiveScenario(program: CCTProgram): void {
    this.activeScenario = program;
    this.logAudit({
      action: 'SET_POLICY_SCENARIO',
      entityType: 'POLICY',
      entityId: program.id,
      details: `Escenario de política seleccionado: ${program.name}`,
    });
    this.notifyListeners();
  }

  public static calculateCurrentMacroIndicators(): MacroIndicators {
    this.initialize();
    const twins = this.getDigitalTwins();
    const country = COUNTRIES_CONFIG[this.activeCountry];
    const states = twins.map((t) => t.simulatedStates[this.activeScenario.id] || t.observedState);

    return computeMacroIndicators(
      states,
      country.nationalPovertyLineUSD,
      country.extremePovertyLineUSD,
      this.activeScenario
    );
  }

  public static runScenarioSimulation(
    program: CCTProgram,
    shock?: ClimateShock,
    steps = 12,
    replicas = 50,
    seed = 1234
  ): SimulationResult {
    this.initialize();
    const twins = this.getDigitalTwins();
    const households = this.getHouseholds();
    const country = COUNTRIES_CONFIG[this.activeCountry];

    const result = SimulationEngine.runSimulation(
      twins,
      households,
      program,
      shock || this.activeClimateShock,
      steps,
      replicas,
      seed,
      country.nationalPovertyLineUSD,
      country.extremePovertyLineUSD
    );

    this.simulationsHistory.unshift(result);
    this.logAudit({
      action: 'RUN_SIMULATION',
      entityType: 'SIMULATION',
      entityId: result.id,
      details: `Simulación ${program.name} ejecutada con ${replicas} réplicas Monte Carlo.`,
    });
    this.notifyListeners();
    return result;
  }

  public static getSimulationHistory(): SimulationResult[] {
    return this.simulationsHistory;
  }

  public static performReactiveRecalculation(
    twinId: string,
    variable: string,
    value: number | boolean
  ): { twin: DigitalTwin; diff: RecalculationDiff } | undefined {
    const twin = this.getDigitalTwinById(twinId);
    if (!twin) return undefined;
    const hh = this.getHouseholdById(twin.householdId);
    if (!hh) return undefined;

    const country = COUNTRIES_CONFIG[twin.countryCode];
    const currentState = twin.simulatedStates[this.activeScenario.id] || twin.observedState;

    const { newState, diff } = recalculateTwin(
      currentState,
      hh,
      variable,
      value,
      country.nationalPovertyLineUSD,
      country.extremePovertyLineUSD
    );

    // Update simulated state branch (Observed state is preserved intact)
    twin.simulatedStates[this.activeScenario.id] = newState;
    this.recalculationHistory.unshift(diff);
    
    this.logAudit({
      action: 'RECALCULATION',
      entityType: 'TWIN',
      entityId: twinId,
      twinId,
      targetVariable: variable,
      previousValue: diff.oldValue,
      newValue: value,
      stateType: 'SIMULATED',
      details: `Variable ${variable} actualizada a ${value}. Recálculo en cascada completado.`,
    });

    this.notifyListeners();
    return { twin, diff };
  }

  public static getRecalculationHistory(): RecalculationDiff[] {
    return this.recalculationHistory;
  }

  public static getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  public static logAudit(entry: {
    action: string;
    entityType: AuditLogEntry['entityType'];
    entityId: string;
    details: string;
    twinId?: string;
    targetVariable?: string;
    previousValue?: any;
    newValue?: any;
    stateType?: string;
  }): void {
    this.auditLogs.unshift({
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      actor: this.activeRole,
      twinId: entry.twinId || entry.entityId,
      targetVariable: entry.targetVariable || 'N/A',
      previousValue: entry.previousValue !== undefined ? entry.previousValue : 'N/A',
      newValue: entry.newValue !== undefined ? entry.newValue : 'N/A',
      stateType: entry.stateType || 'GLOBAL',
    });
  }
}

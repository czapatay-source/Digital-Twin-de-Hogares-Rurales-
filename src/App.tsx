import React, { useState, useEffect } from 'react';
import { 
  CountryCode,
  UserRole,
  Country, 
  DigitalTwin, 
  Household, 
  MacroIndicators, 
  CCTProgram, 
  ClimateShock, 
  SimulationResult, 
  AuditLogEntry, 
  RecalculationDiff 
} from './types';
import { AppDataStore } from './lib/store';
import { CCTScenarioFactory } from './lib/scientific/cctEngine';
import { COUNTRIES_CONFIG } from './lib/scientific/syntheticGenerator';

import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { TwinExplorer } from './components/twin-explorer/TwinExplorer';
import { PolicyLab } from './components/policy-lab/PolicyLab';
import { ScenarioComparison } from './components/policy-lab/ScenarioComparison';
import { TwinScene3D } from './components/three-d/TwinScene3D';
import { RegionalMap } from './components/map/RegionalMap';
import { ReactiveWhatIfLab } from './components/what-if/ReactiveWhatIfLab';
import { CalibrationView } from './components/calibration/CalibrationView';
import { AuditEthicsView } from './components/ethics/AuditEthicsView';
import { ReportCenter } from './components/reports/ReportCenter';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('OVERVIEW');
  const [activeCountry, setActiveCountry] = useState<CountryCode>('BRA');
  const [activeRole, setActiveRole] = useState<UserRole>('RESEARCHER');
  const [activeScenario, setActiveScenario] = useState<CCTProgram>(CCTScenarioFactory.baseline());
  const [climateShock, setClimateShock] = useState<ClimateShock>(AppDataStore.getClimateShock());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AppDataStore.getAuditLogs());
  const [selectedTwinForWhatIf, setSelectedTwinForWhatIf] = useState<string | null>(null);
  const [recalcCount, setRecalcCount] = useState<number>(0);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);

  // App Data
  const currentCountry = COUNTRIES_CONFIG[activeCountry];
  const twins = AppDataStore.getDigitalTwinsByCountry(activeCountry);
  const households = AppDataStore.getHouseholds(activeCountry);
  const macroIndicators = AppDataStore.calculateCurrentMacroIndicators();

  // Listen to store updates
  useEffect(() => {
    const unsubscribe = AppDataStore.subscribe(() => {
      setAuditLogs([...AppDataStore.getAuditLogs()]);
      setClimateShock({ ...AppDataStore.getClimateShock() });
      setRecalcCount(AppDataStore.getRecalculationHistory().length);
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleCountryChange = (countryCode: CountryCode) => {
    setActiveCountry(countryCode);
    AppDataStore.setSelectedCountry(countryCode);
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    AppDataStore.setActiveRole(role);
  };

  const handleScenarioChange = (scenario: CCTProgram) => {
    setActiveScenario(scenario);
    AppDataStore.setActiveScenario(scenario);
  };

  const handleScenarioPresetSelect = (presetKey: string) => {
    let prog = CCTScenarioFactory.baseline();
    if (presetKey === 'SCENARIO_A') prog = CCTScenarioFactory.scenarioAUniversal(50);
    else if (presetKey === 'SCENARIO_B') prog = CCTScenarioFactory.scenarioBConditional(70);
    else if (presetKey === 'SCENARIO_C') prog = CCTScenarioFactory.scenarioCGraduated(35, 20, 15, 115);
    else if (presetKey === 'SCENARIO_D') prog = CCTScenarioFactory.scenarioDIntegrated(60, true, true);
    handleScenarioChange(prog);
  };

  const handleClimateShockUpdate = (shock: ClimateShock) => {
    setClimateShock(shock);
    AppDataStore.setClimateShock(shock);
  };

  const handleOpenWhatIfForTwin = (twinId: string) => {
    setSelectedTwinForWhatIf(twinId);
    setActiveTab('WHAT_IF_REACTIVE');
  };

  const handleTwinRecalculated = (diff: RecalculationDiff) => {
    setAuditLogs([...AppDataStore.getAuditLogs()]);
    setRecalcCount(AppDataStore.getRecalculationHistory().length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar
        activeCountry={activeCountry}
        onSelectCountry={handleCountryChange}
        activeRole={activeRole}
        onSelectRole={handleRoleChange}
        activeScenarioName={activeScenario.name}
        onOpenDocs={() => setShowDocsModal(true)}
      />

      {/* Main Grid: Collapsible Sidebar + Dynamic View Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab}
          recalculationCount={recalcCount}
        />

        {/* Dynamic Center Stage Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950/90">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'OVERVIEW' && (
              <OverviewDashboard
                country={currentCountry}
                indicators={macroIndicators}
                twins={twins}
                activeScenario={activeScenario}
                climateShock={climateShock}
                onOpenScenarioLab={() => setActiveTab('POLICY_LAB')}
                onOpenWhatIf={() => setActiveTab('WHAT_IF_REACTIVE')}
              />
            )}

            {activeTab === 'TWIN_EXPLORER' && (
              <TwinExplorer
                twins={twins}
                households={households}
                country={currentCountry}
                activeScenario={activeScenario}
                onOpenWhatIfForTwin={handleOpenWhatIfForTwin}
              />
            )}

            {activeTab === 'REGIONAL_MAP' && (
              <RegionalMap
                country={currentCountry}
                twins={twins}
                indicators={macroIndicators}
                activeScenario={activeScenario}
                climateShock={climateShock}
              />
            )}

            {activeTab === 'THREE_D_TWIN' && (
              <TwinScene3D
                twins={twins}
                households={households}
                country={currentCountry}
                activeScenario={activeScenario}
                climateShock={climateShock}
                onUpdateClimateShock={handleClimateShockUpdate}
                onSelectTwin={handleOpenWhatIfForTwin}
              />
            )}

            {activeTab === 'POLICY_LAB' && (
              <PolicyLab
                country={currentCountry}
                activeScenario={activeScenario}
                climateShock={climateShock}
                onSelectScenario={handleScenarioChange}
                onSimulationComplete={(result) => {
                  // Simulation completed
                }}
              />
            )}

            {activeTab === 'SCENARIO_COMPARISON' && (
              <ScenarioComparison
                country={currentCountry}
                twins={twins}
                households={households}
                climateShock={climateShock}
                onSelectScenario={handleScenarioPresetSelect}
              />
            )}

            {activeTab === 'WHAT_IF_REACTIVE' && (
              <ReactiveWhatIfLab
                country={currentCountry}
                twins={twins}
                households={households}
                activeScenario={activeScenario}
                selectedTwinId={selectedTwinForWhatIf}
                onTwinRecalculated={handleTwinRecalculated}
              />
            )}

            {activeTab === 'CALIBRATION' && <CalibrationView />}

            {activeTab === 'REPORT_CENTER' && (
              <ReportCenter
                country={currentCountry}
                indicators={macroIndicators}
                twins={twins}
                households={households}
                activeScenario={activeScenario}
                climateShock={climateShock}
              />
            )}

            {activeTab === 'AUDIT_LOGS' && (
              <AuditEthicsView country={currentCountry} auditLogs={auditLogs} />
            )}
          </div>
        </main>
      </div>

      {/* Methodology & Architecture Documentation Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-base">
                Documentación Metodológica &amp; Fórmulas Científicas (Q1)
              </h3>
              <button
                id="btn-close-docs"
                onClick={() => setShowDocsModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-emerald-400 text-sm mb-1">1. Foster-Greer-Thorbecke (FGT) Poverty Indices</h4>
                <p className="font-mono text-[11px] text-slate-300">FGT_α = (1 / N) * Σ [ (z - y_i) / z ]^α  (para y_i &lt; z)</p>
                <p className="text-slate-400 mt-1">α = 0 (Headcount Ratio), α = 1 (Poverty Gap), α = 2 (Poverty Severity / Squared Gap).</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-blue-400 text-sm mb-1">2. Alkire-Foster Multidimensional Poverty Index (MPI)</h4>
                <p className="font-mono text-[11px] text-slate-300">MPI = H × A, donde c_i = Σ w_j * I(privación_j), pobre si c_i ≥ 0.333</p>
                <p className="text-slate-400 mt-1">10 indicadores distribuidos en Salud (1/3), Educación (1/3) y Nivel de Vida (1/3).</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-amber-400 text-sm mb-1">3. Prospect Theory (Kahneman &amp; Tversky, 1979)</h4>
                <p className="font-mono text-[11px] text-slate-300">v(x) = x^α si x ≥ 0; v(x) = -λ (-x)^β si x &lt; 0 (λ = 2.25, α = 0.88)</p>
                <p className="text-slate-400 mt-1">Captura la aversión a la pérdida y decisiones adaptativas ante sequías e incertidumbre climática.</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-purple-400 text-sm mb-1">4. DFID Sustainable Livelihoods Framework</h4>
                <p className="text-slate-400">Modelado integral de 5 capitales: Humano (H), Físico (P), Financiero (F), Social (S) y Natural (N).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

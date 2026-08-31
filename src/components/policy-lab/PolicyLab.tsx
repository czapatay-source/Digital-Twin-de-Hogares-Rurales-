import React, { useState } from 'react';
import { CCTProgram, Country, DigitalTwin, Household, SimulationResult, ClimateShock } from '../../types';
import { CCTScenarioFactory } from '../../lib/scientific/cctEngine';
import { AppDataStore } from '../../lib/store';
import { 
  Sliders, 
  Play, 
  Layers, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  BarChart2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';

interface PolicyLabProps {
  country: Country;
  activeScenario: CCTProgram;
  climateShock: ClimateShock;
  onSelectScenario: (program: CCTProgram) => void;
  onSimulationComplete: (result: SimulationResult) => void;
}

export const PolicyLab: React.FC<PolicyLabProps> = ({
  country,
  activeScenario,
  climateShock,
  onSelectScenario,
  onSimulationComplete,
}) => {
  const [baseTransfer, setBaseTransfer] = useState(activeScenario.baseTransferUSD);
  const [perChild, setPerChild] = useState(activeScenario.transferPerChildUSD);
  const [perElderly, setPerElderly] = useState(activeScenario.transferPerElderlyUSD);
  const [maxTransfer, setMaxTransfer] = useState(activeScenario.maxTransferUSD || 120);
  const [eduCondition, setEduCondition] = useState(activeScenario.educationCondition);
  const [healthCondition, setHealthCondition] = useState(activeScenario.healthCondition);
  const [hasTraining, setHasTraining] = useState(activeScenario.includesAgriculturalTraining);
  const [hasMicrocredit, setHasMicrocredit] = useState(activeScenario.includesMicrocreditAccess);
  const [targeting, setTargeting] = useState(activeScenario.targetingMethod);
  
  // Monte Carlo parameters
  const [replicas, setReplicas] = useState(50);
  const [stepsMonths, setStepsMonths] = useState(12);
  const [seed, setSeed] = useState(1234);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Quick Preset Selection
  const applyPreset = (preset: CCTProgram) => {
    setBaseTransfer(preset.baseTransferUSD);
    setPerChild(preset.transferPerChildUSD);
    setPerElderly(preset.transferPerElderlyUSD);
    setMaxTransfer(preset.maxTransferUSD);
    setEduCondition(preset.educationCondition);
    setHealthCondition(preset.healthCondition);
    setHasTraining(preset.includesAgriculturalTraining);
    setHasMicrocredit(preset.includesMicrocreditAccess);
    setTargeting(preset.targetingMethod);
    onSelectScenario(preset);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);

    const customProgram: CCTProgram = {
      ...activeScenario,
      baseTransferUSD: baseTransfer,
      transferPerChildUSD: perChild,
      transferPerElderlyUSD: perElderly,
      maxTransferUSD: maxTransfer,
      educationCondition: eduCondition,
      healthCondition: healthCondition,
      includesAgriculturalTraining: hasTraining,
      includesMicrocreditAccess: hasMicrocredit,
      targetingMethod: targeting,
    };

    onSelectScenario(customProgram);

    // Run Monte Carlo ABM in background thread / store
    setTimeout(() => {
      const result = AppDataStore.runScenarioSimulation(
        customProgram,
        climateShock,
        stepsMonths,
        replicas,
        seed
      );
      setSimulationResult(result);
      setIsSimulating(false);
      onSimulationComplete(result);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Laboratorio de Políticas CCT &amp; Simulador Monte Carlo (Mesa ABM)
          </h2>
          <p className="text-xs text-slate-400">
            Diseña reglas de transferencia, condicionalidades educativas y evalúa impactos contrafactuales con Prospect Theory.
          </p>
        </div>

        <button
          id="btn-run-simulation"
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2"
        >
          {isSimulating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Simulando ({replicas} réplicas)...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Ejecutar Simulación Monte Carlo
            </>
          )}
        </button>
      </div>

      {/* Preset Scenarios Chips */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2">
          Escenarios Canónicos:
        </span>
        <button
          id="btn-preset-baseline"
          onClick={() => applyPreset(CCTScenarioFactory.baseline())}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
        >
          Status Quo (Línea Base)
        </button>
        <button
          id="btn-preset-a"
          onClick={() => applyPreset(CCTScenarioFactory.scenarioAUniversal(50))}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-950/60 text-blue-300 hover:bg-blue-900/80 border border-blue-800/40 transition-all"
        >
          Escenario A (Universal $50)
        </button>
        <button
          id="btn-preset-b"
          onClick={() => applyPreset(CCTScenarioFactory.scenarioBConditional(70))}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-800/40 transition-all"
        >
          Escenario B (Condicionado $70)
        </button>
        <button
          id="btn-preset-c"
          onClick={() => applyPreset(CCTScenarioFactory.scenarioCGraduated(35, 20, 15, 115))}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-300 hover:bg-purple-900/80 border border-purple-800/40 transition-all"
        >
          Escenario C (Graduado por Hijos)
        </button>
        <button
          id="btn-preset-d"
          onClick={() => applyPreset(CCTScenarioFactory.scenarioDIntegrated(60, true, true))}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800/40 transition-all"
        >
          Escenario D (Integrado + Capacitación + Microcrédito)
        </button>
      </div>

      {/* Policy Parameter Formulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Transfer Amounts & Targeting */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> 1. Montos de Transferencia y Focalización
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Transferencia Base Hogar:</span>
                <span className="font-mono font-bold text-emerald-400">${baseTransfer} USD/mes</span>
              </div>
              <input
                id="slider-base-transfer"
                type="range"
                min="0"
                max="120"
                step="5"
                value={baseTransfer}
                onChange={(e) => setBaseTransfer(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Suplemento por Niño Escolarizado:</span>
                <span className="font-mono font-bold text-blue-400">${perChild} USD/mes</span>
              </div>
              <input
                id="slider-child-transfer"
                type="range"
                min="0"
                max="40"
                step="5"
                value={perChild}
                onChange={(e) => setPerChild(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Suplemento por Adulto Mayor:</span>
                <span className="font-mono font-bold text-purple-400">${perElderly} USD/mes</span>
              </div>
              <input
                id="slider-elderly-transfer"
                type="range"
                min="0"
                max="40"
                step="5"
                value={perElderly}
                onChange={(e) => setPerElderly(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Método de Focalización:</label>
              <select
                id="select-targeting-method"
                value={targeting}
                onChange={(e) => setTargeting(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="UNIVERSAL">Universal (Sin prueba de medios)</option>
                <option value="MEANS_TEST">Comprobación de Ingresos (Means-Test)</option>
                <option value="PMT_PROXY_MEANS">Proxy Means Test (PMT Multidimensional)</option>
                <option value="GEOGRAPHIC">Focalización Geográfica Rural</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel 2: Conditionalities & Productive Inclusion */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" /> 2. Condicionalidades &amp; Inclusión
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950">
              <input
                id="chk-edu-cond"
                type="checkbox"
                checked={eduCondition}
                onChange={(e) => setEduCondition(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <div className="font-semibold text-slate-200">Condicionalidad Educativa</div>
                <div className="text-[11px] text-slate-400">Exige 85% de asistencia escolar verificada.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950">
              <input
                id="chk-health-cond"
                type="checkbox"
                checked={healthCondition}
                onChange={(e) => setHealthCondition(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <div className="font-semibold text-slate-200">Condicionalidad de Salud</div>
                <div className="text-[11px] text-slate-400">Controles médicos y vacunación obligatoria.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950">
              <input
                id="chk-ag-training"
                type="checkbox"
                checked={hasTraining}
                onChange={(e) => setHasTraining(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <div className="font-semibold text-slate-200">Asistencia Técnica Agroecológica</div>
                <div className="text-[11px] text-slate-400">Incrementa productividad agrícola en 12%.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-950">
              <input
                id="chk-microcredit"
                type="checkbox"
                checked={hasMicrocredit}
                onChange={(e) => setHasMicrocredit(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <div>
                <div className="font-semibold text-slate-200">Acceso a Microcrédito y Seguro Climático</div>
                <div className="text-[11px] text-slate-400">Fortalece capital financiero y absorción de choques.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Panel 3: Monte Carlo Simulator Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-amber-400" /> 3. Parámetros del Motor de Simulación
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Réplicas de Monte Carlo:</span>
                <span className="font-mono font-bold text-amber-400">{replicas} réplicas</span>
              </div>
              <input
                id="slider-replicas"
                type="range"
                min="10"
                max="100"
                step="10"
                value={replicas}
                onChange={(e) => setReplicas(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Horizonte Temporal:</span>
                <span className="font-mono font-bold text-white">{stepsMonths} meses</span>
              </div>
              <input
                id="slider-steps-months"
                type="range"
                min="6"
                max="36"
                step="6"
                value={stepsMonths}
                onChange={(e) => setStepsMonths(parseInt(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Semilla Aleatoria Fija (Reproducibilidad Q1):</label>
              <input
                id="input-random-seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 1234)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              Misma semilla genera idénticas trayectorias y bandas de confianza (p5, p50, p95).
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Results Display (Monte Carlo Results) */}
      {simulationResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Simulación Completada exitosamente
                </span>
                <span className="text-xs font-mono text-slate-400">{simulationResult.id}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Resultados de Evaluación de Impacto Contrafactual
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-400">Policy Efficiency Score:</span>
                <div className="text-xl font-bold text-emerald-400">
                  {simulationResult.simulatedIndicators.policyEfficiencyScore} / 100
                </div>
              </div>
            </div>
          </div>

          {/* Micro-indicators Comparison Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Pobreza FGT₀ (Simulada)</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {simulationResult.simulatedIndicators.fgt0_headcountRatio}%
              </div>
              <div className="text-[11px] text-slate-400">
                Línea Base: <span className="text-rose-400 line-through font-mono">{simulationResult.baselineIndicators.fgt0_headcountRatio}%</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Índice MPI (Simulado)</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
                {simulationResult.simulatedIndicators.mpi_index}
              </div>
              <div className="text-[11px] text-slate-400">
                Línea Base: <span className="text-amber-400 font-mono">{simulationResult.baselineIndicators.mpi_index}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Costo Mensual Total</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                ${simulationResult.simulatedIndicators.totalMonthlyCostUSD.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                ${simulationResult.simulatedIndicators.costPerBeneficiaryUSD} / beneficiario
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Resiliencia (DFID)</span>
              <div className="text-2xl font-bold text-teal-400 font-mono mt-1">
                {simulationResult.simulatedIndicators.meanResilienceScore}
              </div>
              <div className="text-[11px] text-slate-400">
                Vulnerables: {simulationResult.simulatedIndicators.highVulnerabilityPercentage}%
              </div>
            </div>
          </div>

          {/* Time Series Trajectory Chart with Monte Carlo Intervals */}
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
            <h4 className="font-semibold text-white text-sm mb-1">
              Trayectoria Temporal y Reducción de Pobreza (Mes 1 a {stepsMonths})
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Dinámica mensual del índice FGT₀ y MPI en respuesta a transferencias y decisiones conductuales.
            </p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationResult.timeSeriesTrajectory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="povertyRate" name="Tasa de Pobreza FGT₀ (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="meanIncomeUSD" name="Ingreso Medio ($)" stroke="#38bdf8" strokeWidth={2} dot={false} yAxisId={0} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

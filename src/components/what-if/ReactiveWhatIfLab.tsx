import React, { useState } from 'react';
import { Country, DigitalTwin, Household, RecalculationDiff, CCTProgram } from '../../types';
import { AppDataStore } from '../../lib/store';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  RotateCcw, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

interface ReactiveWhatIfLabProps {
  country: Country;
  twins: DigitalTwin[];
  households: Household[];
  activeScenario: CCTProgram;
  selectedTwinId?: string | null;
  onTwinRecalculated: (diff: RecalculationDiff) => void;
}

export const ReactiveWhatIfLab: React.FC<ReactiveWhatIfLabProps> = ({
  country,
  twins,
  households,
  activeScenario,
  selectedTwinId,
  onTwinRecalculated,
}) => {
  const [activeTwinId, setActiveTwinId] = useState<string>(selectedTwinId || twins[0]?.id || 'TWIN-BRA-0001');
  const [latestDiff, setLatestDiff] = useState<RecalculationDiff | null>(null);
  const [recalculatingNode, setRecalculatingNode] = useState<string | null>(null);

  const currentTwin = AppDataStore.getDigitalTwinById(activeTwinId) || twins[0];
  const currentHH = AppDataStore.getHouseholdById(currentTwin?.householdId || '');
  const currentState = currentTwin ? (currentTwin.simulatedStates[activeScenario.id] || currentTwin.observedState) : null;

  const [inputAgIncome, setInputAgIncome] = useState<number>(currentState?.monthlyAgriculturalIncomeUSD || 150);
  const [inputNonAgIncome, setInputNonAgIncome] = useState<number>(currentState?.monthlyNonAgriculturalIncomeUSD || 80);
  const [inputCCT, setInputCCT] = useState<number>(currentState?.monthlyCCTTransferUSD || 50);
  const [inputLand, setInputLand] = useState<number>(currentState?.capitals.natural.landHectares || 2.5);

  const handleApplyChange = (variable: string, value: number) => {
    setRecalculatingNode(variable);
    const result = AppDataStore.performReactiveRecalculation(activeTwinId, variable, value);
    if (result) {
      setLatestDiff(result.diff);
      onTwinRecalculated(result.diff);
    }
    setTimeout(() => setRecalculatingNode(null), 350);
  };

  // Run Canonical Benchmark Proof (Income 300 -> 450)
  const handleRunCanonicalProof = () => {
    // Set total income from 300 to 450 by increasing Ag Income to 350
    setInputAgIncome(350);
    setInputNonAgIncome(100);
    setInputCCT(0);
    handleApplyChange('monthlyAgriculturalIncomeUSD', 350);
  };

  if (!currentTwin || !currentHH || !currentState) {
    return <div className="text-slate-400 p-8 text-center">Cargando gemelos digitales...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30">
              PRUEBA REACTIVA EN TIEMPO REAL
            </span>
            <span className="text-xs text-slate-400 font-mono">DAG Reactive Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Laboratorio de Recálculo Reactivo (What-If)
          </h2>
          <p className="text-xs text-slate-400">
            Modifica cualquier variable y observa la propagación en milisegundos a través del grafo de dependencias sin alterar el estado observado inmutable.
          </p>
        </div>

        {/* Quick Canonical Benchmark Button */}
        <button
          id="btn-canonical-proof"
          onClick={handleRunCanonicalProof}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Zap className="w-4 h-4" /> Ejecutar Prueba Canónica ($300 $\to$ $450)
        </button>
      </div>

      {/* Selector of Target Twin */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Gemelo Digital Objetivo:</span>
          <select
            id="select-whatif-twin"
            value={activeTwinId}
            onChange={(e) => {
              setActiveTwinId(e.target.value);
              const t = AppDataStore.getDigitalTwinById(e.target.value);
              if (t) {
                const s = t.simulatedStates[activeScenario.id] || t.observedState;
                setInputAgIncome(s.monthlyAgriculturalIncomeUSD);
                setInputNonAgIncome(s.monthlyNonAgriculturalIncomeUSD);
                setInputCCT(s.monthlyCCTTransferUSD);
                setInputLand(s.capitals.natural.landHectares);
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
          >
            {twins.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} ({t.householdId}) &bull; ${t.observedState.monthlyTotalIncomeUSD} USD
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-400 flex items-center gap-3">
          <span>Tamaño del Hogar: <strong className="text-white font-mono">{currentHH.size} miembros</strong></span>
          <span>Línea Pobreza: <strong className="text-white font-mono">${country.nationalPovertyLineUSD}/mes</strong></span>
        </div>
      </div>

      {/* Reactive DAG Propagation Graph Visualization */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-sm">Grafo Dirigido de Dependencias (Topological Cascade)</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Atomic State Update &bull; &lt; 2ms
          </span>
        </div>

        {/* DAG Nodes in Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
          {/* Node 1: Primary Inputs */}
          <div className={`p-3.5 rounded-xl border transition-all ${recalculatingNode ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-900'}`}>
            <div className="text-[10px] text-slate-400 uppercase font-mono">1. Entrada</div>
            <div className="font-bold text-white mt-1">Ingreso Total</div>
            <div className="font-mono text-emerald-400 text-sm mt-0.5">
              ${currentState.monthlyTotalIncomeUSD} USD
            </div>
          </div>

          {/* Node 2: Per Capita */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
            <div className="text-[10px] text-slate-400 uppercase font-mono">2. Per Cápita</div>
            <div className="font-bold text-white mt-1">Ingreso / Persona</div>
            <div className={`font-mono text-sm mt-0.5 ${currentState.isPovertyFGT0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ${currentState.perCapitaIncomeUSD} USD
            </div>
          </div>

          {/* Node 3: Poverty FGT */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
            <div className="text-[10px] text-slate-400 uppercase font-mono">3. FGT Índices</div>
            <div className="font-bold text-white mt-1">Pobreza FGT₀</div>
            <div className={`font-mono text-sm mt-0.5 ${currentState.isPovertyFGT0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {currentState.isPovertyFGT0 ? 'Bajo Línea' : 'No Pobre'}
            </div>
          </div>

          {/* Node 4: MPI Multidimensional */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
            <div className="text-[10px] text-slate-400 uppercase font-mono">4. Alkire-Foster</div>
            <div className="font-bold text-white mt-1">Puntaje MPI (c)</div>
            <div className={`font-mono text-sm mt-0.5 ${currentState.isMultiDimensionallyPoor ? 'text-amber-400' : 'text-slate-200'}`}>
              {Math.round(currentState.deprivationScore * 100)}%
            </div>
          </div>

          {/* Node 5: 5-Capitals Resilience */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
            <div className="text-[10px] text-slate-400 uppercase font-mono">5. DFID Resilience</div>
            <div className="font-bold text-white mt-1">Score Resiliencia</div>
            <div className="font-mono text-teal-400 text-sm mt-0.5">
              {currentState.resilienceScore} / 1.0
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Sliders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> Variables de Entrada del Hogar
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Ingreso Agrícola Mensual:</span>
                <span className="font-mono font-bold text-emerald-400">${inputAgIncome} USD</span>
              </div>
              <input
                id="slider-whatif-ag-income"
                type="range"
                min="0"
                max="600"
                step="10"
                value={inputAgIncome}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setInputAgIncome(val);
                  handleApplyChange('monthlyAgriculturalIncomeUSD', val);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Ingreso No Agrícola (Off-farm):</span>
                <span className="font-mono font-bold text-blue-400">${inputNonAgIncome} USD</span>
              </div>
              <input
                id="slider-whatif-nonag-income"
                type="range"
                min="0"
                max="500"
                step="10"
                value={inputNonAgIncome}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setInputNonAgIncome(val);
                  handleApplyChange('monthlyNonAgriculturalIncomeUSD', val);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Transferencia Monetaria CCT:</span>
                <span className="font-mono font-bold text-indigo-400">${inputCCT} USD</span>
              </div>
              <input
                id="slider-whatif-cct"
                type="range"
                min="0"
                max="150"
                step="5"
                value={inputCCT}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setInputCCT(val);
                  handleApplyChange('monthlyCCTTransferUSD', val);
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Dotación de Tierra (Hectáreas):</span>
                <span className="font-mono font-bold text-green-400">{inputLand} ha</span>
              </div>
              <input
                id="slider-whatif-land"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={inputLand}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setInputLand(val);
                  handleApplyChange('landHectares', val);
                }}
                className="w-full accent-green-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Diff & Invariance Verification Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Registro de Auditoría de Recálculo en Vivo
          </h3>

          {latestDiff ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 flex justify-between">
                <span>Variable Modificada: {latestDiff.changedVariable}</span>
                <span>Nuevo Valor: {latestDiff.newValue}</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Variable Recalculada</th>
                      <th className="p-2.5">Antes</th>
                      <th className="p-2.5">Después</th>
                      <th className="p-2.5">Impacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Object.entries(latestDiff.affectedVariables).map(([k, val]) => {
                      const v = val as { old: any; new: any };
                      return (
                        <tr key={k} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-slate-300">{k}</td>
                          <td className="p-2.5 font-mono text-slate-400">{String(v?.old ?? '')}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-400">{String(v?.new ?? '')}</td>
                          <td className="p-2.5 text-xs text-slate-300">
                            {v?.old !== v?.new ? <span className="text-emerald-400 font-semibold">Actualizado</span> : <span className="text-slate-500">Sin cambio</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs py-8">
              Mueve cualquiera de los controles deslizantes o pulsa el botón de prueba canónica para presenciar el recálculo reactivo instantáneo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

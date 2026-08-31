import React from 'react';
import { Country, DigitalTwin, Household, ClimateShock } from '../../types';
import { CCTScenarioFactory } from '../../lib/scientific/cctEngine';
import { SimulationEngine } from '../../lib/scientific/simulationEngine';
import { GitCompare, Award, DollarSign, TrendingDown, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface ScenarioComparisonProps {
  country: Country;
  twins: DigitalTwin[];
  households: Household[];
  climateShock: ClimateShock;
  onSelectScenario: (scenarioType: string) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  country,
  twins,
  households,
  climateShock,
  onSelectScenario,
}) => {
  // Pre-calculate 5 scenarios
  const scenarios = [
    { key: 'BASELINE', program: CCTScenarioFactory.baseline(), name: 'Línea Base (Status Quo)' },
    { key: 'SCENARIO_A', program: CCTScenarioFactory.scenarioAUniversal(50), name: 'Escenario A: Universal ($50)' },
    { key: 'SCENARIO_B', program: CCTScenarioFactory.scenarioBConditional(70), name: 'Escenario B: Condicionado ($70)' },
    { key: 'SCENARIO_C', program: CCTScenarioFactory.scenarioCGraduated(35, 20, 15, 115), name: 'Escenario C: Graduado por Carga' },
    { key: 'SCENARIO_D', program: CCTScenarioFactory.scenarioDIntegrated(60, true, true), name: 'Escenario D: Integrado Productivo' },
  ];

  const results = scenarios.map((s) => {
    const sim = SimulationEngine.runSimulation(
      twins,
      households,
      s.program,
      climateShock,
      12,
      20,
      1234,
      country.nationalPovertyLineUSD,
      country.extremePovertyLineUSD
    );
    return {
      ...s,
      indicators: sim.simulatedIndicators,
    };
  });

  const chartData = results.map((r) => ({
    name: r.key.replace('SCENARIO_', 'Esc. '),
    PobrezaFGT0: r.indicators.fgt0_headcountRatio,
    MPI_H: r.indicators.mpi_incidence_H,
    CostoMilUSD: Number((r.indicators.totalMonthlyCostUSD / 1000).toFixed(1)),
    Eficiencia: r.indicators.policyEfficiencyScore,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-emerald-400" /> Comparativa Multicriterio de Escenarios CCT
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evaluación comparativa rigurosa: Reducción de Pobreza, Impacto MPI, Costo Fiscal y Score de Eficiencia (PES).
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Escenario de Política</th>
                <th className="px-4 py-3.5 text-center">FGT₀ Pobreza</th>
                <th className="px-4 py-3.5 text-center">MPI (H × A)</th>
                <th className="px-4 py-3.5 text-center">Desigualdad Gini</th>
                <th className="px-4 py-3.5 text-center">Cobertura</th>
                <th className="px-4 py-3.5 text-center">Costo Mensual</th>
                <th className="px-4 py-3.5 text-center">Resiliencia</th>
                <th className="px-4 py-3.5 text-center">Score Eficiencia (PES)</th>
                <th className="px-4 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.map((r, idx) => {
                const ind = r.indicators;
                const isBestEfficiency = r.key === 'SCENARIO_D';

                return (
                  <tr key={r.key} className={`hover:bg-slate-800/40 transition-colors ${isBestEfficiency ? 'bg-emerald-950/20' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {r.name}
                        {isBestEfficiency && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Óptimo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{r.program.description.substring(0, 70)}...</div>
                    </td>

                    <td className="px-4 py-4 text-center font-mono font-bold text-rose-400">
                      {ind.fgt0_headcountRatio}%
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-amber-300">
                      {ind.mpi_index} <span className="text-[10px] text-slate-400">({ind.mpi_incidence_H}%)</span>
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-slate-200">
                      {ind.giniCoefficient}
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-indigo-300">
                      {ind.coverageRatePct}% <span className="text-[10px] text-slate-400">({ind.beneficiaryHouseholds} hog)</span>
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-slate-200">
                      ${ind.totalMonthlyCostUSD.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-teal-400 font-semibold">
                      {ind.meanResilienceScore}
                    </td>

                    <td className="px-4 py-4 text-center font-mono">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${isBestEfficiency ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-300 bg-slate-800'}`}>
                        {ind.policyEfficiencyScore} / 100
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        id={`btn-apply-scenario-${r.key.toLowerCase()}`}
                        onClick={() => onSelectScenario(r.key)}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1 font-medium"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Aplicar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Poverty Rate & MPI Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="font-semibold text-white text-sm mb-4">
            Comparativa de Pobreza FGT₀ y Pobreza Multidimensional (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="PobrezaFGT0" name="Pobreza FGT₀ (%)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MPI_H" name="Incidencia MPI (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Policy Efficiency Score (PES) Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="font-semibold text-white text-sm mb-4">
            Score de Eficiencia de Política (0 - 100 pts)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="Eficiencia" name="Policy Efficiency Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

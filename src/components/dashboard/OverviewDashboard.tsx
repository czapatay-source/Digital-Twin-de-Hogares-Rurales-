import React from 'react';
import { MacroIndicators, Country, ClimateShock, CCTProgram } from '../../types';
import { 
  Users, 
  TrendingDown, 
  ShieldCheck, 
  DollarSign, 
  CloudRain, 
  Award, 
  PieChart as PieIcon, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

interface OverviewDashboardProps {
  indicators: MacroIndicators;
  country: Country;
  activeScenario: CCTProgram;
  climateShock: ClimateShock;
  onNavigateToWhatIf: () => void;
  onNavigateToPolicyLab: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  indicators,
  country,
  activeScenario,
  climateShock,
  onNavigateToWhatIf,
  onNavigateToPolicyLab,
}) => {
  // 5-Capitals Radar Data
  const radarData = [
    { capital: 'Humano', value: 68, target: 80 },
    { capital: 'Físico', value: 54, target: 75 },
    { capital: 'Financiero', value: 46, target: 70 },
    { capital: 'Social', value: 62, target: 70 },
    { capital: 'Natural', value: Math.max(20, Math.round(65 * (1 - climateShock.intensity * 0.4))), target: 75 },
  ];

  // Income Distribution Buckets (Lorenz / Histogram simulated for 100 households)
  const incomeDistribution = [
    { range: '< $100', count: Math.round(indicators.totalHouseholds * (indicators.extremePovertyRate / 100)) },
    { range: '$100-180', count: Math.round(indicators.totalHouseholds * ((indicators.fgt0_headcountRatio - indicators.extremePovertyRate) / 100)) },
    { range: '$180-280', count: Math.round(indicators.totalHouseholds * 0.32) },
    { range: '$280-400', count: Math.round(indicators.totalHouseholds * 0.18) },
    { range: '> $400', count: Math.round(indicators.totalHouseholds * 0.14) },
  ];

  // Deprivation breakdown
  const deprivationBreakdown = [
    { indicator: 'Nutrición', rate: 28.5 },
    { indicator: 'Escolaridad', rate: 34.0 },
    { indicator: 'Asistencia Escolar', rate: 16.5 },
    { indicator: 'Combustible', rate: 42.0 },
    { indicator: 'Saneamiento', rate: 31.0 },
    { indicator: 'Agua Potable', rate: 26.0 },
    { indicator: 'Electricidad', rate: 12.0 },
    { indicator: 'Vivienda', rate: 38.0 },
    { indicator: 'Activos', rate: 44.0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {country.name} ({country.code})
            </span>
            <span className="text-xs text-slate-400">
              Línea de Pobreza: <strong className="text-white font-mono">${country.nationalPovertyLineUSD}/mes</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Tablero de Control del Gemelo Digital Rural
          </h2>
          <p className="text-xs text-slate-400">
            Escenario Activo: <span className="text-indigo-300 font-medium">{activeScenario.name}</span> &bull; Choque Climático: <span className={climateShock.intensity > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400'}>{climateShock.shockType} ({Math.round(climateShock.intensity * 100)}%)</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-dash-whatif"
            onClick={onNavigateToWhatIf}
            className="px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            ⚡ Probar Recálculo Reactivo (What-If)
          </button>
          <button
            id="btn-dash-policy"
            onClick={onNavigateToPolicyLab}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Simular CCT
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Twins */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Digital Twins Activos</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{indicators.totalHouseholds}</span>
            <span className="text-[11px] text-slate-400">hogares ({indicators.totalIndividuals} ind.)</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">100% Calibrados (HRHS)</div>
        </div>

        {/* KPI 2: Poverty Rate (FGT0) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pobreza Monetaria (FGT₀)</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{indicators.fgt0_headcountRatio}%</span>
            <span className="text-[11px] text-rose-400 font-mono">Gap: {indicators.fgt1_povertyGapIndex}%</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Extrema: <span className="text-rose-300 font-mono">{indicators.extremePovertyRate}%</span></div>
        </div>

        {/* KPI 3: MPI Index */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Índice Pobreza Multidimensional</span>
            <PieIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{indicators.mpi_index}</span>
            <span className="text-[11px] text-amber-300 font-mono">H: {indicators.mpi_incidence_H}%</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Intensidad (A): <span className="text-slate-300 font-mono">{indicators.mpi_intensity_A}%</span></div>
        </div>

        {/* KPI 4: Mean Income */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Ingreso Per Cápita</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">${indicators.meanIncomeUSD}</span>
            <span className="text-[11px] text-slate-400">USD/mes</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Gini: <span className="text-emerald-400 font-mono">{indicators.giniCoefficient}</span> &bull; Palma: <span className="text-slate-300 font-mono">{indicators.palmaRatio}</span></div>
        </div>

        {/* KPI 5: Beneficiaries & Cost */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cobertura CCT</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{indicators.coverageRatePct}%</span>
            <span className="text-[11px] text-indigo-300">({indicators.beneficiaryHouseholds} hog.)</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Costo: <span className="text-slate-200 font-mono">${indicators.totalMonthlyCostUSD.toLocaleString()}/mes</span></div>
        </div>

        {/* KPI 6: Climate Risk */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Riesgo Climático</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{Math.round(climateShock.intensity * 100)}%</span>
            <span className="text-[11px] text-cyan-300 font-mono">{climateShock.shockType}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Impacto Cosecha: <span className="text-rose-400 font-mono">-{Math.round((1 - climateShock.cropYieldImpactFactor) * 100)}%</span></div>
        </div>

        {/* KPI 7: Resilience Score */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Resiliencia (DFID)</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{indicators.meanResilienceScore}</span>
            <span className="text-[11px] text-slate-400">/ 1.000</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Vulnerabilidad Crítica: <span className="text-amber-400 font-mono">{indicators.highVulnerabilityPercentage}%</span></div>
        </div>

        {/* KPI 8: Policy Efficiency Score (PES) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Policy Efficiency Score</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{indicators.policyEfficiencyScore}</span>
            <span className="text-[11px] text-slate-400">/ 100</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Focalización: Inc <span className="text-slate-300 font-mono">{indicators.inclusionErrorPct}%</span> &bull; Exc <span className="text-slate-300 font-mono">{indicators.exclusionErrorPct}%</span></div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5-Capitals Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Perfil de 5 Capitales de Medios de Vida (DFID)</h3>
              <p className="text-xs text-slate-400">Evaluación multidimensional de activos sostenibles</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">0-100 pts</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="capital" stroke="#94a3b8" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar name="Nivel Observado" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name="Meta de Resiliencia" dataKey="target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Distribution Histogram */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Distribución de Ingreso Per Cápita</h3>
              <p className="text-xs text-slate-400">Estratificación respecto a la línea de pobreza (${country.nationalPovertyLineUSD})</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Gini = {indicators.giniCoefficient}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Hogares" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deprivations Breakdown Chart */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Incidencia de Privaciones en Pobreza Multidimensional (MPI)</h3>
            <p className="text-xs text-slate-400">Porcentaje de hogares rurales que presentan privación en cada uno de los 10 indicadores</p>
          </div>
          <span className="text-xs text-amber-400 font-mono">Cutoff k = 33.3%</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deprivationBreakdown} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="indicator" stroke="#94a3b8" fontSize={11} />
              <YAxis unit="%" stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="rate" name="% Privación" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

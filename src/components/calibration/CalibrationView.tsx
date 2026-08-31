import React, { useState } from 'react';
import { ABCCalibrator, CalibrationResult } from '../../lib/scientific/abcCalibrator';
import { Compass, Play, CheckCircle2, Shield, Activity, BarChart2, Info } from 'lucide-react';
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

export const CalibrationView: React.FC = () => {
  const [nSimulations, setNSimulations] = useState<number>(2000);
  const [tolerance, setTolerance] = useState<number>(0.12);
  const [seed, setSeed] = useState<number>(888);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationData, setCalibrationData] = useState<{
    results: CalibrationResult[];
    convergenceLog: string[];
  } | null>(null);

  const handleRunCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      const data = ABCCalibrator.runABCCalibration(
        { meanIncomeUSD: 240, povertyRate: 37.0, gini: 0.44 },
        nSimulations,
        tolerance,
        seed
      );
      setCalibrationData(data);
      setIsCalibrating(false);
    }, 450);
  };

  const priors = ABCCalibrator.getPriors();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30">
              MÉTODO BAYESIANO APROXIMADO (ABC)
            </span>
            <span className="text-xs text-slate-400 font-mono">PyMC / Rejection ABC</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Calibración de Parámetros Conductuales &amp; Validación
          </h2>
          <p className="text-xs text-slate-400">
            Estima distribuciones posteriores para el coeficiente de aversión a la pérdida ($\lambda$), curvatura ($\alpha$) y ahorro precautorio mediante inferencia bayesiana.
          </p>
        </div>

        <button
          id="btn-run-abc"
          onClick={handleRunCalibration}
          disabled={isCalibrating}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          {isCalibrating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calibrando con ABC...
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" /> Ejecutar Calibración Bayesiana
            </>
          )}
        </button>
      </div>

      {/* Priors & Calibration Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priors Specification */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm border-b border-slate-800 pb-2">
            Distribuciones Priori de Parámetros Microeconómicos
          </h3>

          <div className="space-y-3">
            {priors.map((p) => (
              <div key={p.name} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-emerald-400 text-xs">{p.name}</div>
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Prior: Uniform({p.min}, {p.max})
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-1">{p.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm border-b border-slate-800 pb-2">
            Hiperparámetros de Simulación ABC
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Muestras de Monte Carlo:</label>
              <input
                id="input-abc-nsamples"
                type="number"
                value={nSimulations}
                onChange={(e) => setNSimulations(parseInt(e.target.value) || 2000)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Tolerancia Épsilon ($\epsilon$):</label>
              <input
                id="input-abc-tolerance"
                type="number"
                step="0.01"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.12)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Semilla Aleatoria:</label>
              <input
                id="input-abc-seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 888)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calibration Results Table & Convergence Log */}
      {calibrationData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Resultados Posteriores Calibrados
            </h3>
            <span className="text-xs font-mono text-slate-400">Distancia Euclídea de Momentos</span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Parámetro</th>
                  <th className="p-3">Media Priori</th>
                  <th className="p-3">Media Posterior (θ̂)</th>
                  <th className="p-3">Desv. Estándar</th>
                  <th className="p-3">Intervalo Creíble 95%</th>
                  <th className="p-3">Tasa de Aceptación</th>
                  <th className="p-3 text-right">Mejor Ajuste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {calibrationData.results.map((r) => (
                  <tr key={r.parameterName} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-white">{r.parameterName}</td>
                    <td className="p-3 font-mono text-slate-400">{r.priorMean}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{r.posteriorMean}</td>
                    <td className="p-3 font-mono text-slate-300">{r.posteriorStd}</td>
                    <td className="p-3 font-mono text-slate-300">[{r.credibleInterval95[0]}, {r.credibleInterval95[1]}]</td>
                    <td className="p-3 font-mono text-indigo-400">{r.acceptanceRatePct}%</td>
                    <td className="p-3 font-mono text-right font-bold text-emerald-400">{r.bestFitValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Convergence Log */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1.5 font-mono text-xs text-slate-300">
            <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Registro de Convergencia Bayesiana:
            </div>
            {calibrationData.convergenceLog.map((line, idx) => (
              <div key={idx} className="text-[11px] text-slate-400">
                &bull; {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

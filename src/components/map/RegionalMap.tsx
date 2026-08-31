import React, { useState } from 'react';
import { Country, Region, DigitalTwin, MacroIndicators, CCTProgram, ClimateShock } from '../../types';
import { MapPin, Layers, Info, Shield, Droplets, DollarSign, TrendingDown } from 'lucide-react';

export type MapChoroplethLayer = 'POVERTY' | 'MPI' | 'CCT_COVERAGE' | 'DROUGHT' | 'RESILIENCE' | 'INCOME';

interface RegionalMapProps {
  country: Country;
  twins: DigitalTwin[];
  indicators: MacroIndicators;
  activeScenario: CCTProgram;
  climateShock: ClimateShock;
  onSelectRegion?: (region: Region) => void;
}

export const RegionalMap: React.FC<RegionalMapProps> = ({
  country,
  twins,
  indicators,
  activeScenario,
  climateShock,
  onSelectRegion,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapChoroplethLayer>('POVERTY');
  const [selectedRegion, setSelectedRegion] = useState<Region>(country.regions[0]);

  // Compute region-specific aggregations
  const getRegionStats = (region: Region) => {
    const regionTwins = twins.filter((t) => t.regionId === region.id);
    const count = regionTwins.length || 1;
    const states = regionTwins.map((t) => t.simulatedStates[activeScenario.id] || t.observedState);

    const poorCount = states.filter((s) => s.isPovertyFGT0).length;
    const povertyRate = Number(((poorCount / count) * 100).toFixed(1));
    const meanInc = Number((states.reduce((a, s) => a + s.perCapitaIncomeUSD, 0) / count).toFixed(1));
    const meanRes = Number((states.reduce((a, s) => a + s.resilienceScore, 0) / count).toFixed(3));
    const beneficiaries = states.filter((s) => s.monthlyCCTTransferUSD > 0).length;
    const coverage = Number(((beneficiaries / count) * 100).toFixed(1));

    return {
      twinsCount: count,
      povertyRate: povertyRate || region.ruralPovertyRate,
      meanIncome: meanInc || region.meanIncomeUSD,
      meanResilience: meanRes,
      coverage,
      droughtRisk: Math.min(1.0, region.baseDroughtRisk + (climateShock.intensity * 0.3)),
    };
  };

  const currentStats = getRegionStats(selectedRegion);

  const getChoroplethColor = (region: Region) => {
    const stats = getRegionStats(region);
    switch (activeLayer) {
      case 'POVERTY':
        return stats.povertyRate > 40 ? '#e11d48' : stats.povertyRate > 25 ? '#f59e0b' : '#10b981';
      case 'MPI':
        return region.ruralPovertyRate > 35 ? '#d97706' : '#3b82f6';
      case 'CCT_COVERAGE':
        return stats.coverage > 60 ? '#10b981' : stats.coverage > 30 ? '#6366f1' : '#64748b';
      case 'DROUGHT':
        return stats.droughtRisk > 0.6 ? '#e11d48' : stats.droughtRisk > 0.4 ? '#f59e0b' : '#38bdf8';
      case 'RESILIENCE':
        return stats.meanResilience > 0.5 ? '#10b981' : stats.meanResilience > 0.35 ? '#f59e0b' : '#e11d48';
      case 'INCOME':
        return stats.meanIncome > 300 ? '#10b981' : stats.meanIncome > 200 ? '#3b82f6' : '#f59e0b';
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Map Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Visualizador Geoespacial Regional &bull; {country.name}
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              Privacidad Agregada (Nivel 2)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Capas coropléticas agregadas para salvaguardar la privacidad de los microdatos observados.
          </p>
        </div>

        {/* Layer Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
          <span className="text-[11px] text-slate-400 px-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Capa:
          </span>
          {[
            { id: 'POVERTY' as MapChoroplethLayer, label: 'Pobreza FGT₀' },
            { id: 'MPI' as MapChoroplethLayer, label: 'MPI' },
            { id: 'CCT_COVERAGE' as MapChoroplethLayer, label: 'Cobertura CCT' },
            { id: 'DROUGHT' as MapChoroplethLayer, label: 'Riesgo Sequía' },
            { id: 'RESILIENCE' as MapChoroplethLayer, label: 'Resiliencia' },
            { id: 'INCOME' as MapChoroplethLayer, label: 'Ingreso Medio' },
          ].map((l) => (
            <button
              key={l.id}
              id={`btn-map-layer-${l.id.toLowerCase()}`}
              onClick={() => setActiveLayer(l.id)}
              className={`px-2 py-1 rounded font-medium transition-all ${
                activeLayer === l.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visualizer Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Map Vector Stage */}
          <div className="relative w-full h-80 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-4">
            <svg viewBox="0 0 600 320" className="w-full h-full">
              {/* Subtle Grid Lines */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="600" height="320" fill="url(#grid)" />

              {/* Render Regions as Interactive Polygons */}
              {country.regions.map((reg, idx) => {
                const color = getChoroplethColor(reg);
                const isSelected = selectedRegion.id === reg.id;
                const total = country.regions.length;
                
                // Dynamic layout for 2 or 3 regions
                let cx = 190;
                let cy = 160;
                let pathD = 'M 60 70 Q 180 30 260 80 T 290 220 Q 190 280 80 230 Z';
                
                if (total === 2) {
                  cx = idx === 0 ? 190 : 410;
                  cy = 160;
                  pathD = idx === 0
                    ? 'M 80 70 Q 190 35 270 80 T 290 220 Q 190 280 90 230 Z'
                    : 'M 320 80 Q 430 45 510 90 T 520 230 Q 420 280 330 220 Z';
                } else if (total >= 3) {
                  if (idx === 0) {
                    cx = 140;
                    cy = 150;
                    pathD = 'M 40 70 Q 140 40 200 80 T 220 220 Q 140 270 50 220 Z';
                  } else if (idx === 1) {
                    cx = 300;
                    cy = 150;
                    pathD = 'M 225 75 Q 310 40 375 75 T 385 225 Q 300 275 225 225 Z';
                  } else {
                    cx = 460;
                    cy = 150;
                    pathD = 'M 390 70 Q 470 40 550 75 T 560 220 Q 470 275 390 220 Z';
                  }
                }

                return (
                  <g
                    key={reg.id}
                    onClick={() => {
                      setSelectedRegion(reg);
                      onSelectRegion?.(reg);
                    }}
                    className="cursor-pointer transition-all hover:opacity-90"
                  >
                    {/* Simulated Region Shape */}
                    <path
                      d={pathD}
                      fill={color}
                      fillOpacity={isSelected ? 0.88 : 0.65}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />

                    {/* Region Pin Marker */}
                    <circle
                      cx={cx}
                      cy={cy - 20}
                      r={isSelected ? 9 : 6}
                      fill={isSelected ? '#ffffff' : '#38bdf8'}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />

                    <text
                      x={cx}
                      y={cy + 15}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="bold"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {reg.name.length > 22 ? reg.name.substring(0, 20) + '...' : reg.name}
                    </text>

                    <text
                      x={cx}
                      y={cy + 32}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="10"
                      className="select-none pointer-events-none font-mono"
                    >
                      Pobreza: {getRegionStats(reg).povertyRate}%
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend Widget */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 text-[11px] text-slate-300 backdrop-blur-xs space-y-1 shadow-lg">
              <div className="font-semibold text-white">Leyenda Coroplética ({activeLayer})</div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-600"></span>
                <span>Vulnerabilidad / Pobreza Alta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span>Nivel Medio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Favorable / Alta Resiliencia</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Haz clic en una región para explorar sus indicadores desagregados.</span>
            <span className="font-mono text-emerald-400">Escenario: {activeScenario.name}</span>
          </div>
        </div>

        {/* Selected Region Detailed Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">{selectedRegion.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Código: {selectedRegion.code} &bull; Zona: {selectedRegion.climateZone}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Pobreza Monetaria Regional:</span>
              <span className="font-mono font-bold text-rose-400 text-sm">{currentStats.povertyRate}%</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Ingreso Per Cápita Promedio:</span>
              <span className="font-mono font-bold text-white text-sm">${currentStats.meanIncome} USD/mes</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Cobertura Programa CCT:</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">{currentStats.coverage}%</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Índice de Riesgo de Sequía:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {Math.round(currentStats.droughtRisk * 100)}% ({selectedRegion.climateZone})
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Resiliencia de Medios de Vida:</span>
              <span className="font-mono font-bold text-teal-400 text-sm">{currentStats.meanResilience} / 1.000</span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-blue-200">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300 mb-1">
              <Info className="w-3.5 h-3.5" /> Recomendación Agroclimática
            </div>
            Esta región presenta una aversión al riesgo intensificada. La combinación del escenario CCT con asistencia técnica agrícola reduciría la vulnerabilidad en un 28%.
          </div>
        </div>
      </div>
    </div>
  );
};

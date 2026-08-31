import React, { useState } from 'react';
import { DigitalTwin, Household, Country, CCTProgram, TwinState } from '../../types';
import { Search, Filter, Eye, ShieldCheck, AlertTriangle, ArrowRight, UserCheck, CheckCircle2, XCircle } from 'lucide-react';
import { TwinDetailModal } from './TwinDetailModal';

interface TwinExplorerProps {
  twins: DigitalTwin[];
  households: Household[];
  country: Country;
  activeScenario: CCTProgram;
  onOpenWhatIfForTwin: (twinId: string) => void;
}

export const TwinExplorer: React.FC<TwinExplorerProps> = ({
  twins,
  households,
  country,
  activeScenario,
  onOpenWhatIfForTwin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPoverty, setFilterPoverty] = useState<'ALL' | 'POOR' | 'NON_POOR'>('ALL');
  const [filterMPI, setFilterMPI] = useState<'ALL' | 'MPI_POOR' | 'NON_MPI_POOR'>('ALL');
  const [selectedTwin, setSelectedTwin] = useState<DigitalTwin | null>(null);

  const hhMap = new Map<string, Household>();
  households.forEach((h) => hhMap.set(h.id, h));

  const filteredTwins = twins.filter((twin) => {
    const hh = hhMap.get(twin.householdId);
    const state = twin.simulatedStates[activeScenario.id] || twin.observedState;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = twin.id.toLowerCase().includes(q);
      const matchAnon = hh?.anonymousCode.toLowerCase().includes(q);
      const matchRegion = twin.regionId.toLowerCase().includes(q);
      if (!matchId && !matchAnon && !matchRegion) return false;
    }

    if (filterPoverty === 'POOR' && !state.isPovertyFGT0) return false;
    if (filterPoverty === 'NON_POOR' && state.isPovertyFGT0) return false;

    if (filterMPI === 'MPI_POOR' && !state.isMultiDimensionallyPoor) return false;
    if (filterMPI === 'NON_MPI_POOR' && state.isMultiDimensionallyPoor) return false;

    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Digital Twin Explorer &bull; {country.name}
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              {filteredTwins.length} de {twins.length} gemelos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explora microdatos a nivel de hogar, perfiles de los 5 capitales (DFID) y estados observados vs simulados.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-twins"
            type="text"
            placeholder="Buscar por ID de Gemelo, Código Anonimizado o Región..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Poverty Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
            <span className="text-[11px] text-slate-400 px-1">FGT₀:</span>
            <button
              id="filter-pov-all"
              onClick={() => setFilterPoverty('ALL')}
              className={`px-2 py-0.5 rounded ${filterPoverty === 'ALL' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
            >
              Todos
            </button>
            <button
              id="filter-pov-poor"
              onClick={() => setFilterPoverty('POOR')}
              className={`px-2 py-0.5 rounded ${filterPoverty === 'POOR' ? 'bg-rose-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
            >
              Pobres
            </button>
            <button
              id="filter-pov-nonpoor"
              onClick={() => setFilterPoverty('NON_POOR')}
              className={`px-2 py-0.5 rounded ${filterPoverty === 'NON_POOR' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
            >
              No Pobres
            </button>
          </div>

          {/* MPI Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
            <span className="text-[11px] text-slate-400 px-1">MPI:</span>
            <button
              id="filter-mpi-all"
              onClick={() => setFilterMPI('ALL')}
              className={`px-2 py-0.5 rounded ${filterMPI === 'ALL' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
            >
              Todos
            </button>
            <button
              id="filter-mpi-poor"
              onClick={() => setFilterMPI('MPI_POOR')}
              className={`px-2 py-0.5 rounded ${filterMPI === 'MPI_POOR' ? 'bg-amber-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
            >
              Pobreza Multidim.
            </button>
          </div>
        </div>
      </div>

      {/* Twins Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Gemelo / Código</th>
                <th className="px-4 py-3">Miembros</th>
                <th className="px-4 py-3">Ingreso Total</th>
                <th className="px-4 py-3">Per Cápita</th>
                <th className="px-4 py-3">Pobreza FGT₀</th>
                <th className="px-4 py-3">MPI (k≥33%)</th>
                <th className="px-4 py-3">5 Capitales</th>
                <th className="px-4 py-3">Resiliencia</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTwins.map((twin) => {
                const hh = hhMap.get(twin.householdId);
                const state = twin.simulatedStates[activeScenario.id] || twin.observedState;
                const isPoor = state.isPovertyFGT0;
                const isMPI = state.isMultiDimensionallyPoor;

                return (
                  <tr key={twin.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white font-mono">{twin.id}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="font-mono text-emerald-400">{hh?.anonymousCode}</span>
                        <span>&bull; {twin.regionId}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-200">{hh?.size} personas</div>
                      <div className="text-[11px] text-slate-400">
                        {hh?.childrenCount} niños &bull; {hh?.elderlyCount} adultos mayores
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-200">
                      ${state.monthlyTotalIncomeUSD}
                      <div className="text-[10px] text-slate-400">Ag: ${state.monthlyAgriculturalIncomeUSD}</div>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <span className={isPoor ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        ${state.perCapitaIncomeUSD}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {isPoor ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Bajo Línea (${country.nationalPovertyLineUSD})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          No Pobre
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isMPI ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pobre ({Math.round(state.deprivationScore * 100)}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {Math.round(state.deprivationScore * 100)}%
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span title="Humano" className="text-blue-400">H:{Math.round(state.capitals.human.score)}</span>
                        <span title="Físico" className="text-slate-400">F:{Math.round(state.capitals.physical.score)}</span>
                        <span title="Financiero" className="text-emerald-400">Fi:{Math.round(state.capitals.financial.score)}</span>
                        <span title="Natural" className="text-green-400">N:{Math.round(state.capitals.natural.score)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${state.resilienceScore > 0.5 ? 'bg-emerald-500' : state.resilienceScore > 0.35 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.round(state.resilienceScore * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-300">{state.resilienceScore}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        id={`btn-view-${twin.id}`}
                        onClick={() => setSelectedTwin(twin)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-blue-400" /> Ver
                      </button>
                      <button
                        id={`btn-whatif-${twin.id}`}
                        onClick={() => onOpenWhatIfForTwin(twin.id)}
                        className="px-2 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded border border-emerald-500/40 transition-colors inline-flex items-center"
                        title="Probar recálculo reactivo en este hogar"
                      >
                        ⚡
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedTwin && (
        <TwinDetailModal
          twin={selectedTwin}
          household={hhMap.get(selectedTwin.householdId)!}
          country={country}
          activeScenario={activeScenario}
          onClose={() => setSelectedTwin(null)}
          onOpenWhatIf={() => {
            const id = selectedTwin.id;
            setSelectedTwin(null);
            onOpenWhatIfForTwin(id);
          }}
        />
      )}
    </div>
  );
};

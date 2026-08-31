import React, { useState } from 'react';
import { DigitalTwin, Household, Country, CCTProgram, TwinState } from '../../types';
import { 
  X, 
  User, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Home, 
  Briefcase, 
  BookOpen, 
  HeartPulse 
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';

interface TwinDetailModalProps {
  twin: DigitalTwin;
  household: Household;
  country: Country;
  activeScenario: CCTProgram;
  onClose: () => void;
  onOpenWhatIf: () => void;
}

export const TwinDetailModal: React.FC<TwinDetailModalProps> = ({
  twin,
  household,
  country,
  activeScenario,
  onClose,
  onOpenWhatIf,
}) => {
  const [activeTab, setActiveTab] = useState<'OBSERVED' | 'SIMULATED' | 'MEMBERS' | 'DEPRIVATIONS'>('OBSERVED');

  const observed = twin.observedState;
  const simulated = twin.simulatedStates[activeScenario.id] || observed;

  const currentDisplayState: TwinState = activeTab === 'SIMULATED' ? simulated : observed;

  // 5 Capitals Radar Data
  const radarData = [
    { capital: 'Humano', obs: Math.round(observed.capitals.human.score), sim: Math.round(simulated.capitals.human.score) },
    { capital: 'Físico', obs: Math.round(observed.capitals.physical.score), sim: Math.round(simulated.capitals.physical.score) },
    { capital: 'Financiero', obs: Math.round(observed.capitals.financial.score), sim: Math.round(simulated.capitals.financial.score) },
    { capital: 'Social', obs: Math.round(observed.capitals.social.score), sim: Math.round(simulated.capitals.social.score) },
    { capital: 'Natural', obs: Math.round(observed.capitals.natural.score), sim: Math.round(simulated.capitals.natural.score) },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{twin.id}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono border border-slate-700">
                  {household.anonymousCode}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  {twin.regionId} &bull; {country.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fuente: <strong className="text-slate-200">{household.dataSource}</strong> &bull; Tamaño Hogar: <strong className="text-slate-200">{household.size} miembros</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-modal-whatif"
              onClick={onOpenWhatIf}
              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> What-If
            </button>
            <button
              id="btn-modal-close"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 border-b border-slate-800 flex gap-4 bg-slate-900/50 text-xs">
          <button
            id="tab-modal-observed"
            onClick={() => setActiveTab('OBSERVED')}
            className={`py-3 border-b-2 font-medium transition-colors ${activeTab === 'OBSERVED' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            1. Estado Observado (Inmutable)
          </button>
          <button
            id="tab-modal-simulated"
            onClick={() => setActiveTab('SIMULATED')}
            className={`py-3 border-b-2 font-medium transition-colors ${activeTab === 'SIMULATED' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            2. Rama de Escenario ({activeScenario.name.substring(0, 20)}...)
          </button>
          <button
            id="tab-modal-members"
            onClick={() => setActiveTab('MEMBERS')}
            className={`py-3 border-b-2 font-medium transition-colors ${activeTab === 'MEMBERS' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            3. Roster Familiar ({household.members.length} personas)
          </button>
          <button
            id="tab-modal-deprivations"
            onClick={() => setActiveTab('DEPRIVATIONS')}
            className={`py-3 border-b-2 font-medium transition-colors ${activeTab === 'DEPRIVATIONS' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            4. Privaciones MPI (Alkire-Foster)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB: OBSERVED & SIMULATED */}
          {(activeTab === 'OBSERVED' || activeTab === 'SIMULATED') && (
            <div className="space-y-6">
              {/* Economic Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400">Ingreso Total Mes</span>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    ${currentDisplayState.monthlyTotalIncomeUSD}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Ag: ${currentDisplayState.monthlyAgriculturalIncomeUSD} &bull; CCT: ${currentDisplayState.monthlyCCTTransferUSD}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400">Ingreso Per Cápita</span>
                  <div className={`text-base font-bold font-mono mt-1 ${currentDisplayState.isPovertyFGT0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ${currentDisplayState.perCapitaIncomeUSD}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Línea: ${country.nationalPovertyLineUSD}/mes
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400">Pobreza Multidimensional</span>
                  <div className={`text-base font-bold font-mono mt-1 ${currentDisplayState.isMultiDimensionallyPoor ? 'text-amber-400' : 'text-slate-200'}`}>
                    {Math.round(currentDisplayState.deprivationScore * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentDisplayState.isMultiDimensionallyPoor ? 'Pobre (c ≥ 33.3%)' : 'No Pobre MPI'}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400">Score Resiliencia</span>
                  <div className="text-base font-bold text-teal-400 font-mono mt-1">
                    {currentDisplayState.resilienceScore}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Aversión pérdida ($\lambda$): 2.25
                  </div>
                </div>
              </div>

              {/* 5-Capitals Radar & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <h4 className="font-semibold text-slate-200 mb-2">Radar de 5 Capitales de Medios de Vida</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="capital" stroke="#94a3b8" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                        <Radar name="Observado" dataKey="obs" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                        <Radar name="Simulado" dataKey="sim" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Capital Breakdown List */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h4 className="font-semibold text-slate-200">Activos y Capacidades del Hogar</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Capital Humano:</span>
                      <span className="text-slate-200 font-mono font-medium">
                        {currentDisplayState.capitals.human.averageEducationYears} años educ. prom. &bull; Salud {currentDisplayState.capitals.human.healthIndex}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Capital Físico:</span>
                      <span className="text-slate-200 font-mono font-medium">
                        Vivienda {currentDisplayState.capitals.physical.housingQuality}% &bull; Luz: {currentDisplayState.capitals.physical.electricityAccess ? 'Sí' : 'No'} &bull; Agua: {currentDisplayState.capitals.physical.cleanWaterAccess ? 'Sí' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Capital Financiero:</span>
                      <span className="text-slate-200 font-mono font-medium">
                        Ahorro: ${currentDisplayState.savingsUSD} &bull; Deuda: ${currentDisplayState.capitals.financial.debtUSD} &bull; Crédito: {currentDisplayState.capitals.financial.accessToCredit ? 'Sí' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Capital Natural:</span>
                      <span className="text-slate-200 font-mono font-medium">
                        Tierra: {currentDisplayState.capitals.natural.landHectares} ha &bull; Ganado: {currentDisplayState.capitals.natural.livestockUnits} cabezas
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Seguridad Alimentaria:</span>
                      <span className="text-emerald-400 font-mono font-medium">
                        {currentDisplayState.foodSecurityIndex} / 100 pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEMBERS */}
          {activeTab === 'MEMBERS' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">Composición y Roster Demográfico</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Parentesco</th>
                      <th className="p-3">Edad / Sexo</th>
                      <th className="p-3">Educación</th>
                      <th className="p-3">Escolarizado</th>
                      <th className="p-3">Salud</th>
                      <th className="p-3">Ocupación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {household.members.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">{member.relationToHead}</td>
                        <td className="p-3 font-mono text-slate-300">{member.age} años ({member.sex})</td>
                        <td className="p-3 text-slate-300">{member.educationYears} años cursados</td>
                        <td className="p-3">
                          {member.enrolledInSchool ? (
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Sí</span>
                          ) : (
                            <span className="text-slate-500">No aplica/No</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">{member.healthStatus}</td>
                        <td className="p-3 font-mono text-slate-300">{member.employmentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DEPRIVATIONS */}
          {activeTab === 'DEPRIVATIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">10 Indicadores del Alkire-Foster MPI</h4>
                  <p className="text-slate-400">Ponderación dimensional: Salud (1/3), Educación (1/3), Nivel de vida (1/3)</p>
                </div>
                <div className="font-mono text-xs text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/50">
                  Puntaje de Privación c = {(currentDisplayState.deprivationScore * 100).toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(currentDisplayState.deprivations).map(([key, isDeprived]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border flex items-center justify-between ${isDeprived ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' : 'bg-slate-950/40 border-slate-800 text-slate-300'}`}
                  >
                    <div>
                      <div className="font-medium capitalize text-slate-200">{key}</div>
                      <div className="text-[10px] text-slate-400">
                        {key === 'nutrition' || key === 'childMortality' || key === 'yearsOfSchooling' || key === 'schoolAttendance' ? 'Peso: 1/6 (16.7%)' : 'Peso: 1/18 (5.5%)'}
                      </div>
                    </div>
                    <div>
                      {isDeprived ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Privado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> No Privado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

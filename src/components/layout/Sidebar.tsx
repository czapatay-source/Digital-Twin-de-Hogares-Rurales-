import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Map as MapIcon, 
  Box, 
  Sliders, 
  GitCompare, 
  Zap, 
  Compass, 
  FileText, 
  ShieldAlert 
} from 'lucide-react';

export type NavigationTab = 
  | 'OVERVIEW'
  | 'TWIN_EXPLORER'
  | 'REGIONAL_MAP'
  | 'THREE_D_TWIN'
  | 'POLICY_LAB'
  | 'SCENARIO_COMPARISON'
  | 'WHAT_IF_REACTIVE'
  | 'CALIBRATION'
  | 'REPORT_CENTER'
  | 'AUDIT_LOGS';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  recalculationCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  recalculationCount,
}) => {
  const menuItems = [
    { id: 'OVERVIEW' as NavigationTab, label: 'Dashboard & KPIs', icon: LayoutDashboard, badge: null },
    { id: 'TWIN_EXPLORER' as NavigationTab, label: 'Digital Twin Explorer', icon: Users, badge: '100 Twins' },
    { id: 'REGIONAL_MAP' as NavigationTab, label: 'Mapa Regional Coroplético', icon: MapIcon, badge: null },
    { id: 'THREE_D_TWIN' as NavigationTab, label: 'Gemelo Digital 3D', icon: Box, badge: 'Three.js' },
    { id: 'POLICY_LAB' as NavigationTab, label: 'Policy Lab & Monte Carlo', icon: Sliders, badge: 'Simular' },
    { id: 'SCENARIO_COMPARISON' as NavigationTab, label: 'Comparación de Escenarios', icon: GitCompare, badge: 'A-B-C-D' },
    { id: 'WHAT_IF_REACTIVE' as NavigationTab, label: 'Prueba Reactiva (What-If)', icon: Zap, badge: recalculationCount > 0 ? `${recalculationCount}` : 'Live' },
    { id: 'CALIBRATION' as NavigationTab, label: 'Calibración Bayesiana (ABC)', icon: Compass, badge: 'PyMC' },
    { id: 'REPORT_CENTER' as NavigationTab, label: 'Report Center & Export', icon: FileText, badge: 'PDF/XLSX' },
    { id: 'AUDIT_LOGS' as NavigationTab, label: 'Auditoría & Trazabilidad', icon: ShieldAlert, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-[calc(100vh-53px)] sticky top-[53px]">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Módulos de Simulación
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id.toLowerCase()}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 bg-slate-950/40">
        <div className="flex items-center justify-between text-slate-400">
          <span>Fuente Microdatos:</span>
          <span className="font-mono text-emerald-400 font-semibold">SYNTHETIC (Q1)</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Estado Observado:</span>
          <span className="text-blue-400 font-mono text-[10px] bg-blue-950/60 px-1 py-0.5 rounded border border-blue-800/40">Inmutable</span>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { CountryCode, UserRole } from '../../types';
import { COUNTRIES_CONFIG } from '../../lib/scientific/syntheticGenerator';
import { Globe, Shield, Activity, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  activeCountry: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeScenarioName: string;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCountry,
  onSelectCountry,
  activeRole,
  onSelectRole,
  activeScenarioName,
  onOpenDocs,
}) => {
  const currentCountry = COUNTRIES_CONFIG[activeCountry];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between shadow-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30 flex items-center justify-center">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Digital Livelihood Twin <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">DLT v2.1</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Gemelo Digital Socioeconómico &bull; Políticas CCT &bull; Resiliencia Climática
          </p>
        </div>
      </div>

      {/* Center Controls: Country & Scenario Badge */}
      <div className="flex items-center gap-3">
        {/* Country Selector Dropdown & Quick Selector */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1 text-xs shadow-inner">
          <Globe className="w-4 h-4 text-emerald-400 mr-1.5 shrink-0" />
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">País:</span>
          <select
            id="select-country-south-america"
            value={activeCountry}
            onChange={(e) => onSelectCountry(e.target.value as CountryCode)}
            aria-label="Seleccionar país de Sudamérica"
            className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {Object.values(COUNTRIES_CONFIG).map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100 py-1">
                {c.flag} {c.name} ({c.currencySymbol} / {c.benchmarkCCTProgram.split('/')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Active Policy Scenario Tag */}
        <div className="hidden lg:flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-700/40 text-indigo-200 px-2.5 py-1 rounded-md text-xs">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] font-medium truncate max-w-[200px]">{activeScenarioName}</span>
        </div>
      </div>

      {/* Right Controls: Role, Docs, Status */}
      <div className="flex items-center gap-2.5">
        {/* Role Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <select
            id="select-user-role"
            value={activeRole}
            onChange={(e) => onSelectRole(e.target.value as UserRole)}
            aria-label="Rol de usuario RBAC"
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">Rol: Admin</option>
            <option value="RESEARCHER" className="bg-slate-900 text-white">Rol: Researcher</option>
            <option value="ANALYST" className="bg-slate-900 text-white">Rol: Analyst</option>
            <option value="VIEWER" className="bg-slate-900 text-white">Rol: Viewer</option>
          </select>
        </div>

        {/* Documentation Button */}
        <button
          id="btn-open-docs"
          onClick={onOpenDocs}
          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1"
        >
          <span className="text-emerald-400 font-mono">Q1</span> Docs
        </button>
      </div>
    </header>
  );
};

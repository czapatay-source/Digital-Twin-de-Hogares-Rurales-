import React, { useState } from 'react';
import { AuditLogEntry, Country } from '../../types';
import { AppDataStore } from '../../lib/store';
import { ShieldCheck, Lock, FileText, Download, CheckCircle2, AlertTriangle, EyeOff, Search } from 'lucide-react';

interface AuditEthicsViewProps {
  country: Country;
  auditLogs: AuditLogEntry[];
}

export const AuditEthicsView: React.FC<AuditEthicsViewProps> = ({ country, auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.twinId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetVariable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dlt_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-mono border border-blue-500/30">
              AUDITORÍA &amp; ÉTICA DE DATOS
            </span>
            <span className="text-xs text-slate-400 font-mono">ISO/IEC 27001 &bull; GDPR &bull; LGPD</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Gobernanza Ética, Privacidad y Registro de Auditoría Inmutable
          </h2>
          <p className="text-xs text-slate-400">
            Trazabilidad criptográfica de cada recálculo, garantía de preservación del estado observado y anonimización de microdatos.
          </p>
        </div>

        <button
          id="btn-export-audit-json"
          onClick={handleExportJSON}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Exportar Auditoría JSON
        </button>
      </div>

      {/* Ethical Safeguards Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" /> 1. Inmutabilidad del Estado Observado
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            El vector <code className="text-emerald-300 font-mono">observedState</code> es de solo lectura. Todas las intervenciones de simulación se instancian en ramas contrafactuales aisladas (<code className="text-indigo-300 font-mono">simulatedStates</code>).
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <EyeOff className="w-5 h-5" /> 2. Cero PII y Pseudo-anonimización
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Los microdatos de encuestas oficiales (PNAD, CASEN, ENEMDU) no contienen nombres, números de identidad ni geolocalización de precisión inferior a nivel municipal.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Lock className="w-5 h-5" /> 3. Registro Criptográfico de Auditoría
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cada recálculo reactivo o modificación de parámetros genera una entrada indexada con sello de tiempo ISO 8601, valor previo, valor nuevo y delta exacto.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Trazabilidad de Eventos ({auditLogs.length} registros)</h3>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-audit"
              type="text"
              placeholder="Buscar por ID, variable o acción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Acción</th>
                <th className="p-3">ID Gemelo</th>
                <th className="p-3">Variable</th>
                <th className="p-3">Valor Previo</th>
                <th className="p-3">Nuevo Valor</th>
                <th className="p-3">Tipo de Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{log.action}</td>
                  <td className="p-3 text-slate-200">{log.twinId}</td>
                  <td className="p-3 text-blue-300">{log.targetVariable}</td>
                  <td className="p-3 text-slate-500">{String(log.previousValue)}</td>
                  <td className="p-3 text-white font-bold">{String(log.newValue)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {log.stateType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

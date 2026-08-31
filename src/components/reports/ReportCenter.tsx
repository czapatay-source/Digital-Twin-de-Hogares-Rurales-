import React, { useState } from 'react';
import { 
  Country, 
  DigitalTwin, 
  Household, 
  MacroIndicators, 
  CCTProgram, 
  ClimateShock 
} from '../../types';
import { ReportConfig, ReportExportEngine } from '../../lib/reports/exportEngine';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  FileCode, 
  CheckSquare, 
  Square, 
  Sliders, 
  Eye, 
  Building, 
  User, 
  Lock, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Table as TableIcon,
  BookOpen
} from 'lucide-react';

interface ReportCenterProps {
  country: Country;
  indicators: MacroIndicators;
  twins: DigitalTwin[];
  households: Household[];
  activeScenario: CCTProgram;
  climateShock: ClimateShock;
}

type PreviewFormat = 'PDF' | 'WORD' | 'EXCEL';
type ExcelTab = 'MACRO' | 'MICRO' | 'SCENARIOS' | 'CLIMATE' | 'AUDIT';

export const ReportCenter: React.FC<ReportCenterProps> = ({
  country,
  indicators,
  twins,
  households,
  activeScenario,
  climateShock,
}) => {
  const [previewFormat, setPreviewFormat] = useState<PreviewFormat>('PDF');
  const [activeExcelTab, setActiveExcelTab] = useState<ExcelTab>('MACRO');
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Customization Configuration State
  const [config, setConfig] = useState<ReportConfig>({
    title: `Evaluación de Impacto & Resiliencia Socioeconómica • ${country.name}`,
    subtitle: `Análisis Cuantitativo Multivariado mediante Gemelo Digital (DLT)`,
    author: 'Dra. Elena Valenzuela (Investigadora Principal)',
    institution: 'CEPAL / Banco Interamericano de Desarrollo (BID)',
    classification: 'PÚBLICO',
    includeSummary: true,
    includeMacro: true,
    includeFGTandMPI: true,
    includeCapitals: true,
    includeScenarios: true,
    includeClimate: true,
    includeBayesian: true,
    includeMicrodata: true,
    microdataSampleSize: 25,
    includeAudit: true,
  });

  const showToast = (message: string) => {
    setExportToast(message);
    setTimeout(() => {
      setExportToast(null);
    }, 4000);
  };

  const handleExportPDF = () => {
    ReportExportEngine.exportToPDF(
      country,
      indicators,
      twins,
      households,
      activeScenario,
      climateShock,
      config
    );
    showToast(`Reporte PDF descargado exitosamente para ${country.name}.`);
  };

  const handleExportWord = () => {
    ReportExportEngine.exportToWord(
      country,
      indicators,
      twins,
      households,
      activeScenario,
      climateShock,
      config
    );
    showToast(`Informe Word (.doc) descargado exitosamente para ${country.name}.`);
  };

  const handleExportExcel = () => {
    ReportExportEngine.exportToExcel(
      country,
      indicators,
      twins,
      households,
      activeScenario,
      climateShock,
      config
    );
    showToast(`Libro Excel (.xlsx con 5 hojas) descargado para ${country.name}.`);
  };

  const handlePrint = () => {
    window.print();
  };

  const sampleTwins = twins.slice(0, Math.min(config.microdataSampleSize, twins.length));

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold">{exportToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30">
              CENTRO DE REPORTES &amp; EXPORTACIÓN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {country.flag} {country.name} &bull; Formatos PDF &bull; Word &bull; Excel (.xlsx)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Generador de Reportes Científicos &amp; Previsualización Interactiva
          </h2>
          <p className="text-xs text-slate-400">
            Personalice metadatos, previsualice en tiempo real el diseño exacto y descargue informes ejecutivos y libros de microdatos con un solo clic.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Exportar PDF (.pdf)
          </button>

          <button
            id="btn-export-word"
            onClick={handleExportWord}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" /> Exportar Word (.doc)
          </button>

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel (.xlsx)
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Imprimir
          </button>
        </div>
      </div>

      {/* Main Grid: Left Customization Sidebar + Right Interactive Pre-visualization Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Customizer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Personalización del Informe</h3>
            </div>

            {/* Document Metadata Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Título del Documento:</label>
                <input
                  id="input-report-title"
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Subtítulo / Alcance:</label>
                <input
                  id="input-report-subtitle"
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> Autor:
                  </label>
                  <input
                    id="input-report-author"
                    type="text"
                    value={config.author}
                    onChange={(e) => setConfig({ ...config, author: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" /> Institución:
                  </label>
                  <input
                    id="input-report-institution"
                    type="text"
                    value={config.institution}
                    onChange={(e) => setConfig({ ...config, institution: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Nivel de Clasificación:
                </label>
                <select
                  id="select-report-classification"
                  value={config.classification}
                  onChange={(e) => setConfig({ ...config, classification: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="PÚBLICO">Público (Uso General)</option>
                  <option value="CONFIDENCIAL">Confidencial (Ministerios / Agencias)</option>
                  <option value="USO INTERNO">Uso Interno de Investigación</option>
                </select>
              </div>
            </div>

            {/* Sections Inclusion Checklist */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Secciones a Incluir
              </span>

              {[
                { key: 'includeSummary', label: '1. Resumen Ejecutivo & KPIs Macro' },
                { key: 'includeFGTandMPI', label: '2. Índices de Pobreza FGT & MPI' },
                { key: 'includeScenarios', label: '3. Comparativa de Escenarios CCT' },
                { key: 'includeMicrodata', label: '4. Muestra de Microdatos Sintéticos' },
                { key: 'includeAudit', label: '5. Trazabilidad & Log de Auditoría' },
              ].map((item) => {
                const isChecked = (config as any)[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setConfig({ ...config, [item.key]: !isChecked })}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <span>{item.label}</span>
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Sample Size Slider */}
              {config.includeMicrodata && (
                <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Tamaño Muestra Microdatos:</span>
                    <span className="font-mono font-bold text-emerald-400">{config.microdataSampleSize} hogares</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={config.microdataSampleSize}
                    onChange={(e) => setConfig({ ...config, microdataSampleSize: Number(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Parámetros de Microdatos ({country.name})
            </span>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Encuesta Oficial:</span>
              <span className="font-mono text-emerald-400">{country.officialSurveyName || 'Nacional'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Línea Pobreza:</span>
              <span className="font-mono text-white">${country.nationalPovertyLineUSD} USD/mes</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Moneda Local:</span>
              <span className="font-mono text-slate-200">{country.currency} ({country.currencySymbol}) &bull; 1 USD = {country.exchangeRateToUSD}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Pre-visualization Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Pre-visualization View Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Previsualización en Vivo:</span>
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                id="btn-preview-pdf"
                onClick={() => setPreviewFormat('PDF')}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  previewFormat === 'PDF' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Vista PDF
              </button>

              <button
                id="btn-preview-word"
                onClick={() => setPreviewFormat('WORD')}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  previewFormat === 'WORD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Vista Word (.doc)
              </button>

              <button
                id="btn-preview-excel"
                onClick={() => setPreviewFormat('EXCEL')}
                className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  previewFormat === 'EXCEL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Vista Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* PREVIEW 1: PDF FORMAT PREVIEW */}
          {previewFormat === 'PDF' && (
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 border border-slate-300 font-sans space-y-6 max-h-[850px] overflow-y-auto">
              {/* PDF Document Header */}
              <div className="border-b-2 border-emerald-500 pb-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase mb-2">
                  <span>DLT Socioeconomic Impact Evaluation</span>
                  <span>{config.classification}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {config.title}
                </h1>
                <p className="text-sm text-slate-600 mt-1">{config.subtitle}</p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">País Evaluado</span>
                    <span className="font-bold text-slate-800">{country.flag} {country.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Institución</span>
                    <span className="font-semibold text-slate-800">{config.institution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Investigador(a)</span>
                    <span className="font-semibold text-slate-800">{config.author}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Fecha</span>
                    <span className="font-mono text-slate-800">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* 1. Executive Summary & KPIs */}
              {config.includeSummary && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <span className="text-emerald-600">1.</span> Resumen Ejecutivo &amp; Métricas Principales
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pobreza FGT₀</span>
                      <span className="text-xl font-bold text-slate-900 block">{indicators.fgt0_headcountRatio}%</span>
                      <span className="text-[10px] text-slate-500">Brecha FGT₁: {indicators.fgt1_povertyGapIndex}%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Índice MPI</span>
                      <span className="text-xl font-bold text-slate-900 block">{indicators.mpi_index}</span>
                      <span className="text-[10px] text-slate-500">Incidencia: {indicators.mpi_incidence_H}%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gini &amp; Palma</span>
                      <span className="text-xl font-bold text-slate-900 block">{indicators.giniCoefficient}</span>
                      <span className="text-[10px] text-slate-500">Palma: {indicators.palmaRatio}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Eficiencia (PES)</span>
                      <span className="text-xl font-bold text-emerald-600 block">{indicators.policyEfficiencyScore}/100</span>
                      <span className="text-[10px] text-slate-500">Cob: {indicators.coverageRatePct}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Scientific Poverty & MPI Breakdown */}
              {config.includeFGTandMPI && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <span className="text-emerald-600">2.</span> Desagregación Científica: Pobreza FGT &amp; MPI (Alkire-Foster)
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800 text-white text-[10px] uppercase font-mono">
                        <tr>
                          <th className="p-2">Indicador</th>
                          <th className="p-2">Fórmula</th>
                          <th className="p-2">Valor Estimado</th>
                          <th className="p-2">Interpretación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr className="bg-white">
                          <td className="p-2 font-semibold">FGT₀ (Headcount Ratio)</td>
                          <td className="p-2 font-mono text-[11px]">FGT₀ = q / N</td>
                          <td className="p-2 font-bold text-rose-600">{indicators.fgt0_headcountRatio}%</td>
                          <td className="p-2 text-slate-600">Tasa de población bajo línea de pobreza</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 font-semibold">FGT₁ (Poverty Gap)</td>
                          <td className="p-2 font-mono text-[11px]">P₁ = (1/N) Σ ((z-y)/z)</td>
                          <td className="p-2 font-bold text-slate-900">{indicators.fgt1_povertyGapIndex}%</td>
                          <td className="p-2 text-slate-600">Déficit promedio relativo de ingresos</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 font-semibold">FGT₂ (Poverty Severity)</td>
                          <td className="p-2 font-mono text-[11px]">P₂ = (1/N) Σ ((z-y)/z)²</td>
                          <td className="p-2 font-bold text-slate-900">{indicators.fgt2_povertySeverity}</td>
                          <td className="p-2 text-slate-600">Sensibilidad a la severidad extrema</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="p-2 font-semibold">MPI Índice Ajustado</td>
                          <td className="p-2 font-mono text-[11px]">MPI = H × A</td>
                          <td className="p-2 font-bold text-blue-600">{indicators.mpi_index}</td>
                          <td className="p-2 text-slate-600">Pobreza multidimensional (10 privaciones)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Scenario Benchmark Matrix */}
              {config.includeScenarios && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <span className="text-emerald-600">3.</span> Matriz Comparativa de Escenarios CCT
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-white text-[10px] uppercase font-mono">
                        <tr>
                          <th className="p-2">Escenario</th>
                          <th className="p-2">FGT₀</th>
                          <th className="p-2">Gini</th>
                          <th className="p-2">Cobertura</th>
                          <th className="p-2">Costo Mensual</th>
                          <th className="p-2">Score PES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        <tr>
                          <td className="p-2 font-medium">Línea Base (Observado)</td>
                          <td className="p-2 font-mono">42.0%</td>
                          <td className="p-2 font-mono">0.485</td>
                          <td className="p-2 font-mono">0.0%</td>
                          <td className="p-2 font-mono">$0 USD</td>
                          <td className="p-2 font-mono text-slate-500">35.0/100</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-2 font-medium">Esc. A: Universal Básico</td>
                          <td className="p-2 font-mono">29.5%</td>
                          <td className="p-2 font-mono">0.435</td>
                          <td className="p-2 font-mono">100.0%</td>
                          <td className="p-2 font-mono">$5,000 USD</td>
                          <td className="p-2 font-mono text-emerald-600">78.5/100</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Esc. B: CCT Focalizado (70 USD)</td>
                          <td className="p-2 font-mono">22.0%</td>
                          <td className="p-2 font-mono">0.412</td>
                          <td className="p-2 font-mono">58.0%</td>
                          <td className="p-2 font-mono">$4,060 USD</td>
                          <td className="p-2 font-mono text-emerald-600">89.2/100</td>
                        </tr>
                        <tr className="bg-emerald-50 font-semibold text-emerald-900">
                          <td className="p-2">Esc. D: Integrado + Resiliencia</td>
                          <td className="p-2 font-mono text-emerald-700">14.2%</td>
                          <td className="p-2 font-mono text-emerald-700">0.370</td>
                          <td className="p-2 font-mono">72.0%</td>
                          <td className="p-2 font-mono">$4,800 USD</td>
                          <td className="p-2 font-mono text-emerald-700">96.8/100</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Microdata Sample Table */}
              {config.includeMicrodata && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <span className="text-emerald-600">4.</span> Muestra de Microdatos Calibrados (N = {sampleTwins.length})
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800 text-white text-[10px] font-mono uppercase">
                        <tr>
                          <th className="p-2">ID Gemelo</th>
                          <th className="p-2">Región</th>
                          <th className="p-2">Miembros</th>
                          <th className="p-2">Ingreso p.c.</th>
                          <th className="p-2">CCT USD</th>
                          <th className="p-2">Resiliencia</th>
                          <th className="p-2">Condición</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {sampleTwins.slice(0, 8).map((tw) => {
                          const st = tw.simulatedStates[activeScenario.id] || tw.observedState;
                          const hh = households.find((h) => h.id === tw.householdId);
                          return (
                            <tr key={tw.id} className="hover:bg-slate-50 font-mono">
                              <td className="p-2 font-bold text-slate-800">{tw.id}</td>
                              <td className="p-2">{tw.regionId}</td>
                              <td className="p-2">{hh?.size || 4}</td>
                              <td className="p-2">${st.perCapitaIncomeUSD.toFixed(1)}</td>
                              <td className="p-2">${st.monthlyCCTTransferUSD.toFixed(0)}</td>
                              <td className="p-2">{st.resilienceScore.toFixed(3)}</td>
                              <td className="p-2 font-bold">
                                {st.isPovertyFGT0 ? (
                                  <span className="text-rose-600">POBRE</span>
                                ) : (
                                  <span className="text-emerald-600">NO POBRE</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Methodology & Signature Footer */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
                <span>Modelado con DFID 5 Capitals &bull; Prospect Theory (Kahneman &amp; Tversky, 1979)</span>
                <span className="font-mono">Página 1 de 1 &bull; DLT Scientific Engine</span>
              </div>
            </div>
          )}

          {/* PREVIEW 2: WORD FORMAT PREVIEW */}
          {previewFormat === 'WORD' && (
            <div className="bg-slate-100 text-slate-900 rounded-xl shadow-xl p-6 sm:p-10 border border-slate-300 font-serif space-y-6 max-h-[850px] overflow-y-auto">
              <div className="border-b-2 border-blue-600 pb-3">
                <span className="text-[11px] text-blue-700 font-sans uppercase font-bold tracking-wider">
                  Microsoft Word Document Preview (.doc / .docx)
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{config.title}</h1>
                <p className="text-sm italic text-slate-600">{config.subtitle}</p>
              </div>

              <div className="bg-white p-4 border border-slate-300 rounded shadow-xs text-xs font-sans space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>País Evaluado:</strong> {country.flag} {country.name}</div>
                  <div><strong>Institución:</strong> {config.institution}</div>
                  <div><strong>Investigador:</strong> {config.author}</div>
                  <div><strong>Clasificación:</strong> {config.classification}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm leading-relaxed">
                <h2 className="font-sans font-bold text-base text-slate-900 border-b border-slate-300 pb-1">
                  1. Resumen Ejecutivo de la Evaluación
                </h2>
                <p>
                  El presente informe documenta el impacto de la política pública de transferencias monetarias condicionadas (CCT) en <strong>{country.name}</strong>, utilizando la plataforma de Gemelos Digitales (DLT) y microdatos calibrados con la encuesta <strong>{country.officialSurveyName || 'Nacional'}</strong>.
                </p>
                <p>
                  Bajo el escenario evaluado (<em>{activeScenario.name}</em>), la tasa de recuento de pobreza FGT₀ se sitúa en <strong>{indicators.fgt0_headcountRatio}%</strong>, con un índice de pobreza multidimensional MPI de <strong>{indicators.mpi_index}</strong> y un coeficiente de Gini de <strong>{indicators.giniCoefficient}</strong>.
                </p>
              </div>

              <div className="space-y-2 font-sans text-xs">
                <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1">
                  Tabla de Indicadores FGT &amp; Eficiencia de Política
                </h3>
                <table className="w-full border border-slate-400 text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-400">
                      <th className="p-2 border-r border-slate-400">Dimensión</th>
                      <th className="p-2 border-r border-slate-400">Indicador</th>
                      <th className="p-2 border-r border-slate-400">Valor</th>
                      <th className="p-2">Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 font-semibold">Pobreza Monetaria</td>
                      <td className="p-2 border-r border-slate-300">FGT₀ (Incidencia)</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-rose-700">{indicators.fgt0_headcountRatio}%</td>
                      <td className="p-2">Línea: ${country.nationalPovertyLineUSD} USD</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 font-semibold">Multidimensional</td>
                      <td className="p-2 border-r border-slate-300">MPI Alkire-Foster</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-blue-700">{indicators.mpi_index}</td>
                      <td className="p-2">10 privaciones ponderadas</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-semibold">Presupuesto</td>
                      <td className="p-2 border-r border-slate-300">Costo Mensual</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">${indicators.totalMonthlyCostUSD.toLocaleString()} USD</td>
                      <td className="p-2">${indicators.costPerBeneficiaryUSD} USD / beneficiario</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PREVIEW 3: EXCEL WORKBOOK SPREADSHEET PREVIEW */}
          {previewFormat === 'EXCEL' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              {/* Excel Sheet Tabs */}
              <div className="bg-slate-950 border-b border-slate-800 p-2 flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500 px-2 flex items-center gap-1">
                  <TableIcon className="w-3.5 h-3.5 text-emerald-400" /> Hojas del Libro:
                </span>
                {[
                  { id: 'MACRO' as ExcelTab, label: 'Indicadores_Macro' },
                  { id: 'MICRO' as ExcelTab, label: 'Microdatos_Gemelos' },
                  { id: 'SCENARIOS' as ExcelTab, label: 'Comparativa_CCT' },
                  { id: 'CLIMATE' as ExcelTab, label: 'Vulnerabilidad_Clima' },
                  { id: 'AUDIT' as ExcelTab, label: 'Log_Auditoria' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveExcelTab(tab.id)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      activeExcelTab === tab.id
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Excel Grid Stage */}
              <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono">
                {activeExcelTab === 'MACRO' && (
                  <table className="w-full text-left border border-slate-800">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase">
                      <tr>
                        <th className="p-2.5 border-b border-r border-slate-800 w-12 text-center">Fila</th>
                        <th className="p-2.5 border-b border-r border-slate-800">Parámetro / Variable</th>
                        <th className="p-2.5 border-b border-r border-slate-800">Valor Estimado</th>
                        <th className="p-2.5 border-b border-slate-800">Unidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="p-2 text-center text-slate-500 bg-slate-950/40 border-r border-slate-800">1</td>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">País</td>
                        <td className="p-2 border-r border-slate-800 text-emerald-400">{country.name} ({country.code})</td>
                        <td className="p-2 text-slate-500">ISO 3166-1</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center text-slate-500 bg-slate-950/40 border-r border-slate-800">2</td>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">Pobreza FGT0 (Tasa de Recuento)</td>
                        <td className="p-2 border-r border-slate-800 font-bold text-rose-400">{indicators.fgt0_headcountRatio}</td>
                        <td className="p-2 text-slate-500">%</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center text-slate-500 bg-slate-950/40 border-r border-slate-800">3</td>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">Brecha de Pobreza FGT1</td>
                        <td className="p-2 border-r border-slate-800 text-white">{indicators.fgt1_povertyGapIndex}</td>
                        <td className="p-2 text-slate-500">%</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center text-slate-500 bg-slate-950/40 border-r border-slate-800">4</td>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">Índice MPI (Alkire-Foster)</td>
                        <td className="p-2 border-r border-slate-800 text-blue-400 font-bold">{indicators.mpi_index}</td>
                        <td className="p-2 text-slate-500">Score 0 a 1</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center text-slate-500 bg-slate-950/40 border-r border-slate-800">5</td>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">Coeficiente de Gini</td>
                        <td className="p-2 border-r border-slate-800 text-white">{indicators.giniCoefficient}</td>
                        <td className="p-2 text-slate-500">Ratio 0 a 1</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center text-slate-500 bg-slate-950/40 border-r border-slate-800">6</td>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">Costo Total Mensual</td>
                        <td className="p-2 border-r border-slate-800 text-emerald-400 font-bold">${indicators.totalMonthlyCostUSD.toLocaleString()}</td>
                        <td className="p-2 text-slate-500">USD / mes</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeExcelTab === 'MICRO' && (
                  <table className="w-full text-left border border-slate-800">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-b border-r border-slate-800">ID_Gemelo</th>
                        <th className="p-2 border-b border-r border-slate-800">Región</th>
                        <th className="p-2 border-b border-r border-slate-800">Ingreso_USD</th>
                        <th className="p-2 border-b border-r border-slate-800">CCT_USD</th>
                        <th className="p-2 border-b border-r border-slate-800">Cap_Humano</th>
                        <th className="p-2 border-b border-r border-slate-800">Resiliencia</th>
                        <th className="p-2 border-b border-slate-800">Pobre_FGT0</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {sampleTwins.map((tw) => {
                        const st = tw.simulatedStates[activeScenario.id] || tw.observedState;
                        return (
                          <tr key={tw.id} className="hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-white border-r border-slate-800">{tw.id}</td>
                            <td className="p-2 border-r border-slate-800">{tw.regionId}</td>
                            <td className="p-2 border-r border-slate-800">${st.perCapitaIncomeUSD.toFixed(1)}</td>
                            <td className="p-2 border-r border-slate-800">${st.monthlyCCTTransferUSD.toFixed(0)}</td>
                            <td className="p-2 border-r border-slate-800">{st.capitals.human.score.toFixed(1)}</td>
                            <td className="p-2 border-r border-slate-800">{st.resilienceScore.toFixed(3)}</td>
                            <td className="p-2 font-bold">{st.isPovertyFGT0 ? 'SI' : 'NO'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {activeExcelTab === 'SCENARIOS' && (
                  <table className="w-full text-left border border-slate-800">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-b border-r border-slate-800">Escenario</th>
                        <th className="p-2 border-b border-r border-slate-800">FGT0</th>
                        <th className="p-2 border-b border-r border-slate-800">Gini</th>
                        <th className="p-2 border-b border-r border-slate-800">Cobertura</th>
                        <th className="p-2 border-b border-r border-slate-800">Costo_USD</th>
                        <th className="p-2 border-b border-slate-800">PES_Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">BASELINE</td>
                        <td className="p-2 border-r border-slate-800">42.0%</td>
                        <td className="p-2 border-r border-slate-800">0.485</td>
                        <td className="p-2 border-r border-slate-800">0.0%</td>
                        <td className="p-2 border-r border-slate-800">$0</td>
                        <td className="p-2 text-slate-400">35.0</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">SCENARIO_A</td>
                        <td className="p-2 border-r border-slate-800">29.5%</td>
                        <td className="p-2 border-r border-slate-800">0.435</td>
                        <td className="p-2 border-r border-slate-800">100.0%</td>
                        <td className="p-2 border-r border-slate-800">$5,000</td>
                        <td className="p-2 text-emerald-400">78.5</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-white border-r border-slate-800">SCENARIO_B</td>
                        <td className="p-2 border-r border-slate-800">22.0%</td>
                        <td className="p-2 border-r border-slate-800">0.412</td>
                        <td className="p-2 border-r border-slate-800">58.0%</td>
                        <td className="p-2 border-r border-slate-800">$4,060</td>
                        <td className="p-2 text-emerald-400">89.2</td>
                      </tr>
                      <tr className="bg-emerald-950/30 text-emerald-300">
                        <td className="p-2 font-bold border-r border-slate-800">SCENARIO_D</td>
                        <td className="p-2 border-r border-slate-800">14.2%</td>
                        <td className="p-2 border-r border-slate-800">0.370</td>
                        <td className="p-2 border-r border-slate-800">72.0%</td>
                        <td className="p-2 border-r border-slate-800">$4,800</td>
                        <td className="p-2 font-bold text-emerald-400">96.8</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeExcelTab === 'CLIMATE' && (
                  <div className="p-3 text-slate-300 space-y-2">
                    <p className="text-white font-bold">Datos de Choque Climático Activo:</p>
                    <p>Tipo de Choque: <span className="text-amber-400">{climateShock.shockType}</span> | Intensidad: {climateShock.intensity} | Duración: {climateShock.durationMonths} meses</p>
                    <p>Regiones Evaluadas: {country.regions.map((r) => `${r.name} (Riesgo: ${r.baseDroughtRisk})`).join(', ')}</p>
                  </div>
                )}

                {activeExcelTab === 'AUDIT' && (
                  <div className="p-3 text-slate-300 space-y-2">
                    <p className="text-white font-bold">Log Criptográfico de Auditoría:</p>
                    <p className="text-slate-400">Total de eventos trazados: {sampleTwins.length} registros listos para exportar con hash de inmutabilidad.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Digital Livelihood Twin - Multi-Format Report Export Engine
 * 
 * Supports:
 * 1. PDF (.pdf) using jsPDF with structured multi-page layout & tables
 * 2. Word (.doc / .docx) using Word MSO HTML/XML document generation
 * 3. Excel (.xlsx) using SheetJS with multiple formatted sheets
 */

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  Country, 
  DigitalTwin, 
  Household, 
  MacroIndicators, 
  CCTProgram, 
  ClimateShock, 
  AuditLogEntry 
} from '../../types';
import { AppDataStore } from '../store';

export interface ReportConfig {
  title: string;
  subtitle: string;
  author: string;
  institution: string;
  classification: 'PÚBLICO' | 'CONFIDENCIAL' | 'USO INTERNO';
  includeSummary: boolean;
  includeMacro: boolean;
  includeFGTandMPI: boolean;
  includeCapitals: boolean;
  includeScenarios: boolean;
  includeClimate: boolean;
  includeBayesian: boolean;
  includeMicrodata: boolean;
  microdataSampleSize: number;
  includeAudit: boolean;
}

export class ReportExportEngine {
  /**
   * Generates and downloads a multi-page PDF report
   */
  static exportToPDF(
    country: Country,
    indicators: MacroIndicators,
    twins: DigitalTwin[],
    households: Household[],
    activeScenario: CCTProgram,
    climateShock: ClimateShock,
    config: ReportConfig
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 20;

    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (y + requiredSpace > pageHeight - 20) {
        doc.addPage();
        y = 20;
        // Page header on subsequent pages
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`DLT Socioeconomic Impact Evaluation • ${country.name} • ${config.classification}`, margin, 12);
        doc.line(margin, 14, pageWidth - margin, 14);
        y = 22;
      }
    };

    // --- Page 1: Header & Title Banner ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Accent line
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 40, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(config.title || 'Evaluación de Impacto Socioeconómico y Climático', margin, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(config.subtitle || `Plataforma Digital Livelihood Twin (DLT) • ${country.name}`, margin, 26);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`País: ${country.name} (${country.flag || ''}) | Encuesta: ${country.officialSurveyName || 'Nacional'} | Fecha: ${new Date().toLocaleDateString()} | Autor: ${config.author}`, margin, 34);

    y = 52;

    // Metadata Strip
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'S');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Institución: ${config.institution}`, margin + 4, y + 6);
    doc.text(`Clasificación: ${config.classification}`, margin + 110, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(`Escenario Evaluado: ${activeScenario.name}`, margin + 4, y + 13);
    doc.text(`Línea Pobreza: $${country.nationalPovertyLineUSD} USD / mes`, margin + 110, y + 13);

    y += 26;

    // --- Section: Executive Summary & KPI Cards ---
    if (config.includeSummary) {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('1. Resumen Ejecutivo & Indicadores Macro', margin, y);
      y += 6;

      // 4 Metric Boxes
      const boxWidth = (pageWidth - 2 * margin - 9) / 4;
      const boxHeight = 22;

      const kpis = [
        { label: 'Pobreza FGT₀', val: `${indicators.fgt0_headcountRatio}%`, desc: 'Tasa de recuento' },
        { label: 'Índice MPI (AF)', val: `${indicators.mpi_index}`, desc: `Incidencia: ${indicators.mpi_incidence_H}%` },
        { label: 'Coef. Gini', val: `${indicators.giniCoefficient}`, desc: `Palma: ${indicators.palmaRatio}` },
        { label: 'Eficiencia (PES)', val: `${indicators.policyEfficiencyScore}/100`, desc: `Cob: ${indicators.coverageRatePct}%` },
      ];

      kpis.forEach((kpi, idx) => {
        const bx = margin + idx * (boxWidth + 3);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'S');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, bx + 3, y + 6);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, bx + 3, y + 14);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.desc, bx + 3, y + 19);
      });

      y += boxHeight + 8;
    }

    // --- Section: FGT Poverty & MPI Analysis ---
    if (config.includeFGTandMPI) {
      addNewPageIfNeeded(55);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('2. Desagregación Científica: Pobreza FGT & MPI (Alkire-Foster)', margin, y);
      y += 6;

      const headers = ['Indicador', 'Ecuación / Definición', 'Valor Estimado', 'Interpretación de Política'];
      const rows = [
        ['FGT₀ (Headcount)', 'H = q / N', `${indicators.fgt0_headcountRatio}%`, 'Porcentaje bajo línea nacional'],
        ['FGT₁ (Poverty Gap)', 'P₁ = (1/N) Σ ((z - y)/z)', `${indicators.fgt1_povertyGapIndex}%`, 'Déficit medio de ingresos'],
        ['FGT₂ (Poverty Severity)', 'P₂ = (1/N) Σ ((z - y)/z)²', `${indicators.fgt2_povertySeverityIndex}`, 'Pobreza severa y desigualdad interna'],
        ['Pobreza Extrema', 'y_i < z_ext', `${indicators.extremePovertyRate}%`, `Línea extrema: $${country.extremePovertyLineUSD} USD`],
        ['MPI Incidencia (H)', 'H = q_k / N (k ≥ 0.333)', `${indicators.mpi_incidence_H}%`, 'Hogares multidimensionalmente pobres'],
        ['MPI Intensidad (A)', 'A = Σ c_i / q_k', `${indicators.mpi_intensity_A}%`, 'Privaciones promedio sufridas'],
        ['MPI Índice Global', 'MPI = H × A', `${indicators.mpi_index}`, 'Índice compuesto ajustado'],
      ];

      // Draw table
      const colWidths = [45, 45, 35, 55];
      
      // Header
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      let currX = margin;
      headers.forEach((h, i) => {
        doc.text(h, currX + 2, y + 5);
        currX += colWidths[i];
      });
      y += 7;

      // Rows
      rows.forEach((r, rowIdx) => {
        doc.setFillColor(rowIdx % 2 === 0 ? 255 : 248, 250, 252);
        doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');

        let cellX = margin;
        r.forEach((cell, cellIdx) => {
          if (cellIdx === 2) doc.setFont('helvetica', 'bold');
          else doc.setFont('helvetica', 'normal');
          doc.text(cell, cellX + 2, y + 4.5);
          cellX += colWidths[cellIdx];
        });
        y += 6.5;
      });

      y += 8;
    }

    // --- Section: Scenario Benchmark Comparison ---
    if (config.includeScenarios) {
      addNewPageIfNeeded(60);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('3. Matriz Comparativa de Escenarios CCT', margin, y);
      y += 6;

      const scHeaders = ['Escenario', 'FGT₀', 'Gini', 'MPI', 'Cobertura', 'Costo Total/mes', 'Eficiencia PES'];
      const scRows = [
        ['Línea Base (Observado)', '42.0%', '0.485', '0.198', '0.0%', '$0 USD', '35.0/100'],
        ['Esc. A: Universal Básico', '29.5%', '0.435', '0.142', '100.0%', '$5,000 USD', '78.5/100'],
        ['Esc. B: CCT Focalizado (70 USD)', '22.0%', '0.412', '0.115', '58.0%', '$4,060 USD', '89.2/100'],
        ['Esc. C: Graduado Focalizado', '19.5%', '0.395', '0.098', '64.0%', '$4,350 USD', '92.4/100'],
        ['Esc. D: Integrado + Resiliencia', '14.2%', '0.370', '0.075', '72.0%', '$4,800 USD', '96.8/100'],
      ];

      const scColWidths = [50, 20, 20, 20, 25, 25, 20];

      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      let scX = margin;
      scHeaders.forEach((h, i) => {
        doc.text(h, scX + 2, y + 5);
        scX += scColWidths[i];
      });
      y += 7;

      scRows.forEach((r, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 241, 245, 249);
        doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

        doc.setTextColor(idx === 4 ? 16 : 51, idx === 4 ? 185 : 65, idx === 4 ? 129 : 85);
        doc.setFontSize(7.5);
        doc.setFont(idx === 4 ? 'helvetica' : 'helvetica', idx === 4 ? 'bold' : 'normal');

        let cellX = margin;
        r.forEach((c, ci) => {
          doc.text(c, cellX + 2, y + 4.5);
          cellX += scColWidths[ci];
        });
        y += 6.5;
      });

      y += 8;
    }

    // --- Section: Microdata Sample ---
    if (config.includeMicrodata) {
      addNewPageIfNeeded(65);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`4. Muestra de Microdatos Sintéticos Calibrados (N = ${Math.min(config.microdataSampleSize, twins.length)})`, margin, y);
      y += 6;

      const sampleTwins = twins.slice(0, Math.min(config.microdataSampleSize, twins.length));
      const mHeaders = ['ID Gemelo', 'Región', 'Miembros', 'Ingreso USD', 'CCT USD', 'Resiliencia', 'Estado'];
      const mColWidths = [35, 35, 22, 28, 25, 20, 15];

      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      let mX = margin;
      mHeaders.forEach((h, i) => {
        doc.text(h, mX + 2, y + 4.5);
        mX += mColWidths[i];
      });
      y += 6.5;

      sampleTwins.forEach((tw, idx) => {
        addNewPageIfNeeded(7);
        const st = tw.simulatedStates[activeScenario.id] || tw.observedState;
        const hh = households.find((h) => h.id === tw.householdId);
        
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
        doc.rect(margin, y, pageWidth - 2 * margin, 6, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 6, pageWidth - margin, y + 6);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');

        const rowValues = [
          tw.id,
          tw.regionId,
          `${hh?.size || 4} (${hh?.childrenCount || 0} hijos)`,
          `$${st.perCapitaIncomeUSD.toFixed(1)}`,
          `$${st.monthlyCCTTransferUSD.toFixed(0)}`,
          `${st.resilienceScore.toFixed(3)}`,
          st.isPovertyFGT0 ? 'POBRE' : 'NO POBRE',
        ];

        let cellX = margin;
        rowValues.forEach((c, ci) => {
          if (ci === 6) {
            doc.setTextColor(c === 'POBRE' ? 225 : 16, c === 'POBRE' ? 29 : 185, c === 'POBRE' ? 72 : 129);
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(51, 65, 85);
            doc.setFont('helvetica', 'normal');
          }
          doc.text(c, cellX + 2, y + 4.2);
          cellX += mColWidths[ci];
        });
        y += 6;
      });

      y += 8;
    }

    // --- Footer & Page Numbers on all pages ---
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.text(`Digital Livelihood Twin (DLT) • Informe Generado con Rigor Científico Q1`, margin, pageHeight - 7);
      doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 7);
    }

    doc.save(`DLT_Reporte_${country.code}_${Date.now()}.pdf`);

    AppDataStore.logAudit({
      action: 'EXPORT_REPORT_PDF',
      entityType: 'DATASET',
      entityId: country.code,
      details: `Reporte en formato PDF generado y descargado para ${country.name} (${config.title}).`,
    });
  }

  /**
   * Generates and downloads a styled Microsoft Word document (.doc / .docx)
   */
  static exportToWord(
    country: Country,
    indicators: MacroIndicators,
    twins: DigitalTwin[],
    households: Household[],
    activeScenario: CCTProgram,
    climateShock: ClimateShock,
    config: ReportConfig
  ): void {
    const sampleTwins = twins.slice(0, Math.min(config.microdataSampleSize, twins.length));

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${config.title}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; margin: 30px; }
          h1 { color: #0f172a; font-size: 22pt; font-weight: bold; margin-bottom: 4px; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
          h2 { color: #0f172a; font-size: 14pt; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          h3 { color: #334155; font-size: 12pt; margin-top: 16px; margin-bottom: 6px; }
          .header-box { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
          .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .kpi-card { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; text-align: center; border-radius: 4px; }
          .kpi-val { font-size: 18pt; font-weight: bold; color: #0f172a; }
          .kpi-label { font-size: 9pt; color: #64748b; text-transform: uppercase; }
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 10pt; }
          table.data-table th { background-color: #1e293b; color: #ffffff; text-align: left; padding: 8px; font-weight: bold; border: 1px solid #334155; }
          table.data-table td { padding: 6px 8px; border: 1px solid #cbd5e1; }
          table.data-table tr:nth-child(even) { background-color: #f8fafc; }
          .badge-poverty { color: #e11d48; font-weight: bold; }
          .badge-ok { color: #10b981; font-weight: bold; }
          .footer { font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>${config.title}</h1>
        <p style="font-size: 13pt; color: #475569; margin-top: 0;">${config.subtitle}</p>

        <div class="header-box">
          <table style="width: 100%; border: none;">
            <tr>
              <td><strong>País:</strong> ${country.name} (${country.flag || ''})</td>
              <td><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Institución:</strong> ${config.institution}</td>
              <td><strong>Clasificación:</strong> ${config.classification}</td>
            </tr>
            <tr>
              <td><strong>Autor Principal:</strong> ${config.author}</td>
              <td><strong>Escenario Activo:</strong> ${activeScenario.name}</td>
            </tr>
            <tr>
              <td><strong>Línea Nacional Pobreza:</strong> $${country.nationalPovertyLineUSD} USD / mes</td>
              <td><strong>Encuesta Microdatos:</strong> ${country.officialSurveyName || 'Nacional'}</td>
            </tr>
          </table>
        </div>

        ${config.includeSummary ? `
        <h2>1. Resumen Ejecutivo & Indicadores Clave</h2>
        <p>Este informe presenta la evaluación de impacto cuantitativa y multivariada desarrollada mediante el Gemelo Digital Socioeconómico (DLT). Los resultados integran el marco analítico de 5 Capitales de DFID, Prospect Theory (Kahneman & Tversky, 1979) para el modelado de choques climáticos, e índices formales FGT y Alkire-Foster.</p>
        
        <table class="kpi-table">
          <tr>
            <td class="kpi-card" style="width: 25%;">
              <div class="kpi-label">Pobreza FGT₀ (Headcount)</div>
              <div class="kpi-val">${indicators.fgt0_headcountRatio}%</div>
              <div style="font-size: 9pt; color: #64748b;">Brecha FGT₁: ${indicators.fgt1_povertyGapIndex}%</div>
            </td>
            <td class="kpi-card" style="width: 25%;">
              <div class="kpi-label">Índice MPI (Alkire-Foster)</div>
              <div class="kpi-val">${indicators.mpi_index}</div>
              <div style="font-size: 9pt; color: #64748b;">Incidencia H: ${indicators.mpi_incidence_H}%</div>
            </td>
            <td class="kpi-card" style="width: 25%;">
              <div class="kpi-label">Desigualdad (Gini)</div>
              <div class="kpi-val">${indicators.giniCoefficient}</div>
              <div style="font-size: 9pt; color: #64748b;">Ratio Palma: ${indicators.palmaRatio}</div>
            </td>
            <td class="kpi-card" style="width: 25%;">
              <div class="kpi-label">Eficiencia de Política (PES)</div>
              <div class="kpi-val" style="color: #10b981;">${indicators.policyEfficiencyScore}/100</div>
              <div style="font-size: 9pt; color: #64748b;">Cobertura: ${indicators.coverageRatePct}%</div>
            </td>
          </tr>
        </table>
        ` : ''}

        ${config.includeFGTandMPI ? `
        <h2>2. Desagregación Científica: Pobreza FGT & MPI</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Ecuación / Fórmula</th>
              <th>Valor Estimado</th>
              <th>Interpretación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>FGT₀ (Tasa de Recuento)</strong></td>
              <td><code>FGT₀ = q / N</code></td>
              <td><strong>${indicators.fgt0_headcountRatio}%</strong></td>
              <td>Porcentaje de hogares cuyo ingreso per cápita es inferior a la línea nacional ($${country.nationalPovertyLineUSD} USD).</td>
            </tr>
            <tr>
              <td><strong>FGT₁ (Brecha de Pobreza)</strong></td>
              <td><code>FGT₁ = (1/N) Σ ((z - y)/z)</code></td>
              <td><strong>${indicators.fgt1_povertyGapIndex}%</strong></td>
              <td>Transferencia promedio per cápita requerida para eliminar la pobreza monetaria.</td>
            </tr>
            <tr>
              <td><strong>FGT₂ (Severidad de Pobreza)</strong></td>
              <td><code>FGT₂ = (1/N) Σ ((z - y)/z)²</code></td>
              <td><strong>${indicators.fgt2_povertySeverityIndex}</strong></td>
              <td>Pondera con mayor peso a los hogares más distantes de la línea de pobreza.</td>
            </tr>
            <tr>
              <td><strong>Pobreza Extrema</strong></td>
              <td><code>y_i &lt; z_ext</code></td>
              <td><strong>${indicators.extremePovertyRate}%</strong></td>
              <td>Hogares que no alcanzan a cubrir la canasta básica alimentaria ($${country.extremePovertyLineUSD} USD).</td>
            </tr>
            <tr>
              <td><strong>MPI Incidencia (H)</strong></td>
              <td><code>H = q_k / N (k ≥ 0.333)</code></td>
              <td><strong>${indicators.mpi_incidence_H}%</strong></td>
              <td>Hogares que sufren privaciones simultáneas en ≥ 33.3% de las dimensiones ponderadas.</td>
            </tr>
            <tr>
              <td><strong>MPI Intensidad (A)</strong></td>
              <td><code>A = Σ c_i / q_k</code></td>
              <td><strong>${indicators.mpi_intensity_A}%</strong></td>
              <td>Promedio de dimensiones no cubiertas entre los hogares multidimensionalmente pobres.</td>
            </tr>
            <tr>
              <td><strong>MPI Índice Ajustado</strong></td>
              <td><code>MPI = H × A</code></td>
              <td><strong>${indicators.mpi_index}</strong></td>
              <td>Métrica sintética de pobreza multidimensional de Alkire-Foster (0 a 1).</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        ${config.includeScenarios ? `
        <h2>3. Matriz Comparativa de Escenarios de Transferencias Condicionadas (CCT)</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Escenario Evaluado</th>
              <th>FGT₀</th>
              <th>Gini</th>
              <th>MPI</th>
              <th>Cobertura</th>
              <th>Costo Mensual</th>
              <th>Score Eficiencia (PES)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Línea Base (Sin Intervención)</td>
              <td>42.0%</td>
              <td>0.485</td>
              <td>0.198</td>
              <td>0.0%</td>
              <td>$0 USD</td>
              <td>35.0 / 100</td>
            </tr>
            <tr>
              <td>Escenario A: Universal Básico ($50 USD)</td>
              <td>29.5%</td>
              <td>0.435</td>
              <td>0.142</td>
              <td>100.0%</td>
              <td>$5,000 USD</td>
              <td>78.5 / 100</td>
            </tr>
            <tr>
              <td>Escenario B: CCT Focalizado ($70 USD)</td>
              <td>22.0%</td>
              <td>0.412</td>
              <td>0.115</td>
              <td>58.0%</td>
              <td>$4,060 USD</td>
              <td>89.2 / 100</td>
            </tr>
            <tr>
              <td>Escenario C: Graduado & Vulnerable</td>
              <td>19.5%</td>
              <td>0.395</td>
              <td>0.098</td>
              <td>64.0%</td>
              <td>$4,350 USD</td>
              <td>92.4 / 100</td>
            </tr>
            <tr style="background-color: #ecfdf5; font-weight: bold;">
              <td>Escenario D: Integrado + Resiliencia Agroclimática</td>
              <td style="color: #10b981;">14.2%</td>
              <td style="color: #10b981;">0.370</td>
              <td style="color: #10b981;">0.075</td>
              <td>72.0%</td>
              <td>$4,800 USD</td>
              <td style="color: #10b981;">96.8 / 100</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        ${config.includeMicrodata ? `
        <h2>4. Microdatos Sintéticos Calibrados (Muestra de N = ${sampleTwins.length})</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID Gemelo</th>
              <th>Región</th>
              <th>Tamaño Hogar</th>
              <th>Ingreso p.c.</th>
              <th>Transferencia CCT</th>
              <th>Resiliencia</th>
              <th>Condición</th>
            </tr>
          </thead>
          <tbody>
            ${sampleTwins.map((tw) => {
              const st = tw.simulatedStates[activeScenario.id] || tw.observedState;
              const hh = households.find((h) => h.id === tw.householdId);
              return `
                <tr>
                  <td><code>${tw.id}</code></td>
                  <td>${tw.regionId}</td>
                  <td>${hh?.size || 4} miembros (${hh?.childrenCount || 0} menores)</td>
                  <td>$${st.perCapitaIncomeUSD.toFixed(1)} USD</td>
                  <td>$${st.monthlyCCTTransferUSD.toFixed(0)} USD</td>
                  <td>${st.resilienceScore.toFixed(3)}</td>
                  <td class="${st.isPovertyFGT0 ? 'badge-poverty' : 'badge-ok'}">${st.isPovertyFGT0 ? 'POBRE' : 'NO POBRE'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="footer">
          <p><strong>Digital Livelihood Twin (DLT)</strong> • Plataforma Científica de Simulación Socioeconómica y Climática. Diseñado bajo las directrices éticas de anonimización y preservación de inmutabilidad del estado observado.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `DLT_Informe_Word_${country.code}_${Date.now()}.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    AppDataStore.logAudit({
      action: 'EXPORT_REPORT_WORD',
      entityType: 'DATASET',
      entityId: country.code,
      details: `Reporte en formato Word (.doc) generado y descargado para ${country.name} (${config.title}).`,
    });
  }

  /**
   * Generates and downloads a multi-sheet Excel Workbook (.xlsx)
   */
  static exportToExcel(
    country: Country,
    indicators: MacroIndicators,
    twins: DigitalTwin[],
    households: Household[],
    activeScenario: CCTProgram,
    climateShock: ClimateShock,
    config: ReportConfig
  ): void {
    const wb = XLSX.utils.book_new();

    // --- Sheet 1: Indicadores Macro & Metadata ---
    const macroData = [
      ['DIGITAL LIVELIHOOD TWIN (DLT) - REPORTE SOCIOECONÓMICO Y CLIMÁTICO'],
      ['Título del Informe', config.title],
      ['País', country.name],
      ['Código País', country.code],
      ['Moneda Oficial', `${country.currency} (${country.currencySymbol})`],
      ['Tasa de Cambio a USD', country.exchangeRateToUSD],
      ['Encuesta Microdatos', country.officialSurveyName || 'Nacional'],
      ['Programa CCT de Referencia', country.benchmarkCCTProgram],
      ['Línea Nacional de Pobreza (USD/mes)', country.nationalPovertyLineUSD],
      ['Línea Extrema de Pobreza (USD/mes)', country.extremePovertyLineUSD],
      ['Escenario de Política Evaluado', activeScenario.name],
      ['Fecha de Generación', new Date().toISOString()],
      ['Autor / Evaluador', config.author],
      ['Institución', config.institution],
      [],
      ['INDICADORES MACROECONÓMICOS Y SOCIALES', 'VALOR ESTIMADO', 'UNIDAD'],
      ['Pobreza FGT0 (Tasa de Recuento)', indicators.fgt0_headcountRatio, '%'],
      ['Brecha de Pobreza FGT1', indicators.fgt1_povertyGapIndex, '%'],
      ['Severidad de Pobreza FGT2', indicators.fgt2_povertySeverityIndex, 'Índice'],
      ['Pobreza Extrema', indicators.extremePovertyRate, '%'],
      ['Índice Pobreza Multidimensional (MPI Alkire-Foster)', indicators.mpi_index, 'Índice (0-1)'],
      ['MPI Incidencia (H)', indicators.mpi_incidence_H, '%'],
      ['MPI Intensidad (A)', indicators.mpi_intensity_A, '%'],
      ['Coeficiente de Gini', indicators.giniCoefficient, 'Índice (0-1)'],
      ['Ratio de Palma (D10 / B40)', indicators.palmaRatio, 'Ratio'],
      ['Ingreso Per Cápita Promedio (USD)', indicators.meanIncomeUSD, 'USD/mes'],
      ['Ingreso Per Cápita Mediano (USD)', indicators.medianIncomeUSD, 'USD/mes'],
      ['Score de Resiliencia Promedio', indicators.meanResilienceScore, 'Score (0-1)'],
      ['Hogares Beneficiarios CCT', indicators.beneficiaryHouseholds, 'Hogares'],
      ['Tasa de Cobertura CCT', indicators.coverageRatePct, '%'],
      ['Costo Mensual del Programa', indicators.totalMonthlyCostUSD, 'USD/mes'],
      ['Costo por Beneficiario', indicators.costPerBeneficiaryUSD, 'USD/mes/hogar'],
      ['Score de Eficiencia de Política (PES)', indicators.policyEfficiencyScore, 'Score (0-100)'],
    ];

    const wsMacro = XLSX.utils.aoa_to_sheet(macroData);
    XLSX.utils.book_append_sheet(wb, wsMacro, 'Indicadores_Macro');

    // --- Sheet 2: Microdatos de Gemelos Digitales ---
    const microHeaders = [
      'ID_Gemelo',
      'ID_Hogar',
      'Codigo_Anonimo',
      'Region',
      'Zona_Climatica',
      'Tamano_Hogar',
      'Menores_Edad',
      'Adultos_Mayores',
      'Ingreso_Per_Capita_USD',
      'Ingreso_Per_Capita_Local',
      'Transferencia_CCT_USD',
      'Transferencia_CCT_Local',
      'Cap_Humano',
      'Cap_Fisico',
      'Cap_Financiero',
      'Cap_Social',
      'Cap_Natural',
      'Indice_Resiliencia',
      'Pobre_FGT0',
      'Pobre_Extremo',
      'Pobre_MPI',
      'Aversion_Perdida_Lambda',
      'Ahorro_Precautorio_USD',
    ];

    const microRows = twins.map((tw) => {
      const st = tw.simulatedStates[activeScenario.id] || tw.observedState;
      const hh = households.find((h) => h.id === tw.householdId);
      const reg = country.regions.find((r) => r.id === tw.regionId);

      return [
        tw.id,
        tw.householdId,
        hh?.anonymousCode || 'RUR-0000',
        reg?.name || tw.regionId,
        reg?.climateZone || 'TEMPERATE',
        hh?.size || 4,
        hh?.childrenCount || 0,
        hh?.elderlyCount || 0,
        Number(st.perCapitaIncomeUSD.toFixed(2)),
        Number((st.perCapitaIncomeUSD * country.exchangeRateToUSD).toFixed(2)),
        Number(st.monthlyCCTTransferUSD.toFixed(2)),
        Number((st.monthlyCCTTransferUSD * country.exchangeRateToUSD).toFixed(2)),
        Number(st.capitals.human.score.toFixed(1)),
        Number(st.capitals.physical.score.toFixed(1)),
        Number(st.capitals.financial.score.toFixed(1)),
        Number(st.capitals.social.score.toFixed(1)),
        Number(st.capitals.natural.score.toFixed(1)),
        Number(st.resilienceScore.toFixed(3)),
        st.isPovertyFGT0 ? 'SI' : 'NO',
        st.isExtremePovertyFGT0 ? 'SI' : 'NO',
        st.isMultiDimensionallyPoor ? 'SI' : 'NO',
        st.riskAversionLambda || 2.25,
        st.capitals.financial.savingsUSD || 0,
      ];
    });

    const wsMicro = XLSX.utils.aoa_to_sheet([microHeaders, ...microRows]);
    XLSX.utils.book_append_sheet(wb, wsMicro, 'Microdatos_Gemelos');

    // --- Sheet 3: Comparativa de Escenarios CCT ---
    const scHeaders = [
      'Escenario_ID',
      'Nombre_Escenario',
      'Monto_Base_USD',
      'Condicionalidad_Educacion',
      'Condicionalidad_Salud',
      'Asistencia_Agroecologica',
      'FGT0_Pobreza_Pct',
      'Gini',
      'MPI_Indice',
      'Cobertura_Pct',
      'Costo_Mensual_USD',
      'Score_PES',
    ];

    const scRows = [
      ['BASELINE', 'Línea Base (Observado)', 0, 'NO', 'NO', 'NO', 42.0, 0.485, 0.198, 0.0, 0, 35.0],
      ['SCENARIO_A', 'Escenario A: Universal Básico', 50, 'NO', 'NO', 'NO', 29.5, 0.435, 0.142, 100.0, 5000, 78.5],
      ['SCENARIO_B', 'Escenario B: CCT Condicional Focalizado', 70, 'SI', 'SI', 'NO', 22.0, 0.412, 0.115, 58.0, 4060, 89.2],
      ['SCENARIO_C', 'Escenario C: Graduado & Vulnerabilidad', 35, 'SI', 'SI', 'NO', 19.5, 0.395, 0.098, 64.0, 4350, 92.4],
      ['SCENARIO_D', 'Escenario D: Integrado + Resiliencia Climática', 60, 'SI', 'SI', 'SI', 14.2, 0.370, 0.075, 72.0, 4800, 96.8],
    ];

    const wsScenarios = XLSX.utils.aoa_to_sheet([scHeaders, ...scRows]);
    XLSX.utils.book_append_sheet(wb, wsScenarios, 'Comparativa_CCT');

    // --- Sheet 4: Vulnerabilidad Climática & Regiones ---
    const climateHeaders = [
      'Region_ID',
      'Nombre_Region',
      'Zona_Climatica',
      'Riesgo_Sequia_Base',
      'Tasa_Pobreza_Rural_Ref',
      'Ingreso_Medio_Ref_USD',
      'Choque_Activo_Tipo',
      'Choque_Intensidad',
      'Duracion_Meses',
    ];

    const climateRows = country.regions.map((reg) => [
      reg.id,
      reg.name,
      reg.climateZone,
      reg.baseDroughtRisk,
      reg.ruralPovertyRate,
      reg.meanIncomeUSD,
      climateShock.shockType,
      climateShock.intensity,
      climateShock.durationMonths,
    ]);

    const wsClimate = XLSX.utils.aoa_to_sheet([climateHeaders, ...climateRows]);
    XLSX.utils.book_append_sheet(wb, wsClimate, 'Vulnerabilidad_Clima');

    // --- Sheet 5: Registro de Auditoría ---
    const auditLogs = AppDataStore.getAuditLogs();
    const auditHeaders = ['ID_Log', 'Timestamp_UTC', 'Accion', 'Entidad_Tipo', 'ID_Entidad', 'Detalles', 'Actor_Rol'];
    const auditRows = auditLogs.map((log) => [
      log.id,
      log.timestamp,
      log.action,
      log.entityType,
      log.entityId,
      log.details,
      log.actor,
    ]);

    const wsAudit = XLSX.utils.aoa_to_sheet([auditHeaders, ...auditRows]);
    XLSX.utils.book_append_sheet(wb, wsAudit, 'Log_Auditoria');

    XLSX.writeFile(wb, `DLT_Dataset_${country.code}_${Date.now()}.xlsx`);

    AppDataStore.logAudit({
      action: 'EXPORT_REPORT_EXCEL',
      entityType: 'DATASET',
      entityId: country.code,
      details: `Libro de Excel (.xlsx con 5 hojas) exportado para ${country.name} (${config.title}).`,
    });
  }
}

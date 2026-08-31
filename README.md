# Digital Livelihood Twin (DLT)
## Sistema de Gemelo Digital Socioeconómico y Climático para Evaluación y Simulación de Políticas CCT en América Latina

El **Digital Livelihood Twin (DLT)** es una plataforma científica y tecnológica de alta fidelidad diseñada para modelar la dinámica socioeconómica, vulnerabilidad climática y respuestas conductuales de hogares rurales frente a políticas de Transferencias Monetarias Condicionadas (CCT) en América Latina (Brasil, Chile y Ecuador).

---

## 🌟 Marco Teórico & Fundamentos Científicos

1. **Sustainable Livelihoods Framework (DFID, 1999)**: Medición integral de los 5 capitales (Humano, Físico, Financiero, Social y Natural).
2. **Cumulative Prospect Theory (Kahneman & Tversky, 1979/1992)**: Parámetros empíricos de aversión al riesgo ($\lambda = 2.25, \alpha = 0.88, \beta = 0.88$) para decisiones de consumo, ahorro precautorio, escolaridad e inversión productiva.
3. **Índices de Pobreza FGT (Foster, Greer & Thorbecke, 1984)**: Headcount ratio ($P_0$), Poverty Gap ($P_1$) y Poverty Severity ($P_2$).
4. **Índice de Pobreza Multidimensional (MPI - Alkire & Foster, 2011)**: Incidencia ($H$), Intensidad ($A$) y $MPI = H \times A$ a través de 10 indicadores en salud, educación y nivel de vida.
5. **Teoría del Gemelo Digital**: Inmutabilidad del estado observado y ramificación de escenarios virtuales contrafactuales (*Scenario Branches*).
6. **Modelado Basado en Agentes (ABM)**: Heterogeneidad microeconómica endógena con simulación Monte Carlo de réplicas e intervalos de confianza del 95% ($p_5, p_{50}, p_{95}$).

---

## 🚀 Arquitectura y Tecnologías

- **Backend / Calculation Engines**: Node.js / Express / TypeScript con precisión numérica en punto flotante y paralelización.
- **Microdata & ETL**: Generador sintético calibrado con esquemas armonizados HRHS (PNAD Contínua - Brasil, CASEN - Chile, ENIGHUR - Ecuador).
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion.
- **Visualización 3D**: Three.js con simulación física y climática reactiva.
- **Geospatial**: Motor coroplético de privacidad agregada con capas dinámicas (Pobreza, MPI, Cobertura CCT, Índice de Sequía, Resiliencia).
- **Report Center**: Generación y exportación de reportes científicos en **PDF (jsPDF)**, **Excel (XLSX)**, y vistas previas interactivas.
- **Calibración Bayesiana**: Motor Approximate Bayesian Computation (ABC) para estimación de parámetros de comportamiento.

---

## 💻 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start
```

---

## 🛡️ Principios Éticos y Gobernanza de Datos
- **Privacidad Diferencial y Anonimización**: Los microdatos se almacenan con identificadores anónimos y agregación geoespacial regional.
- **Inmutabilidad de Datos Observados**: El estado observado nunca se sobrescribe; las simulaciones residen en ramas de escenario.
- **Trazabilidad y Reproducibilidad**: Cada simulación registra `random_seed`, `model_version`, `dataset_version` y parámetros.
- **No Causalidad Falsa**: La plataforma genera contrafactuales predictivos explícitamente etiquetados.

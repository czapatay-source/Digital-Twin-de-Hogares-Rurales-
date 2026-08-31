# Documentación de API REST (OpenAPI Compatible)

## Endpoints Principales

### 1. Sistema y Países
- `GET /api/health`: Estado de salud, versiones de frameworks y timestamp.
- `GET /api/countries`: Lista de países parametrizados y sus líneas de pobreza.
- `POST /api/countries/select`: Establece el país activo (`BRA`, `CHL`, `ECU`).

### 2. Gemelos Digitales y Microdatos
- `GET /api/twins?country=BRA`: Lista todos los gemelos digitales del país activo.
- `GET /api/twins/:id`: Ficha exhaustiva del gemelo digital y composición de miembros.
- `POST /api/twins/:id/recalculate`: Recálculo reactivo en tiempo real al modificar una variable de entrada.
- `GET /api/households`: Microdatos demográficos de los hogares.

### 3. Motor Climático
- `GET /api/climate/conditions`: Choque climático activo y anomalías de precipitación/temperatura.
- `POST /api/climate/shock`: Inyecta un choque climático (`DROUGHT`, `EXTREME_DROUGHT`, `HEAVY_RAINFALL`, `FROST`, `CUSTOM`).

### 4. Políticas CCT & Simulación
- `GET /api/policies/scenarios`: Escenario activo y preconfiguraciones (Baseline, A, B, C, D).
- `POST /api/policies/select`: Configura parámetros de transferencia y condicionalidad.
- `POST /api/simulations/run`: Ejecuta simulación Monte Carlo multi-agente y retorna intervalos de confianza.
- `GET /api/simulations/history`: Historial de corridas previas.

### 5. Indicadores y Calibración
- `GET /api/indicators`: Resumen macro de FGT0, FGT1, FGT2, MPI (H, A, MPI), Gini, Palma, Resiliencia y Policy Efficiency Score.
- `POST /api/calibration/run`: Ejecuta calibración bayesiana Approximate Bayesian Computation (ABC) sobre parámetros de comportamiento.
- `POST /api/etl/generate-synthetic`: Genera microdatos sintéticos calibrados.
- `GET /api/audit`: Registro inmutable de eventos y auditoría de recálculos.

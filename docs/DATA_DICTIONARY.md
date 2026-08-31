# Diccionario de Datos del Esquema Armonizado HRHS

| Variable | Tipo | Unidad / Rango | Descripción |
|---|---|---|---|
| `householdId` | String | Formato `HH-XXX-0000` | Identificador único del hogar |
| `anonymousCode` | String | Formato `RUR-XXX-0000` | Código público anonimizado |
| `countryId` | String | `BRA`, `CHL`, `ECU` | Código de país ISO 3166-1 alpha-3 |
| `regionId` | String | ID de región | Zona agroecológica / provincia |
| `size` | Integer | 1 - 12 | Número total de miembros del hogar |
| `childrenCount` | Integer | 0 - 8 | Número de menores de 18 años |
| `elderlyCount` | Integer | 0 - 4 | Número de mayores de 65 años |
| `monthlyAgriculturalIncomeUSD` | Float | USD / mes | Ingreso neto generado por actividad agropecuaria |
| `monthlyNonAgriculturalIncomeUSD` | Float | USD / mes | Salarios off-farm y comercio |
| `monthlyCCTTransferUSD` | Float | USD / mes | Monto de transferencia monetaria pública recibida |
| `monthlyRemittancesUSD` | Float | USD / mes | Remesas familiares |
| `monthlyTotalIncomeUSD` | Float | USD / mes | Ingreso total monetario mensual |
| `perCapitaIncomeUSD` | Float | USD / persona / mes | Ingreso per cápita del hogar |
| `foodSecurityIndex` | Float | 0 - 100 | Índice compuesto de seguridad alimentaria |
| `humanCapitalScore` | Float | 0 - 100 | Índice de educación y salud del hogar (DFID) |
| `physicalCapitalScore` | Float | 0 - 100 | Índice de vivienda y servicios (DFID) |
| `financialCapitalScore` | Float | 0 - 100 | Índice de ingreso, ahorro y crédito (DFID) |
| `socialCapitalScore` | Float | 0 - 100 | Redes de apoyo y membresía cooperativa (DFID) |
| `naturalCapitalScore` | Float | 0 - 100 | Dotación de tierra, agua y ganado (DFID) |
| `resilienceScore` | Float | 0.0 - 1.0 | Índice ponderado de resiliencia socio-ecológica |
| `isPovertyFGT0` | Boolean | `true` / `false` | Indica si el ingreso per cápita está bajo la línea de pobreza |
| `isExtremePovertyFGT0` | Boolean | `true` / `false` | Indica si está bajo la línea de pobreza extrema |
| `povertyGap` | Float | 0.0 - 1.0 | $(z - y) / z$ si $y < z$ |
| `deprivationScore` | Float | 0.0 - 1.0 | Ponderación de privaciones $c_i$ en MPI |
| `isMultiDimensionallyPoor` | Boolean | `true` / `false` | $c_i \ge 0.333$ |
| `riskAversionLambda` | Float | 1.0 - 3.5 | Parámetro de aversión a la pérdida (Kahneman-Tversky) |

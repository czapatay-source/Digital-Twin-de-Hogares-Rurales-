# Marco de Ética y Gobernanza de Datos del DLT

## 1. No Invención de Datos sin Identificación Explícita
- Todo dato generado que no provenga de encuestas nacionales oficiales de hogares lleva la etiqueta `dataSource="SYNTHETIC"`.
- Los adaptadores para datos reales (PNAD, CASEN, ENIGHUR) conservan la procedencia estricta y checksums de integridad.

## 2. Inmutabilidad del Estado Observado
- El estado observado (`OBSERVED`) es de solo lectura y nunca se sobrescribe.
- Las intervenciones de política y choques climáticos crean ramas virtuales contrafactuales (`SIMULATED`), preservando la trazabilidad científica.

## 3. Privacidad y Protección de Datos Personales
- Los hogares están protegidos por identificadores anónimos (`RUR-BRA-XXXX`).
- La visualización geoespacial agrega los indicadores a nivel regional/provincial para evitar la re-identificación de microdatos individuales.

## 4. No Causalidad Falsa
- Las simulaciones proporcionan escenarios predictivos contrafactuales basados en dinámica de sistemas y modelos de agentes calibrados, sin arrogarse identificación causal aleatorizada no documentada.

## 5. Transparencia Algorítmica
- Todas las ecuaciones de recálculo (FGT, MPI, Gini, DFID y Prospect Theory) son auditables en el código abierto.

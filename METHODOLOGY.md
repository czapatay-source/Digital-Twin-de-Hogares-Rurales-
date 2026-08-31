# Metodología y Ecuaciones Formales del DLT

## 1. Índices de Pobreza de Foster-Greer-Thorbecke (FGT)

La clase de medidas FGT (1984) se define formalmente como:

$$P_\alpha = \frac{1}{N} \sum_{i=1}^{Q} \left( \frac{z - y_i}{z} \right)^\alpha$$

Donde:
- $N$: Tamaño total de la población.
- $Q$: Número de individuos con ingreso per cápita $y_i < z$.
- $z$: Línea de pobreza mensual per cápita (USD).
- $\alpha = 0$: Tasa de recuento de pobreza (Poverty Headcount Ratio $H$).
- $\alpha = 1$: Brecha de pobreza (Poverty Gap Index $PG$).
- $\alpha = 2$: Severidad de la pobreza (Squared Poverty Gap $SPG$).

---

## 2. Índice de Pobreza Multidimensional (MPI - Alkire & Foster)

El método de corte dual de Alkire y Foster (2011) evalúa 10 privaciones agrupadas en 3 dimensiones:
- **Salud (peso 1/3)**: Nutrición (1/6), Mortalidad infantil (1/6).
- **Educación (peso 1/3)**: Años de escolaridad (1/6), Asistencia escolar (1/6).
- **Nivel de Vida (peso 1/3)**: Combustible para cocinar (1/18), Saneamiento (1/18), Agua potable (1/18), Electricidad (1/18), Vivienda (1/18), Activos (1/18).

Puntaje de privación del hogar $i$:
$$c_i = \sum_{j=1}^{10} w_j \cdot d_{ij}$$

Un hogar es considerado multidimensionalmente pobre si $c_i \ge k$ (donde $k = 0.333$).
- Incidencia ($H$): $H = \frac{q}{N}$
- Intensidad ($A$): $A = \frac{\sum_{i \in \text{Pobre}} c_i}{q}$
- Índice MPI:
$$\text{MPI} = H \times A$$

---

## 3. Coeficiente de Gini de Desigualdad

$$G = \frac{\sum_{i=1}^n \sum_{j=1}^n |y_i - y_j|}{2 n^2 \bar{y}}$$

---

## 4. Índice Compuesto de Resiliencia (Marco DFID de 5 Capitales)

$$R_i = w_h C_h + w_p C_p + w_f C_f + w_s C_s + w_n C_n$$

Donde:
- $w_h = 0.25$: Capital Humano (educación, salud, fuerza de trabajo).
- $w_p = 0.20$: Capital Físico (vivienda, servicios básicos, equipamiento).
- $w_f = 0.25$: Capital Financiero (ingreso, ahorro, acceso a crédito).
- $w_s = 0.15$: Capital Social (redes comunitarias, cooperativas).
- $w_n = 0.15$: Capital Natural (tierra, agua, ganado, riesgo agroclimático).

---

## 5. Microeconomía Conductual (Prospect Theory de Kahneman & Tversky)

Función de valor subjetivo con respecto al punto de referencia de subsistencia ($x_0$):
$$v(\Delta x) = \begin{cases} (\Delta x)^\alpha & \text{si } \Delta x \ge 0 \\ -\lambda (-\Delta x)^\beta & \text{si } \Delta x < 0 \end{cases}$$

Con parámetros calibrados empíricamente:
- $\alpha = 0.88$ (Sensibilidad marginal decreciente en ganancias).
- $\beta = 0.88$ (Sensibilidad marginal decreciente en pérdidas).
- $\lambda = 2.25$ (Coeficiente de aversión a la pérdida).

---

## 6. Score de Eficiencia de Política (Policy Efficiency Score - PES)

$$\text{PES} = 0.35 \cdot \text{ReducciónPobreza} + 0.25 \cdot \text{Focalización} + 0.20 \cdot \text{MejoraMPI} + 0.20 \cdot \text{Resiliencia}$$
Donde la focalización penaliza los errores de inclusión ($IE$) y exclusión ($EE$).

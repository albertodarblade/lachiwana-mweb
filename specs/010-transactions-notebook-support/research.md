# Research: Soporte de Notebooks de Transacciones

**Feature**: 010-transactions-notebook-support
**Date**: 2026-05-08
**Status**: Complete — all unknowns resolved

---

## Decision 1: Enum values para `type` y `transactionsViewType`

**Decision**: Los valores del backend son `'notes'` / `'transactions'` para `type`, y `'by-month'` / `'all'` para `transactionsViewType`.

**Rationale**: Confirmado leyendo el schema de Mongoose en `Lachiwana-service/src/modules/notebooks/schemas/notebook.schema.ts`. El spec original usaba `ALL_ENTRIES` / `BY_MONTH` como placeholder conceptual; los valores reales del enum son en minúsculas con guión.

**Alternatives considered**: N/A — el backend es la fuente de verdad para estos valores.

---

## Decision 2: Componente Radio Button — Framework7 nativo vs. custom

**Decision**: Usar el componente `<Radio>` nativo de Framework7-React directamente. No crear un wrapper personalizado.

**Rationale**: Framework7 ya provee `<Radio>` como primitivo. No hay un componente `RadioButton` en el codebase porque ninguna feature anterior lo necesitó, pero el sistema de diseño ya lo incluye. La Constitución (principio III) exige usar Framework7 como base; la Constitución (principio IV) solo requiere construir desde cero cuando el componente no existe en el catálogo de F7.

**Alternatives considered**: Crear un componente `TypeSelector` que envuelva `<Radio>` con estilos específicos. Aceptable si el patrón visual requiere más que el Radio bare de F7 (e.g., para coincidir con el estilo de `IconSelector`). Decisión final: crear `TypeSelector` como thin wrapper con estilos CSS Module, usando `<Radio>` internamente.

---

## Decision 3: Persistencia y ubicación del selector `transactionsViewType`

**Decision**: El selector `transactionsViewType` (`'all'` | `'by-month'`) vive **exclusivamente en `EditNotebookPage`**, no en `NotebookTransactionsPage`. El valor se persiste en el servidor como parte del documento `Notebook` vía `PATCH /api/v1/notebooks/:id`. La página de transacciones solo lee el valor y renderiza en consecuencia.

**Rationale**: Decisión de diseño confirmada en `/speckit-clarify` (2026-05-08). Mantener el selector en ajustes reduce la complejidad visual de la pantalla principal de transacciones (principio II, Minimalist Layout). La persistencia server-side garantiza que la preferencia sobrevive recargas y cambios de dispositivo, sin necesidad de localStorage adicional.

**Alternatives considered**: Toggle visible en el header de `NotebookTransactionsPage` (rechazado — satura la pantalla principal); `useState` local (rechazado — no persiste entre sesiones); `settingsStore.js` (rechazado — duplica estado del servidor).

---

## Decision 4: Componente MonthSelector — construcción desde cero

**Decision**: Construir `MonthSelector` como custom component usando primitivos de Framework7 (`<Block>`, `<Button>`, iconos de Framework7-Icons). No existe en el codebase; debe crearse per Constitución IV.

**Rationale**: El diseño visual muestra un row con chevrons izquierdo/derecho, texto del mes/año centrado, y balance total en rojo debajo. Este patrón no existe en el catálogo de F7; se construye con bloques F7 y estilos CSS Module.

**Pattern reference**: Similar al `IconSelector` existente — grid/flex layout con CSS Module, sin dependencias externas.

---

## Decision 5: Routing — manejo de `/notebooks/:id` existente

**Decision**: Mantener la ruta `/notebooks/:id` como ruta de redirección condicional. Agregar rutas nuevas `/notebooks/:id/notes` y `/notebooks/:id/transactions`. La ruta legacy `/notebooks/:id` navega a la subruta correcta basándose en `notebook.type` al cargar.

**Rationale**: Preserva compatibilidad con links existentes (NotebookCard navega a `/notebooks/:id`). Centraliza la lógica de redirección en un único punto, sin duplicar componentes.

**Alternatives considered**: Cambiar todos los `navigate('/notebooks/:id')` a la subruta correcta directamente. Más explícito pero requiere más cambios dispersos; la redirección central es más mantenible.

---

## Decision 6: Lista de transacciones — color de monto

**Decision**: Usar clases CSS condicionales (`.negative` / `.positive` / `.neutral`) en lugar de `style={{ color }}` inline. El color de cada clase se define en el CSS Module.

**Rationale**: La Constitución (XI) prohíbe `style={{}}` para valores estáticos. El color por signo es estructuralmente estático (rojo para negativo, verde para positivo); solo la selección de clase es dinámica. Patrón: `className={amount < 0 ? styles.negative : amount > 0 ? styles.positive : styles.neutral}`.

---

## Decision 7: Botón FAB — Framework7 `<Fab>`

**Decision**: Usar el componente `<Fab>` de Framework7 para el botón de creación placeholder.

**Rationale**: Framework7 provee `<Fab>` (Floating Action Button) con el estilo visual correcto (circular, color tema, esquina inferior derecha). Coincide exactamente con el diseño visual del mockup. No requiere construcción custom.

---

## Resolved Clarifications from Spec

| Item | Resolution |
|------|------------|
| Enum values `BY_MONTH` / `ALL_ENTRIES` (spec conceptual) | Reales: `'by-month'` / `'all'` |
| ¿Existe Radio Button en el codebase? | No existe como componente; se usa `<Radio>` de F7 via `TypeSelector` wrapper |
| ¿MonthSelector existe? | No — construir desde cero |
| ¿Backend soporta `type` y `transactionsViewType`? | Confirmado en schema de Mongoose |
| ¿Dónde vive el selector `transactionsViewType`? | Solo en `EditNotebookPage`; no en la vista de transacciones |
| Mes inicial de MonthSelector | Siempre el mes calendar actual |
| Cambio de type de 'transactions' a 'notes' | Transacciones se preservan en DB; frontend redirige a /notes sin advertencia |

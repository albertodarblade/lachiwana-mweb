# Implementation Plan: Soporte de Notebooks de Transacciones

**Branch**: `010-transactions-notebook-support` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-transactions-notebook-support/spec.md`

## Summary

Añadir soporte para un nuevo tipo de Notebook (`'transactions'`) en el frontend React/Framework7. La feature incluye: campo `type` (Radio Button via `TypeSelector`) en creación/edición de Notebooks, selector `transactionsViewType` (`'all'` | `'by-month'`) también en la página de edición, navegación condicional (`/notes` vs `/transactions`) según el tipo, página de listado de transacciones que renderiza `MonthSelector` + lista filtrada o resumen general según el `transactionsViewType` guardado, y un botón FAB placeholder para creación futura. Todos los datos fluyen por TanStack React Query; los nuevos componentes se construyen con Framework7 primitivos y CSS Modules.

## Technical Context

**Language/Version**: JavaScript (React 19.2.5)
**Primary Dependencies**: Framework7-React 9.0.3, TanStack React Query 5.100.9, Vite 8.0.10
**Storage**: React Query cache con localStorage persistence (`@tanstack/react-query-persist-client`)
**Testing**: Manual — sin unit tests (Constitución IX)
**Target Platform**: Mobile-first PWA (Framework7 iOS/Material theme)
**Project Type**: Mobile web application (PWA)
**Performance Goals**: Navegación instantánea (cache-first via React Query)
**Constraints**: Sin librerías UI de terceros; solo Framework7 + custom components
**Scale/Scope**: ~7 archivos nuevos + ~4 modificados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Todos los componentes nuevos usan layout Framework7 y siguen el patrón visual del mockup móvil.
- [x] **II. Minimalist Layout** — La vista de transacciones tiene una sola acción dominante (FAB "+"); `MonthSelector` y la lista son el único contenido.
- [x] **III. Framework7** — `TypeSelector` usa `<Radio>` de F7; `MonthSelector` usa `<Block>` y `<Button>` de F7; FAB usa `<Fab>` de F7.
- [x] **IV. Custom Components** — `MonthSelector` y `TransactionCard` no existen en el catálogo de F7 y se construyen desde cero.
- [x] **V. TanStack Query** — `useNotebook(id)` provee datos del notebook y sus transacciones; `useUpdateNotebook` persiste cambios de `type` y `transactionsViewType`.
- [x] **VI. Optimistic UI** — `useUpdateNotebook` ya implementa optimistic update; cambios de `type` y `transactionsViewType` se aplican optimistamente al cache `['notebooks', id]`.
- [x] **VII. Cache Integrity** — `useUpdateNotebook` invalida `['notebooks', id]` y `['notebooks']` tras cada mutación.
- [x] **VIII. Clean Code** — Componentes nombrados auto-descriptivamente; funciones de filtro de mes son single-responsibility.
- [x] **IX. No Unit Tests** — No se planifican archivos de test.
- [x] **X. Maintainability** — Nuevos componentes en `src/components/transactions/`; nueva página en `src/pages/`; hooks en `src/hooks/`.
- [x] **XI. CSS Modules** — Todos los componentes nuevos tienen su `.module.css` co-ubicado. Color de monto (dinámico por signo) con clases condicionales (`styles.negative` / `styles.positive`), no con `style={{}}`.

**No violations — Complexity Tracking table omitted.**

## Project Structure

### Documentation (this feature)

```text
specs/010-transactions-notebook-support/
├── plan.md              ← este archivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── api-contracts.md
└── tasks.md             ← generado por /speckit-tasks (próximo paso)
```

### Source Code (repository root)

```text
src/
├── api/
│   └── notebooks.js                     (modificar: pasar type en createNotebook; no cambio en updateNotebook, ya es PATCH genérico)
├── components/
│   ├── notebooks/
│   │   ├── TypeSelector.jsx              (NUEVO — Radio Button para type: 'notes'|'transactions')
│   │   └── TypeSelector.module.css       (NUEVO)
│   └── transactions/                     (NUEVO directorio)
│       ├── MonthSelector.jsx             (NUEVO — navegador de mes con balance total)
│       ├── MonthSelector.module.css      (NUEVO)
│       ├── TransactionCard.jsx           (NUEVO — fila: descripción, tags, monto colorido, fecha)
│       ├── TransactionCard.module.css    (NUEVO)
│       ├── TransactionEmptyState.jsx     (NUEVO)
│       └── TransactionEmptyState.module.css (NUEVO)
├── hooks/
│   └── useTransactions.js               (NUEVO — filtra transactions del notebook cache por mes opcional)
├── pages/
│   ├── CreateNotebookPage.jsx           (modificar: añadir TypeSelector para campo type)
│   ├── EditNotebookPage.jsx             (modificar: añadir TypeSelector para type + selector transactionsViewType cuando type='transactions')
│   ├── NotebookDetailPage.jsx           (modificar: leer notebook.type y redirigir a /notes o /transactions)
│   └── NotebookTransactionsPage.jsx     (NUEVO — vista de transacciones: MonthSelector o resumen según transactionsViewType)
│       └── NotebookTransactionsPage.module.css (NUEVO)
└── App.jsx                              (modificar: añadir rutas /notes y /transactions)
```

**Structure Decision**: Single project frontend. Componentes de transacciones en `src/components/transactions/` para separación por dominio. Hooks en `src/hooks/` siguiendo el patrón existente.

---

## Implementation Blueprint

### Paso 1 — Rutas (`App.jsx`)

Agregar rutas en el array `routes`:
- `/notebooks/:id/notes` → `NotebookDetailPage` (existente, re-mapeado)
- `/notebooks/:id/transactions` → `NotebookTransactionsPage` (nuevo)

Mantener `/notebooks/:id` como ruta de redirección condicional: `NotebookDetailPage` carga el notebook via `useNotebook(id)` y, una vez disponible, navega con `f7router.navigate` hacia la subruta correcta usando `replace: true` para no ensuciar el historial.

### Paso 2 — `TypeSelector` component

Wrapper de `<Radio>` de Framework7 con dos opciones: "Notas" y "Transacciones". Props: `value` (`'notes'|'transactions'`), `onChange`. Estilos en `TypeSelector.module.css`. Patrón visual: opciones en `<List>` con `<ListItem>` + `<Radio>` inline, usando `var(--f7-theme-color)` para el ítem seleccionado.

### Paso 3 — `CreateNotebookPage` y `EditNotebookPage`

**CreateNotebookPage**: Añadir `<TypeSelector>` al formulario (después de nombre/ícono). Incluir `type` en el payload de `useCreateNotebook`.

**EditNotebookPage**: 
- Añadir `<TypeSelector>` para editar `type`.
- Cuando `notebook.type === 'transactions'`, mostrar adicionalmente un selector de Radio Button para `transactionsViewType` (`'all'` | `'by-month'`). Este segundo selector también usa `<Radio>` de F7.
- Ambos cambios se persisten via `useUpdateNotebook` con optimistic update.

### Paso 4 — `useTransactions` hook

```js
// src/hooks/useTransactions.js
// Consume useNotebook(id), retorna transactions filtradas por mes cuando se provee {year, month}
export function useTransactions(notebookId, { year, month } = {}) {
  const { data: notebook } = useNotebook(notebookId)
  const transactions = notebook?.transactions ?? []
  if (year != null && month != null) {
    return transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }
  return transactions
}
```

### Paso 5 — `MonthSelector` component

Props: `year`, `month` (1–12), `total` (número con signo), `onPrev`, `onNext`.

Layout: fila flex con `<Button>` chevron_left — texto "{mes} de {año}" centrado — `<Button>` chevron_right; segunda fila con balance total en color condicional (rojo si negativo). Iconos: `chevron_left` / `chevron_right` de Framework7-Icons.

### Paso 6 — `TransactionCard` component

Props: `transaction` (`{ _id, description, amount, date, tags, attachments }`).

Layout: fila superior con descripción (izquierda) + monto colorido (derecha); fila inferior con tags como `<TagChip>` (reutilizar el existente en `src/components/notebooks/TagChip.jsx`) + fecha relativa. Color del monto: `className={amount < 0 ? styles.negative : amount > 0 ? styles.positive : styles.neutral}`.

### Paso 7 — `NotebookTransactionsPage`

Nueva página en `src/pages/NotebookTransactionsPage.jsx`. Responsabilidades:

1. Leer `notebookId` de los params de ruta Framework7 (`props.f7route.params.id`).
2. Cargar datos con `useNotebook(notebookId)` → obtiene `notebook.transactionsViewType` y `notebook.transactions`.
3. Mantener `MonthCursor` en estado local: `{ year, month }` inicializado con el mes calendar actual (`new Date()`).
4. Renderizar:
   - `<Navbar>` con título del notebook + botón de configuración (navega a `/notebooks/:id/edit`).
   - Si `notebook.transactionsViewType === 'by-month'`:
     - `<MonthSelector>` con `year`, `month`, `total` (suma de amounts del mes) y handlers `onPrev`/`onNext`.
     - Lista de `<TransactionCard>` para el mes activo (via `useTransactions(id, {year, month})`).
     - Si lista vacía: `<TransactionEmptyState>`.
   - Si `notebook.transactionsViewType === 'all'`:
     - Balance total acumulado (suma de todos los amounts).
     - Lista completa de `<TransactionCard>` (via `useTransactions(id)`).
     - Si lista vacía: `<TransactionEmptyState>`.
5. `<Fab>` placeholder en esquina inferior derecha; al presionar muestra toast "Próximamente".

**Nota**: El selector de `transactionsViewType` NO aparece en esta página; vive exclusivamente en `EditNotebookPage` (per clarificación de diseño).

### Paso 8 — `TransactionEmptyState` component

Mensaje de estado vacío cuando no hay transacciones en el mes/notebook. Patrón idéntico al `NoteEmptyState` existente en `src/components/notes/NoteEmptyState.jsx`.

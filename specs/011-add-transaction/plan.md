# Implementation Plan: Añadir Transacción a un Notebook

**Branch**: `011-add-transaction` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-add-transaction/spec.md`

## Summary

Implementar el flujo completo de creación de transacciones en un Notebook de tipo `'transactions'`. El FAB existente (actualmente placeholder) se convierte en un Speed Dial con dos botones: "Gasto" (rojo) e "Ingreso" (verde). Al elegir el tipo, el flujo abre opcionalmente un sheet de selección de etiquetas y luego un formulario con monto (autofocus), descripción y fecha. La transacción se guarda via `POST /api/v1/notebooks/:notebookId/transactions` y la lista se actualiza al invalidar el cache del notebook. También se corrige el mismatch de campos (`amount`→`value`, `description`→`content`) en `TransactionCard.jsx`.

## Technical Context

**Language/Version**: JavaScript (React 19.2.5)
**Primary Dependencies**: Framework7-React 9.0.3, TanStack React Query 5.100.9, Vite 8.0.10
**Storage**: React Query cache con localStorage persistence
**Testing**: Manual — sin unit tests (Constitución IX)
**Target Platform**: Mobile-first PWA (Framework7)
**Project Type**: Mobile web application (PWA)
**Performance Goals**: Creación de transacción en menos de 30 segundos end-to-end
**Constraints**: Sin librerías UI de terceros; solo Framework7 + custom components; CSS Modules obligatorio
**Scale/Scope**: ~6 archivos nuevos + ~3 modificados

## Constitution Check

- [x] **I. Mobile-First** — Speed Dial, Sheet y formulario son componentes nativos de Framework7 diseñados para móvil.
- [x] **II. Minimalist Layout** — Cada paso del flujo tiene una sola acción dominante: elegir tipo, elegir etiquetas, o ingresar el monto.
- [x] **III. Framework7** — Speed Dial usa `<Fab>`, `<FabButtons>`, `<FabButton>`, `<FabBackdrop>`; sheets usan `<Sheet>`, `<PageContent>`; formulario usa `<List>`, `<ListInput>`.
- [x] **IV. Custom Components** — `TagSelectionSheet` y `TransactionFormSheet` se construyen desde cero con primitivos de F7.
- [x] **V. TanStack Query** — `useCreateTransaction` usa `useMutation`; lista se actualiza via invalidación de `useNotebook`.
- [x] **VI. Optimistic UI** — No aplica: el backend asigna `createdBy` y `_id` no predecibles. La invalidación inmediata garantiza UI actualizada sin estado inconsistente.
- [x] **VII. Cache Integrity** — `onSuccess` invalida `['notebook', notebookId]`, refrescando `useNotebook` y `useTransactions`.
- [x] **VIII. Clean Code** — Componentes nombrados descriptivamente; lógica de signo encapsulada en la función de submit.
- [x] **IX. No Unit Tests** — No se planifican archivos de test.
- [x] **X. Maintainability** — Nuevos componentes en `src/components/transactions/`; hooks en `src/hooks/`; API en `src/api/`.
- [x] **XI. CSS Modules** — Colores del Speed Dial (rojo/verde) en `.module.css` con clases `.expenseBtn` y `.incomeBtn`. Color de balance condicional por clase, no `style={{}}`.

**No violations — Complexity Tracking table omitted.**

## Project Structure

### Documentation (this feature)

```text
specs/011-add-transaction/
├── plan.md              ← este archivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── api-contracts.md
└── tasks.md             ← generado por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── api/
│   └── transactions.js                     (NUEVO — createTransaction(notebookId, payload))
├── components/
│   └── transactions/
│       ├── TransactionCard.jsx             (MODIFICAR — fix: amount→value, description→content)
│       ├── TagSelectionSheet.jsx           (NUEVO — Sheet multi-select de etiquetas)
│       ├── TagSelectionSheet.module.css    (NUEVO)
│       ├── TransactionFormSheet.jsx        (NUEVO — Formulario: monto, contenido, fecha)
│       └── TransactionFormSheet.module.css (NUEVO)
├── hooks/
│   └── useCreateTransaction.js            (NUEVO — useMutation con invalidación del notebook)
└── pages/
    └── NotebookTransactionsPage.jsx       (MODIFICAR — Speed Dial + estado del flujo + sheets)
```

---

## Implementation Blueprint

### Paso 1 — Fix campo names en `TransactionCard.jsx`

Corregir referencias incorrectas:
- `transaction.amount` → `transaction.value`
- `transaction.description` → `transaction.content`
- Renombrar variable local `amount` a `value` en `formatAmount` y en la lógica de clase condicional.

### Paso 2 — `src/api/transactions.js`

Crear archivo con función:
```js
import { post } from './client'
export const createTransaction = (notebookId, payload) =>
  post(`/api/v1/notebooks/${notebookId}/transactions`, payload)
```

### Paso 3 — `useCreateTransaction` hook

Hook que recibe `notebookId` como parámetro del hook (no de la mutación):
- `mutationFn: (payload) => createTransaction(notebookId, payload)`
- `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] })`
- Sin optimistic update (backend asigna `createdBy` y `_id`)

### Paso 4 — `TagSelectionSheet` component

Sheet de F7 con:
- Header: título "Categoría" + subtítulo + botón "Editar" que navega a `/notebooks/:id/edit`
- Lista: `<ListItem checkbox>` por cada tag con ícono F7 en media slot y nombre
- Indicador visual de selección: checkbox de F7 con `checked={selectedTagIds.has(tag.id)}`
- Footer: botón "Confirmar" que llama `onConfirm(newSelectedIds)` y cierra el sheet
- Props: `opened`, `tags`, `selectedTagIds`, `onConfirm(ids)`, `onClose`

### Paso 5 — `TransactionFormSheet` component

Sheet de F7 con:
- Header: flecha atrás (←) que llama `onBack()` + título "Añadir Gasto" / "Añadir Ingreso"
- Row de tags seleccionadas: chips de TagChip (si hay alguna)
- Campo monto: `<ListInput type="number" inputmode="decimal">` con prefijo "Bs." y `autoFocus`
- Campo contenido: `<ListInput type="text">` placeholder "Descripción" (opcional)
- Campo fecha: `<input type="date">` con ícono calendario, valor default = `new Date().toISOString().split('T')[0]`, formateado visualmente con `toLocaleDateString('es',...)`
- Botón submit: "Añadir Gasto" / "Añadir Ingreso" (color del notebook)
- Lógica de submit: `value = type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount))`

### Paso 6 — Speed Dial en `NotebookTransactionsPage`

Reemplazar el `<Fab>` placeholder con la estructura Speed Dial:

**Estado nuevo**:
```js
const [transactionType, setTransactionType] = useState(null) // 'expense'|'income'|null
const [selectedTagIds, setSelectedTagIds] = useState(new Set())
const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
```

**Handlers**:
- `handleTypeSelect(type)`: setTransactionType → abre TagSheet si hay tags, si no abre FormSheet
- `handleTagsConfirm(ids)`: setSelectedTagIds → cierra TagSheet → abre FormSheet
- `handleFormBack()`: cierra FormSheet → abre TagSheet si hay tags
- `handleFlowClose()`: resetea todo el estado del flujo

**JSX del Speed Dial**:
```jsx
<Fab position="right-bottom">
  <Icon ios="f7:plus" />   // ícono cuando está cerrado
  <Icon ios="f7:xmark" />  // ícono cuando está expandido
  <FabButtons position="top">
    <FabButton fabClose label="Gasto" className={styles.expenseBtn}
      onClick={() => handleTypeSelect('expense')}>
      <Icon ios="f7:minus" />
    </FabButton>
    <FabButton fabClose label="Ingreso" className={styles.incomeBtn}
      onClick={() => handleTypeSelect('income')}>
      <Icon ios="f7:plus" />
    </FabButton>
  </FabButtons>
</Fab>
<FabBackdrop onClick={handleFlowClose} />
```

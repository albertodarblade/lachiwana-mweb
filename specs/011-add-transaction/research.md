# Research: Añadir Transacción a un Notebook

**Feature**: 011-add-transaction
**Date**: 2026-05-09
**Status**: Complete — all unknowns resolved

---

## Decision 1: Backend API — endpoint y campos confirmados

**Decision**: El endpoint para crear transacciones es `POST /api/v1/notebooks/:notebookId/transactions`. El payload es `{ value, date, content?, tags? }`. Los campos se llaman `value` (no `amount`) y `content` (no `description`).

**Rationale**: Confirmado leyendo `transactions.controller.ts` y `CreateTransactionDto` en el repositorio hermano. El campo `value` es un número con signo (positivo para ingresos, negativo para gastos).

**Critical finding**: `TransactionCard.jsx` y `useTransactions.js` usan `amount` y `description` que NO existen en el schema del backend. Estos archivos deben corregirse como parte de esta feature.

---

## Decision 2: Sign convention — cómo aplicar el signo

**Decision**: El usuario ingresa siempre un valor absoluto en el campo de monto. El componente de formulario aplica el signo antes de enviar: `value = transactionType === 'expense' ? -Math.abs(input) : Math.abs(input)`.

**Rationale**: El backend acepta cualquier número con signo en el campo `value`. La lógica de signo vive en el frontend (componente de formulario) basándose en el tipo seleccionado (gasto/ingreso).

**Alternatives considered**: Enviar el número sin signo y que el backend infiera — rechazado porque el backend no tiene concepto de "tipo", solo usa el signo del número.

---

## Decision 3: Speed Dial — componentes Framework7

**Decision**: Usar `<Fab>` con `<FabButtons>` y `<FabButton>` de `framework7-react` para implementar el Speed Dial. Agregar `<FabBackdrop />` para el fondo semitransparente al expandirse. Colores via clases CSS Module: `.expenseBtn` (rojo `#e53935`) y `.incomeBtn` (verde `#43a047`).

**Rationale**: Framework7 v9.0.3 incluye el componente Speed Dial nativo. Los colores son estáticos (siempre rojo/verde), por lo que deben ir en CSS Module per Constitución XI.

**Alternatives considered**: Sheet con dos botones grandes (rechazado por el usuario); action sheet nativo (rechazado por el usuario).

---

## Decision 4: Flujo de sheets — dos sheets separados con estado compartido

**Decision**: El estado del flujo vive en `NotebookTransactionsPage`. Dos sheets separados: `TagSelectionSheet` y `TransactionFormSheet`. El estado compartido incluye: `transactionType` (`'expense'`|`'income'`), `selectedTagIds` (Set), y qué sheet está abierto.

**Rationale**: Sheets separados permiten abrir/cerrar independientemente y preservar estado entre pasos. El estado en el page padre permite que el retroceso (formulario → etiquetas) funcione correctamente.

**Flow**: Speed Dial → elige tipo → [if notebook.tags.length > 0: TagSelectionSheet] → TransactionFormSheet → submit → actualiza cache

---

## Decision 5: TagSelectionSheet — multi-select con TagChip visual

**Decision**: Usar `<Sheet>` de F7 con lista de etiquetas. Cada etiqueta se muestra con `<ListItem checkbox>` (para permitir selección múltiple) con el ícono de `TagChip` en el slot de media. Botón "Confirmar" al pie del sheet.

**Rationale**: El patrón `<ListItem checkbox>` ya existe en `MemberPicker.jsx`. Adaptar el mismo patrón para etiquetas es consistente y reutilizable.

---

## Decision 6: TransactionFormSheet — input de fecha nativo

**Decision**: Campo de fecha usando `<input type="date">` estilizado dentro de un `<ListItem>` de F7. El valor por defecto es `new Date().toISOString().split('T')[0]`. El valor se formatea para display con `toLocaleDateString('es', {...})`.

**Rationale**: La Constitución no menciona restricciones sobre inputs HTML nativos. El input `type="date"` es el selector nativo del dispositivo (spec requirement). Alternativa con F7 DatetimePicker es más compleja y no añade valor.

---

## Decision 7: useCreateTransaction — patrón de mutación

**Decision**: Crear `src/hooks/useCreateTransaction.js` siguiendo el patrón exacto de `useUpdateNotebook`. Invalidar `['notebook', notebookId]` después del mutate (las transactions son sub-documentos del notebook). No usar optimistic update para transactions (el backend asigna `_id` y `createdBy`; no tenemos esos datos en el cliente antes del response).

**Rationale**: Las transacciones son sub-documentos embebidos. Al invalidar `['notebook', notebookId]`, el `useNotebook` y `useTransactions` automáticamente refrescan con los datos actualizados incluyendo la nueva transacción.

**Alternatives considered**: Optimistic update con temp ID — rechazado porque el backend asigna `createdBy` que no podemos predecir sin acceso al token decoded; y la latencia es baja en una red local.

---

## Decision 8: Campo name fix — value vs amount, content vs description

**Decision**: Actualizar `TransactionCard.jsx` para usar `transaction.value` (en lugar de `amount`) y `transaction.content` (en lugar de `description`). Actualizar `useTransactions.js` si referencia estos campos.

**Rationale**: El backend retorna `value` y `content`. El mismatch causa que los componentes muestren `undefined`. Debe corregirse como parte de esta feature.

---

## Resolved Clarifications from Spec

| Item | Resolution |
|------|------------|
| Backend endpoint | `POST /api/v1/notebooks/:notebookId/transactions` confirmado |
| Field names | `value` (no `amount`), `content` (no `description`) — fix requerido en TransactionCard |
| Sign convention | Frontend aplica signo: expense → negativo, income → positivo |
| Speed Dial UI | `Fab + FabButtons + FabButton + FabBackdrop` de F7 |
| Sheet para etiquetas | `Sheet` de F7 con `ListItem checkbox` |
| Fecha | `<input type="date">` nativo |
| Optimistic update | No aplica para createTransaction; invalidar cache tras éxito |

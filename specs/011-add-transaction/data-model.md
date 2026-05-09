# Data Model: Añadir Transacción a un Notebook

**Feature**: 011-add-transaction
**Date**: 2026-05-09

---

## Entidades del Backend (confirmadas)

### Transaction (sub-documento embebido en Notebook)

| Campo        | Tipo          | Requerido | Descripción                                                    |
|--------------|---------------|-----------|----------------------------------------------------------------|
| `_id`        | ObjectId      | Auto      | ID generado por Mongoose                                        |
| `value`      | `number`      | Sí        | Monto con signo: negativo = gasto, positivo = ingreso          |
| `date`       | `Date`        | Sí        | Fecha de la transacción (provista por el usuario)               |
| `content`    | `string\|null` | No       | Descripción libre; default `null`                               |
| `createdBy`  | `string`      | Sí        | Google subject ID del creador (seteado por el backend)          |
| `tags`       | `string[]`    | No        | Array de IDs de tags del Notebook; default `[]`                 |
| `attachments`| `Attachment[]`| No        | Sub-documentos; fuera del alcance de esta feature               |
| `createdAt`  | `Date`        | Auto      | Timestamps                                                      |
| `updatedAt`  | `Date`        | Auto      | Timestamps                                                      |

**Payload enviado por el frontend** (POST):
```json
{
  "value": -100,
  "date": "2026-05-09",
  "content": "Luz del mes",
  "tags": ["tag-id-1", "tag-id-2"]
}
```

---

## Estado del Flujo (UI state — no persiste)

### TransactionCreationFlow (estado local en NotebookTransactionsPage)

| Campo              | Tipo                         | Descripción                                               |
|--------------------|------------------------------|-----------------------------------------------------------|
| `transactionType`  | `'expense'\|'income'\|null`  | Tipo elegido en Speed Dial; null = flujo no iniciado      |
| `selectedTagIds`   | `Set<string>`                | IDs de tags seleccionadas; preservadas al retroceder      |
| `isTagSheetOpen`   | `boolean`                    | Controla visibilidad del TagSelectionSheet                |
| `isFormSheetOpen`  | `boolean`                    | Controla visibilidad del TransactionFormSheet             |

### TransactionFormDraft (estado local en TransactionFormSheet)

| Campo    | Tipo     | Descripción                                          |
|----------|----------|------------------------------------------------------|
| `amount` | `string` | Valor absoluto ingresado por el usuario (sin signo)  |
| `content`| `string` | Descripción libre (opcional)                         |
| `date`   | `string` | ISO date string; default = hoy (`YYYY-MM-DD`)        |

---

## Correcciones a Código Existente

### TransactionCard.jsx — campos incorrectos

| Campo actual (incorrecto) | Campo correcto (backend) |
|---------------------------|--------------------------|
| `transaction.amount`       | `transaction.value`      |
| `transaction.description`  | `transaction.content`    |

La función `formatAmount(amount)` debe renombrarse a `formatAmount(value)` internamente. El resto de la lógica (signo, color) sigue igual usando `transaction.value`.

---

## Nuevos Componentes y Sus Props

### `TagSelectionSheet`
```
Props:
  opened: boolean
  tags: Tag[]                          — notebook.tags completos (id, title, icon)
  selectedTagIds: Set<string>
  onConfirm: (selectedIds: Set<string>) => void
  onClose: () => void
```

### `TransactionFormSheet`
```
Props:
  opened: boolean
  transactionType: 'expense' | 'income'
  selectedTags: Tag[]                  — tags completos (id, title, icon)
  notebookId: string
  onBack: () => void                   — regresa al TagSelectionSheet (o cierra si sin etiquetas)
  onClose: () => void
  onSuccess: () => void
```

---

## API Layer

### Nuevo: `src/api/transactions.js`
```
createTransaction(notebookId, payload) → POST /api/v1/notebooks/:notebookId/transactions
```

### Nuevo: `src/hooks/useCreateTransaction.js`
```
useCreateTransaction(notebookId)
  → useMutation({ mutationFn, onSuccess: invalidate ['notebook', notebookId] })
```

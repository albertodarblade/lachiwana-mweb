# Data Model: Soporte de Notebooks de Transacciones

**Feature**: 010-transactions-notebook-support
**Date**: 2026-05-08

---

## Entidades del Frontend

### Notebook (existente — campos nuevos)

| Campo               | Tipo                          | Descripción                                              |
|---------------------|-------------------------------|----------------------------------------------------------|
| `_id`               | `string`                      | ID MongoDB (ya existente)                                |
| `title`             | `string`                      | Nombre del notebook (ya existente)                       |
| `type`              | `'notes' \| 'transactions'`   | **NUEVO** — tipo de notebook; default `'notes'`          |
| `transactionsViewType` | `'all' \| 'by-month'`      | **NUEVO** — modo de vista para notebooks de transacciones; default `'all'` |
| `color`             | `string \| null`              | Color hexadecimal (ya existente)                         |
| `iconName`          | `string \| null`              | Nombre del icono F7 (ya existente)                       |
| `transactions`      | `Transaction[]`               | **NUEVO** — lista de transacciones del notebook          |
| `tags`              | `Tag[]`                       | Tags del notebook (ya existente)                         |

**Validation rules**:
- `type` debe ser uno de los valores del enum; el default es `'notes'` para compatibilidad con notebooks existentes.
- `transactionsViewType` solo es relevante cuando `type === 'transactions'`; ignorar cuando `type === 'notes'`.

**State transitions**:
- `type: 'notes'` → `type: 'transactions'`: redirigir a `/notebooks/:id/transactions`, la vista de notas queda deshabilitada.
- `type: 'transactions'` → `type: 'notes'`: redirigir a `/notebooks/:id/notes`, la vista de transacciones queda deshabilitada.

---

### Transaction (nueva entidad del backend)

| Campo         | Tipo            | Descripción                                              |
|---------------|-----------------|----------------------------------------------------------|
| `_id`         | `string`        | ID MongoDB                                               |
| `description` | `string`        | Texto descriptivo de la transacción                      |
| `amount`      | `number`        | Monto con signo (negativo = egreso, positivo = ingreso)  |
| `date`        | `string` (ISO)  | Fecha de la transacción                                  |
| `tags`        | `Tag[]`         | Tags asociados a la transacción                          |
| `attachments` | `Attachment[]`  | Adjuntos (imágenes, archivos)                            |

**Display rules**:
- `amount < 0`: mostrar en rojo (`styles.negative`)
- `amount > 0`: mostrar en verde (`styles.positive`)
- `amount === 0`: mostrar en color neutro (`styles.neutral`)
- Formato visual: `Bs. -63` / `Bs. 350` (signo integrado en el número)

---

### MonthCursor (UI state — no persiste en servidor)

Estado local del componente `MonthSelector`, manejado con `useState`:

| Campo   | Tipo     | Descripción                                    |
|---------|----------|------------------------------------------------|
| `year`  | `number` | Año activo (ej. 2026)                          |
| `month` | `number` | Mes activo 1-12 (ej. 5 = mayo)                 |

**Derivados**:
- `monthLabel`: `new Date(year, month-1).toLocaleDateString('es', {month:'long', year:'numeric'})`
- `monthTotal`: suma de `amount` de todas las transacciones del mes activo (calculado en componente padre o hook)

---

## React Query Cache Keys

| Key                                 | Scope                              | Invalidated by                  |
|-------------------------------------|------------------------------------|---------------------------------|
| `['notebooks']`                     | Lista de todos los notebooks       | `useCreateNotebook`, `useDeleteNotebook` |
| `['notebooks', id]`                 | Notebook individual                | `useUpdateNotebook`             |
| `['notebooks', id, 'transactions']` | Transacciones de un notebook       | (futura) mutación de transacción |

**Note**: Las transacciones son sub-documentos del Notebook en el backend actual. El cache key `['notebooks', id]` ya incluye el array `transactions`. Un query key adicional para transacciones puede introducirse en una iteración futura si se añade un endpoint dedicado.

---

## Nuevos Componentes y Sus Props

### `TypeSelector`
```
Props:
  value: 'notes' | 'transactions'
  onChange: (value: 'notes' | 'transactions') => void
  disabled?: boolean
```

### `MonthSelector`
```
Props:
  year: number
  month: number        (1-12)
  total: number        (balance del mes, puede ser negativo)
  onPrev: () => void
  onNext: () => void
```

### `TransactionCard`
```
Props:
  transaction: Transaction
```

### `TransactionEmptyState`
```
Props:
  (none)
```

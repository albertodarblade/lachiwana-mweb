# API Contracts: Soporte de Notebooks de Transacciones

**Feature**: 010-transactions-notebook-support
**Date**: 2026-05-08
**Role**: Frontend es consumidor; backend expone estos endpoints.

---

## Endpoints consumidos por esta feature

### PATCH /api/v1/notebooks/:id

Actualiza campos de un Notebook. Usado para persistir `type` y `transactionsViewType` desde el formulario de creación/edición.

**Request body** (campos nuevos relevantes):
```json
{
  "type": "notes | transactions",
  "transactionsViewType": "all | by-month"
}
```

**Response** (campos nuevos relevantes):
```json
{
  "_id": "string",
  "title": "string",
  "type": "notes | transactions",
  "transactionsViewType": "all | by-month",
  "transactions": [
    {
      "_id": "string",
      "description": "string",
      "amount": -63,
      "date": "2026-05-08T00:00:00.000Z",
      "tags": [],
      "attachments": []
    }
  ]
}
```

**Cache invalidation**: `['notebooks', id]`

---

### POST /api/v1/notebooks

Crea un nuevo Notebook. Ahora incluye `type` en el payload.

**Request body**:
```json
{
  "title": "string",
  "color": "string | null",
  "iconName": "string | null",
  "type": "notes | transactions"
}
```

**Response**: Notebook completo con `_id`, `type`, `transactionsViewType` (default `'all'`), `transactions: []`.

**Cache invalidation**: `['notebooks']`

---

### GET /api/v1/notebooks/:id

Obtiene un Notebook con todos sus sub-documentos incluyendo `transactions`.

**Response incluye** (campos nuevos):
```json
{
  "type": "notes | transactions",
  "transactionsViewType": "all | by-month",
  "transactions": [ ...Transaction[] ]
}
```

---

## Enum Values (confirmados desde backend)

| Campo                  | Valores válidos              | Default        |
|------------------------|------------------------------|----------------|
| `type`                 | `'notes'`, `'transactions'`  | `'notes'`      |
| `transactionsViewType` | `'all'`, `'by-month'`        | `'all'`        |

---

## Nota sobre Transactions

Las transacciones son sub-documentos embebidos del Notebook en la versión actual del backend. No existe un endpoint REST dedicado para CRUD de transacciones individuales en este alcance. La feature de creación de transacciones se implementará en una especificación futura.

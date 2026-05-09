# API Contracts: Añadir Transacción

**Feature**: 011-add-transaction
**Date**: 2026-05-09
**Role**: Frontend es consumidor del backend.

---

## POST /api/v1/notebooks/:notebookId/transactions

Crea una nueva transacción como sub-documento embebido en el Notebook.

**Request body**:
```json
{
  "value": -100,
  "date": "2026-05-09",
  "content": "Luz del mes",
  "tags": ["tag-id-abc", "tag-id-xyz"]
}
```

| Campo    | Tipo     | Requerido | Notas                                               |
|----------|----------|-----------|-----------------------------------------------------|
| `value`  | number   | Sí        | Negativo = gasto, positivo = ingreso                |
| `date`   | string   | Sí        | ISO date string `YYYY-MM-DD`                        |
| `content`| string   | No        | Descripción libre; omitir si vacío                  |
| `tags`   | string[] | No        | Array de IDs de tags del Notebook; omitir si vacío  |

**Response 201**:
```json
{
  "id": "abc123",
  "value": -100,
  "date": "2026-05-09T00:00:00.000Z",
  "content": "Luz del mes",
  "createdBy": "google-subject-id",
  "tags": ["tag-id-abc"],
  "attachments": [],
  "createdAt": "2026-05-09T12:00:00.000Z",
  "updatedAt": "2026-05-09T12:00:00.000Z"
}
```

**Cache invalidation**: `['notebook', notebookId]` — el notebook embebe las transacciones, al refrescar el notebook se actualiza la lista.

**Error cases**:
- `400 Bad Request`: payload inválido (value no numérico, date inválida)
- `401 Unauthorized`: token expirado
- `404 Not Found`: notebookId no existe

---

## Nota sobre el campo `tags`

Los IDs en `tags[]` corresponden a `notebook.tags[].id` (no `_id`). El frontend extrae el `id` de cada tag seleccionada del objeto `notebook.tags` al construir el payload.

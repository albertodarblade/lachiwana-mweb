# Data Model: Notebook Tags Management

## Entities

### Tag (embedded sub-document)

| Field  | Type   | Required | Constraints          | Notes                              |
|--------|--------|----------|----------------------|------------------------------------|
| id     | string | Yes      | Server-generated     | MongoDB ObjectId as string; `temp-${Date.now()}` used for optimistic rows |
| title  | string | Yes      | Non-empty, trimmed   | Max length not enforced frontend   |
| icon   | string | Yes      | Non-empty, trimmed   | F7 icon name identifier            |

Tags have no independent lifecycle — they only exist as items inside a Notebook's `tags` array.

### Notebook (augmented shape)

The existing Notebook response shape gains a `tags` field:

```
Notebook {
  id: string
  title: string
  description: string | null
  color: string | null
  iconName: string | null
  owner: string (googleId)
  users: string[]
  tags: Tag[]           ← NEW field (empty array when no tags)
  createdAt: Date
  updatedAt: Date
}
```

## State Transitions

### Create Flow (local state only)

```
[] ──add──> [tag1] ──add──> [tag1, tag2] ──delete tag1──> [tag2]
                                                               ↓
                                               form submit → POST /notebooks (tags: [tag2])
```
All mutations are in-memory; no API calls until the form submits.

### Edit Flow (immediate API)

```
existing: [tag1, tag2]
  ↓ add tag3         → POST /notebooks/:id/tags       → optimistic append → confirm/rollback
  ↓ edit tag1        → PATCH /notebooks/:id/tags/:id1  → optimistic replace → confirm/rollback
  ↓ delete tag2      → DELETE /notebooks/:id/tags/:id2 → optimistic remove  → confirm/rollback
```
Each action is independent and immediately reflected in the `['notebook', id]` query cache.

## Query Cache Keys

| Key                        | Shape                          | Affected by tag mutations |
|----------------------------|--------------------------------|---------------------------|
| `['notebook', notebookId]` | `{ data: Notebook }`           | Optimistically updated    |
| `['notebooks']`            | `{ data: Notebook[] }`         | Marked stale (`refetchType: 'none'`) on settle |

## Validation Rules

| Field | Rule | Error message |
|-------|------|---------------|
| title | Must be non-empty after trim | "El título de la etiqueta es obligatorio" |
| icon  | Must be selected (non-empty string) | "Selecciona un ícono para la etiqueta" |

# Data Model: Notebook Detail View

**Feature**: `003-notebook-detail` | **Date**: 2026-04-29

---

## Notebook (unchanged entity, new operations)

Same entity as feature 002. This feature adds update and delete operations.

| Field | Mutable via this feature | Notes |
|-------|--------------------------|-------|
| `id` | No | Read-only; used to resolve the detail view |
| `title` | Yes | Required; non-empty |
| `description` | Yes | Optional |
| `color` | Yes | One of 8 palette hex values or null |
| `iconName` | Yes | F7 icon name or null |
| `owner` | No | Immutable; used to determine delete permission |
| `users` | Yes | Full replacement array of member GoogleIds |
| `createdAt` | No | Display only |
| `updatedAt` | No | Display only |

---

## UpdateNotebookPayload (sent to PATCH /api/v1/notebooks/:id)

All fields optional. Only provided fields are updated server-side.

| Field | Type | Notes |
|-------|------|-------|
| `title` | `string` | If provided, must be non-empty |
| `description` | `string` | Optional |
| `color` | `string` | Hex color string or omitted |
| `iconName` | `string` | F7 icon name or omitted |
| `users` | `string[]` | Full replacement array of member GoogleIds |

---

## Optimistic Update Shape (edit)

The optimistic entry in `['notebooks']` cache replaces the existing item at the same
index with the merged payload:

```js
old.data.map(n =>
  n.id === id ? { ...n, ...payload, updatedAt: new Date().toISOString() } : n
)
```

Rollback restores the snapshot stored in `onMutate` context.

---

## DeleteConfirmDialog State (component-local)

| State | Type | Description |
|-------|------|-------------|
| `countdown` | `number` | Seconds remaining (starts at 5, ticks to 0). Button disabled while > 0. |
| `isDeleting` | `boolean` | True while delete mutation is in-flight. Shows loading on confirm button. |

Countdown implemented with `setInterval` (1s tick) started on dialog open, cleared on
dialog close or unmount.

---

## Route Params

| Param | Source | Type | Description |
|-------|--------|------|-------------|
| `id` | `f7route.params.id` | `string` | MongoDB ObjectId of the notebook. Resolved against `['notebooks']` cache. |

---

## Permission Model (client-side)

| Action | Condition |
|--------|-----------|
| Show "Editar" | Always (owner OR member) |
| Show "Eliminar" | Only when `notebook.owner === getSession().user.googleId` |
| Submit edit | Always (API enforces 403 if not owner/member) |
| Confirm delete | Only when "Eliminar" was shown (owner only) |

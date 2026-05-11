# Data Model: Edit Transaction

All entities in this feature are extensions of the existing transaction domain. No new backend entities are introduced.

---

## Transaction (existing, read/write)

The core entity being edited. Fields editable by this feature:

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `id` | `string` | Required (read-only) | Server-assigned identifier |
| `value` | `number` | Non-zero; sign encodes type | Positive = income, negative = expense |
| `date` | `string` | ISO date (`YYYY-MM-DD`) | Selected via native date picker |
| `content` | `string \| null` | Optional | Free-text description |
| `tags` | `string[]` | Optional; list of tag IDs | Empty array allowed |

**Type encoding**: toggling income ↔ expense flips `Math.abs(value)` sign. The absolute amount is always positive; the sign is set by the selected type.

---

## EditTransactionPayload (sent to API)

Only fields that have changed are included in the PATCH payload. All fields are optional.

```js
{
  value?: number,      // signed; includes type (positive = income, negative = expense)
  date?: string,       // ISO date string
  content?: string,    // may be empty string to clear description
  tags?: string[],     // full replacement list of tag IDs (not delta)
}
```

**Constraint**: `value` must not be `0`, `NaN`, or absent if included in the payload. Validation happens client-side before the patch is triggered.

---

## SaveStatus (client-side only, not persisted)

Tracks the auto-save lifecycle for the `SaveStatusIndicator`.

| State | Meaning | Trigger |
|-------|---------|---------|
| `saved` | All changes persisted | Initial state; after successful mutation |
| `editing` | User is actively typing | Any field onChange |
| `saving` | Debounce fired, mutation in flight | After 300ms idle, before response |
| `error` | Last save failed | `onError` in mutation |

Transitions: `saved` → `editing` → `saving` → `saved` or `error`. From `error`, the next edit resets to `editing`.

---

## TransactionEditSheet Props (UI contract)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `transaction` | `object` | Yes | The transaction to edit (pre-fills all fields) |
| `notebookId` | `string` | Yes | Owning notebook ID (for mutation + tag resolution) |
| `tags` | `object[]` | Yes | Full tag list for the notebook (for TagSelectionSheet) |
| `opened` | `boolean` | Yes | Controls sheet visibility |
| `onClose` | `() => void` | Yes | Called after sheet fully closes (waits for in-flight save) |

---

## TransactionCard Props (updated)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `transaction` | `object` | Yes | Transaction data to display |
| `onClick` | `() => void` | No | Called when card is tapped; opens edit sheet |

---

## Cache Key Strategy

| Query | Key | Patch scope |
|-------|-----|-------------|
| Transactions list (by month) | `['transactions', notebookId, { from, to, ... }]` | Patched via `getQueriesData` prefix match |
| Transactions list (all / filtered) | `['transactions', notebookId, { content?, tags? }]` | Same prefix match |

Optimistic update patches all cache entries with prefix `['transactions', notebookId]` to ensure the edited transaction is reflected regardless of active filters or month view.

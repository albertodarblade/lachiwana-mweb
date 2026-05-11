# API Contracts: Edit Transaction

## New API Function

### updateTransaction

**File**: `src/api/transactions.js`
**Method**: `PATCH`
**Endpoint**: `/api/v1/notebooks/:notebookId/transactions/:transactionId`

```js
export const updateTransaction = (notebookId, transactionId, payload) =>
  patch(`/api/v1/notebooks/${notebookId}/transactions/${transactionId}`, payload)
```

**Request payload** (all fields optional, only send changed fields):

```json
{
  "value": -75.50,
  "date": "2026-05-10",
  "content": "Almuerzo con equipo",
  "tags": ["tag-id-1", "tag-id-2"]
}
```

**Constraints**:
- `value` must be non-zero if included
- `tags` is a full replacement (not a delta); send the complete desired list
- `content` may be an empty string to clear the description

**Expected success response**: `200 OK` with the updated transaction object.

**Expected error responses**:
- `400` — Invalid payload (e.g., `value: 0`)
- `403` — User does not have permission to edit this transaction
- `404` — Transaction not found
- `422` — Validation error

---

## UI Contracts

### TransactionEditSheet

```jsx
<TransactionEditSheet
  transaction={editingTransaction}   // Transaction object with id, value, date, content, tags
  notebookId={id}                    // string
  tags={notebook.tags ?? []}         // Tag[] for TagSelectionSheet
  opened={isEditSheetOpen}           // boolean
  onClose={handleEditSheetClose}     // () => void — called after sheet fully closes
/>
```

**Behaviour table**:

| Event | Behaviour |
|-------|-----------|
| Sheet opens | Pre-fill all fields from `transaction` prop; set `saveStatus = 'saved'` |
| User changes amount | `saveStatus = 'editing'`; reset debounce timer; reflect value instantly |
| User changes type | Flip sign; `saveStatus = 'editing'`; reset debounce; optimistic cache update |
| User changes date | `saveStatus = 'saving'` immediately (no debounce needed); persist |
| User changes description | `saveStatus = 'editing'`; reset debounce; persist after 300ms idle |
| User changes tags | `saveStatus = 'saving'`; persist immediately after tag sheet confirms |
| Debounce fires (300ms) | `saveStatus = 'saving'`; call `mutate(payload)` |
| Mutation succeeds | `saveStatus = 'saved'` |
| Mutation fails | `saveStatus = 'error'`; rollback optimistic value; show error toast |
| Sheet swipe-to-close while saving | Block; complete save first; then `onClose()` |
| Sheet swipe-to-close while saved | `onClose()` immediately |

### TransactionCard (updated)

```jsx
<TransactionCard
  transaction={resolvedTransaction}
  onClick={() => { setEditingTransaction(t); setIsEditSheetOpen(true) }}
  data-testid={`transaction-card-${t.id}`}
/>
```

**onChange wiring in NotebookTransactionsPage**:

```jsx
const [editingTransaction, setEditingTransaction] = useState(null)
const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

function handleEditSheetClose() {
  setIsEditSheetOpen(false)
  setEditingTransaction(null)
}
```

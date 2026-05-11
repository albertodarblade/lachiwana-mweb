# Research: Edit Transaction

## 1. New vs Extended Form Component

**Decision**: Create a new `TransactionEditSheet` component rather than extending `TransactionFormSheet`.

**Rationale**: The create flow is a 2-step sequence (TagSelectionSheet → TransactionFormSheet) driven by a FAB, while the edit flow is a single-step sheet opened by tapping a card. The edit form has no submit button, uses debounced auto-save, and pre-fills all fields. Merging these into one component would require conditional props for flow mode, button visibility, and save strategy — violating single-responsibility. A dedicated edit sheet is cleaner and matches the pattern used in notes (separate `NoteEditorPage` from note creation).

**Alternatives considered**:
- Extend `TransactionFormSheet` with an `isEdit` prop — rejected; adds branching logic and complicates the create form.
- Inline editing on the transaction card — rejected; requires significant card component changes and is less discoverable on mobile.

---

## 2. Auto-Save Debounce Pattern

**Decision**: Mirror the `NoteEditorPage` auto-save implementation exactly — `debounceRef` (useRef) + 300ms delay + `saveStatus` state machine (`editing` → `saving` → `saved`/`error`).

**Rationale**: This pattern is already proven and familiar to the codebase. The note editor uses 800ms; for transaction fields (shorter inputs, less typing) 300ms matches the spec requirement and aligns with the create form's debounce. Per the clarification session, the delay matches the create transaction form (~300ms).

**Key implementation details**:
- Each field has its own debounce timer via a single shared `debounceRef`
- Any field change resets the timer
- `SaveStatusIndicator` from `src/components/notes/SaveStatusIndicator.jsx` is reused as-is
- When the sheet closes with a pending save: the save fires, "Guardando…" shows, sheet auto-closes after confirmation

**Alternatives considered**:
- Per-field debounce with separate refs — rejected; adds complexity and the single-debounce pattern already works well in note editor.
- Throttle instead of debounce — rejected; debounce is correct for "save after user stops typing".

---

## 3. Optimistic Update Strategy

**Decision**: Mirror `useUpdateNote`'s `onMutate` / `onError` / `onSettled` pattern for `useUpdateTransaction`.

**Rationale**: The transaction cache is keyed as `['transactions', notebookId, params]` where `params` varies by month/filter. Cancelling queries with prefix `['transactions', notebookId]` and patching all matching cache entries gives correct optimistic behavior regardless of active filter. Rolling back on error via `context.previous` is safe because TanStack Query provides the snapshot.

**Cache key patching approach**:
```
onMutate:
  1. cancelQueries({ queryKey: ['transactions', notebookId] })
  2. snapshot all matching cache entries (getQueriesData)
  3. patch each entry's data array in-place (setQueriesData)
  4. return { previous } for rollback

onError:
  restore all snapshots via setQueriesData

onSettled:
  invalidateQueries({ queryKey: ['transactions', notebookId] })
```

**Alternatives considered**:
- No optimistic update — rejected; Constitution VI mandates optimistic UI.
- Per-query-key optimistic update — rejected; params vary and the active cache key is not known at hook level.

---

## 4. TransactionCard onClick Wiring

**Decision**: Add an `onClick` prop to `TransactionCard` and wire it in `NotebookTransactionsPage`.

**Rationale**: `TransactionCard` is a pure display component. Adding an `onClick` prop keeps the card generic and lets the page control navigation. This is consistent with how `NoteCard` works (it receives an `onClick` via the card's own click handler, using `navigate`).

**New state in NotebookTransactionsPage**:
```
const [editingTransaction, setEditingTransaction] = useState(null)
const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
```

Card wiring:
```jsx
<TransactionCard
  key={t.id}
  transaction={{ ...t, tags: resolveTagIds(t.tags) }}
  onClick={() => { setEditingTransaction(t); setIsEditSheetOpen(true) }}
/>
```

**Alternatives considered**:
- Dedicated edit route (`/notebooks/:id/transactions/:tid/edit`) — rejected; the spec says "similar to create transaction form behavior" which is a sheet, not a page navigation.

---

## 5. API Endpoint

**Decision**: Add `updateTransaction` using the existing `patch` function from `src/api/client.js`.

**Endpoint assumption**: `PATCH /api/v1/notebooks/:notebookId/transactions/:transactionId`
**Payload**: `{ value?, date?, content?, tags? }` — partial update, only send changed fields.

**New function in `src/api/transactions.js`**:
```js
export const updateTransaction = (notebookId, transactionId, payload) =>
  patch(`/api/v1/notebooks/${notebookId}/transactions/${transactionId}`, payload)
```

`patch` is already exported from `src/api/client.js` alongside `get`, `post`, `del`.

---

## 6. SaveStatusIndicator Reuse

**Decision**: Import `SaveStatusIndicator` from `src/components/notes/SaveStatusIndicator.jsx` without modification.

**Rationale**: The component already supports all needed states (`editing`, `saving`, `saved`, `error`) with the correct Spanish labels. Placing it in the `TransactionEditSheet` header matches the spec requirement of "same component and states as the note editor".

**Placement**: In the sheet's header `<div>` as the `NavTitle` equivalent, centered between the back chevron and an empty spacer — mirroring `NoteEditorPage`'s `<NavTitle><SaveStatusIndicator /></NavTitle>` pattern but adapted for the sheet header (no F7 Navbar in a Sheet).

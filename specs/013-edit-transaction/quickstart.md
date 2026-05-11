# Quickstart: Edit Transaction

## No new packages required

All dependencies are already installed. No `pnpm add` needed.

---

## Files to create

```
src/hooks/useUpdateTransaction.js
src/components/transactions/TransactionEditSheet.jsx
src/components/transactions/TransactionEditSheet.module.css
```

## Files to update

```
src/api/transactions.js              ← add updateTransaction function
src/components/transactions/TransactionCard.jsx  ← add onClick prop
src/pages/NotebookTransactionsPage.jsx ← add editingTransaction state + TransactionEditSheet
```

---

## Key patterns to follow

### Auto-save debounce (from NoteEditorPage)

```jsx
const DEBOUNCE_MS = 300

const debounceRef = useRef(null)
const [saveStatus, setSaveStatus] = useState('saved')
const { mutate } = useUpdateTransaction(notebookId, transaction.id)

function handleAmountChange(raw) {
  setAmount(raw)                          // optimistic local state
  setSaveStatus('editing')
  clearTimeout(debounceRef.current)
  debounceRef.current = setTimeout(() => {
    const parsed = parseFloat(raw)
    if (!raw || isNaN(parsed) || parsed === 0) return
    const value = isExpense ? -Math.abs(parsed) : Math.abs(parsed)
    setSaveStatus('saving')
    mutate({ value }, {
      onSuccess: () => setSaveStatus('saved'),
      onError:   () => setSaveStatus('error'),
    })
  }, DEBOUNCE_MS)
}
```

### Optimistic update hook (from useUpdateNote)

```js
// src/hooks/useUpdateTransaction.js
export function useUpdateTransaction(notebookId, transactionId) {
  return useMutation({
    mutationFn: (payload) => updateTransaction(notebookId, transactionId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', notebookId] })
      const snapshots = queryClient.getQueriesData({ queryKey: ['transactions', notebookId] })
      queryClient.setQueriesData({ queryKey: ['transactions', notebookId] }, (old) => {
        if (!old) return old
        const data = Array.isArray(old) ? old : old?.data ?? old
        const patched = data.map((t) => t.id === transactionId ? { ...t, ...payload } : t)
        return Array.isArray(old) ? patched : { ...old, data: patched }
      })
      return { snapshots }
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, value]) => queryClient.setQueryData(key, value))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', notebookId] })
    },
  })
}
```

---

## Manual test scenarios

| Action | Expected result |
|--------|----------------|
| Tap a transaction card | Edit sheet opens with pre-filled amount, type, date, description, tags |
| Change amount | Value updates instantly; "Guardando…" appears after 300ms; "Guardado" after save |
| Toggle expense → income | Amount sign flips; change auto-saves |
| Clear amount field | No save triggered; validation prevents empty save |
| Change date | Date updates and saves immediately |
| Change description | "Guardando…" after 300ms idle; "Guardado" after save |
| Add/remove tag | Tags update immediately; saves automatically |
| Swipe sheet closed during save | Sheet shows "Guardando…", waits for save, then closes |
| Network error during save | "No guardado" indicator; field rolls back to last confirmed value; toast shown |

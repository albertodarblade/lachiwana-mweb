# Quickstart: Notebook Tags Implementation

## New Files

| File | Purpose |
|------|---------|
| `src/api/tags.js` | Tag API calls (add/update/delete for edit flow) |
| `src/hooks/useAddTag.js` | Mutation: POST tag, optimistic append |
| `src/hooks/useUpdateTag.js` | Mutation: PATCH tag, optimistic replace |
| `src/hooks/useDeleteTag.js` | Mutation: DELETE tag, optimistic remove |
| `src/components/notebooks/TagsPopup.jsx` | Reusable Sheet: create/edit/delete tags |
| `src/components/notebooks/TagChip.jsx` | Read-only chip: icon + title pill |

## Modified Files

| File | Change |
|------|--------|
| `src/hooks/useCreateNotebook.js` | Add `tags: payload.tags ?? []` to optimistic data |
| `src/pages/CreateNotebookPage.jsx` | Add `tags` state + "Manage Tags" button → `TagsPopup` (create mode); pass `tags` to `createNotebook` |
| `src/components/notebooks/EditNotebookSheet.jsx` | Add "Manage Tags" button → `TagsPopup` (edit mode) |
| `src/pages/NotebookDetailPage.jsx` | Render `<TagChip>` row when `notebook.tags` is non-empty |

## Key Patterns

### TagsPopup props

```jsx
<TagsPopup
  mode="create"               // 'create' | 'edit'
  notebookId={id}             // required when mode='edit'
  tags={tags}                 // Tag[] — controlled from parent
  onTagsChange={setTags}      // called after local change (create) or successful API call (edit)
  opened={popupOpen}
  onClose={() => setPopupOpen(false)}
/>
```

### Optimistic add (useAddTag)

```js
onMutate: async ({ notebookId, title, icon }) => {
  await queryClient.cancelQueries({ queryKey: ['notebook', notebookId] })
  const previous = queryClient.getQueryData(['notebook', notebookId])
  const optimisticTag = { id: `temp-${Date.now()}`, title, icon }
  queryClient.setQueryData(['notebook', notebookId], (old) => ({
    ...old,
    data: { ...old.data, tags: [...(old.data.tags ?? []), optimisticTag] },
  }))
  return { previous }
}
```

### TagChip

```jsx
function TagChip({ tag }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--f7-theme-color-light)', borderRadius: 20,
      padding: '4px 10px', fontSize: 13 }}>
      <i className="f7-icons" style={{ fontSize: 14 }}>{tag.icon}</i>
      <span>{tag.title}</span>
    </div>
  )
}
```

## Cache Invalidation Matrix

| Mutation | Optimistic target | onSettled invalidation |
|----------|------------------|------------------------|
| useAddTag | `['notebook', id]` append | invalidate `['notebook', id]` + `['notebooks']` (refetchType: none) |
| useUpdateTag | `['notebook', id]` replace | invalidate `['notebook', id]` + `['notebooks']` (refetchType: none) |
| useDeleteTag | `['notebook', id]` filter | invalidate `['notebook', id]` + `['notebooks']` (refetchType: none) |

## Tag Form Inline Layout (within TagsPopup)

```
┌────────────────────────────────────┐
│ ← Cerrar     Etiquetas             │  ← Navbar
├────────────────────────────────────┤
│ 🏷 Urgente           [✏] [🗑]      │  ← tag list item
│ 💼 Trabajo           [✏] [🗑]      │
├────────────────────────────────────┤
│ ┌ Título: [____________] ┐         │  ← inline add/edit form
│ │ Ícono:  [book        ] │         │    (shown when user taps ✏ or + Agregar)
│ └────────── [Confirmar] ─┘         │
├────────────────────────────────────┤
│         + Agregar etiqueta         │  ← hidden when inline form is open
└────────────────────────────────────┘
```

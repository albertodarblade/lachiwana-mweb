# Research: Notebook Tags Management

## Decision 1: Backend Readiness Gap

**Decision**: Plan frontend as if dedicated tag endpoints exist; document backend requirements for coordination.
**Rationale**: The backend schema (`tag.schema.ts`) already defines `Tag { title, icon }` embedded in `Notebook`, but no tag endpoints exist in the controller and the response DTO omits `tags`. The frontend plan is written against the expected API surface; backend must be updated separately before the edit-flow mutations work end-to-end.
**Required backend changes (frontend-blocking)**:
- `NotebookResponseDto` must include `tags: Array<{ id: string, title: string, icon: string }>`
- `CreateNotebookDto` must accept optional `tags?: Array<{ title: string, icon: string }>`
- New endpoints: `POST /notebooks/:id/tags`, `PATCH /notebooks/:id/tags/:tagId`, `DELETE /notebooks/:id/tags/:tagId`
**Alternatives considered**: Adding tags through the existing `PATCH /notebooks/:id` payload for both create and edit — rejected per clarification (Option C selected).

---

## Decision 2: TagsPopup — Sheet vs Popup

**Decision**: Use Framework7 `Sheet` (bottom sheet) for the Tags Popup, consistent with `CreateNotePopup` and `EditNotebookSheet` patterns already in the codebase.
**Rationale**: Sheet slides up from the bottom, which is the dominant interaction pattern in this app. It feels native on iOS/Android and meets the Constitution's mobile-first requirement. All existing form overlays in the app use Sheet.
**Alternatives considered**: F7 `Popup` (full-screen modal) — rejected because Sheet is less disruptive and already established as the pattern.

---

## Decision 3: Tag Form UX — Inline vs Sub-sheet

**Decision**: Show the add/edit form as an inline expandable section at the bottom of the tag list, not as a nested popup.
**Rationale**: A nested Sheet-within-Sheet is problematic in Framework7 (z-index, swipe conflicts). An inline form avoids nesting entirely, keeps the interaction contained in one surface, and matches the Constitution's minimalist layout principle.
**Alternatives considered**: Sub-sheet for add/edit — rejected due to F7 Sheet nesting issues.

---

## Decision 4: Optimistic UI for Embedded Array Mutations

**Decision**: All three tag mutations (add, update, delete) patch the `['notebook', notebookId]` and mark `['notebooks']` stale (`refetchType: 'none'`) on settle.
**Rationale**: Follows the exact pattern established by `useUpdateNote` and `useDeleteAttachment`. The `['notebook', id]` detail query is the source of truth for the EditNotebookSheet; the list query only needs to stay consistent, not re-fetch immediately.
**Cache key structure**:
- Optimistic add: append `{ id: 'temp-${Date.now()}', title, icon }` to `notebook.data.tags`
- Optimistic update: replace matching tag by id in the array
- Optimistic delete: filter out matching tag by id from the array
- Rollback: restore `previous` captured in `onMutate` for both keys

---

## Decision 5: TagChip Custom Component

**Decision**: Build `TagChip` as a small custom component (no third-party library).
**Rationale**: Constitution IV prohibits importing third-party component substitutes. F7 has no built-in chip/badge component that fits the tag display pattern. The chip is simple enough (icon + text, pill shape) to build in under 20 lines.

---

## Decision 6: Icon Picker Reuse

**Decision**: Reuse the existing `IconSelector` component inside the tag add/edit form.
**Rationale**: `IconSelector` is already a standalone Sheet-based icon picker that accepts `value` and `onChange` props. It renders inline as a `ListItem` and opens its own Sheet for icon selection. No changes needed to the component.
**Note**: Because `IconSelector` opens its own Sheet, the Tags Popup must be designed so `IconSelector` can open on top of it. In practice, F7 allows stacking Sheets from Sheet context as long as the inner Sheet renders at the root level (already how `IconSelector` works).

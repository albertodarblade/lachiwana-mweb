# Quickstart: Pin Notebooks

**Branch**: `014-pin-notebooks` | **Date**: 2026-05-25

## What's being built

A client-side pin feature for the notebooks list. Four files change; two are new.

## Files to create

| File | Purpose |
|------|---------|
| `src/stores/pinStore.js` | localStorage CRUD for pin state |
| `src/hooks/usePinnedNotebooks.js` | React hook that wraps pinStore with local state |

## Files to modify

| File | Change |
|------|--------|
| `src/components/notebooks/NotebookCard.jsx` | Add pin icon button; accept `onPin`/`isPinned` props |
| `src/components/notebooks/NotebookCard.module.css` | Style pin button (positioned overlay on card) |
| `src/pages/NotebooksPage.jsx` | Use `usePinnedNotebooks`; split/sort list; render section labels |
| `src/pages/NotebooksPage.module.css` | Style "Pinned" / "All" section labels |

## Key patterns to follow

- **Store pattern**: Mirror `src/stores/settingsStore.js` — exported functions, try/catch around localStorage, silent fallback on error.
- **Hook pattern**: `useState` seeded from store; actions call store then `setState`.
- **User ID**: `getSession()?.user?.googleId ?? ''` (from `src/stores/authStore.js`).
- **Icons**: `import { Pin } from 'lucide-react'` — single icon, CSS-driven active/inactive state.
- **CSS Modules**: All styles in `.module.css`; no inline `style={{}}` for static values.
- **data-testid**: Pin button → `notebook-card-pin-{notebookId}`; section labels → `notebooks-section-pinned`, `notebooks-section-all`.

## Dev workflow

```bash
pnpm dev          # start dev server
```

Navigate to the notebooks list, pin a notebook, reload — verify pin persists. Open DevTools → Application → Local Storage to inspect `lachiwana_pins_{googleId}`.

## Acceptance checklist (manual)

- [ ] Pin icon button visible on every notebook card
- [ ] Tapping pin moves card to "Pinned" section immediately (no reload)
- [ ] "Pinned" section label appears; "All" label appears below
- [ ] Most recently pinned notebook appears first in "Pinned" section
- [ ] Tapping pin again unpins — card moves back to "All" section
- [ ] Pin state survives page reload
- [ ] Logout and login again — pin state is restored
- [ ] Two different user IDs have independent pin state (check localStorage keys)
- [ ] Deleting a pinned notebook → no crash; pin entry silently ignored

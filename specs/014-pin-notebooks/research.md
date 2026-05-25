# Research: Pin Notebooks

**Branch**: `014-pin-notebooks` | **Date**: 2026-05-25

## Decision 1: localStorage key structure for pin data

**Decision**: Use a flat key per user — `lachiwana_pins_{googleId}` — storing a JSON array of `{ notebookId, pinnedDate }` objects.

**Rationale**: Matches the existing `lachiwana_prefs_{userId}` pattern in `settingsStore.js`. Simple to read, write, and parse. The entire pin list for a user is a single JSON blob, which is appropriate given the small data size (< 100 notebooks per user).

**Alternatives considered**:
- One key per notebook (`lachiwana_pins_{userId}_{notebookId}`): more granular but requires iterating all localStorage keys to reconstruct the list, which is fragile and slow.
- Single global key with nested map by userId: possible, but adds complexity when users share a device — each login would read/write the full multi-user object.

## Decision 2: Pin icon — `Pin` vs. `PinOff` from lucide-react

**Decision**: Use `Pin` (filled) for the pinned state and `Pin` (outline / lower opacity) for the unpinned state, or use `PinOff` for unpinned. Research confirms both `Pin` and `PinOff` are available in lucide-react.

**Rationale**: `Pin` (active/filled appearance) clearly signals "this is pinned." For unpinned cards, a muted `Pin` icon (via CSS opacity) communicates the available action without visual noise. Using `PinOff` as the unpinned icon is an alternative but may confuse users who interpret it as "pinning is disabled."

**Alternatives considered**:
- `Bookmark` icon: semantically close but implies "saved for later" rather than "fixed at top."
- `Star` icon: common for favourites, but the spec explicitly uses "pin" language.

**Final choice**: `Pin` icon from lucide-react for both states — filled/colored when pinned, muted/outline-opacity when unpinned. This is a single icon with CSS-driven state distinction.

## Decision 3: Reactive pin state — custom hook approach

**Decision**: Implement `usePinnedNotebooks(userId)` as a React hook using `useState` seeded from `pinStore.getpins(userId)`. Pin/unpin actions call `pinStore` functions and then update local state, triggering a re-render.

**Rationale**: Pin state is not server state (so no `useQuery`). It is UI state that needs to cause re-renders. A custom hook isolates the read/write logic from `NotebooksPage`, keeping the page component clean. This follows the same pattern as how `settingsStore` functions are called from `SettingsPage` — direct store calls wrapped in local state.

**Alternatives considered**:
- React Context / global state: overkill for a feature that only affects `NotebooksPage`. No other page needs to read pin state.
- Zustand or other state library: no new dependencies allowed.
- Reading localStorage on every render: would work but bypasses React's render cycle — state changes wouldn't cause re-renders without `useState`.

## Decision 4: Sorting strategy in NotebooksPage

**Decision**: After fetching notebooks via `useQuery`, apply a two-pass sort in the component:
1. Split into `pinned` and `unpinned` arrays using the pin store.
2. Sort `pinned` by `pinnedDate` descending.
3. Render `pinned` under a "Pinned" section label, then `unpinned` under an "All" label (the "All" label is only rendered when `pinned.length > 0`).

**Rationale**: The existing sort in `NotebooksPage` (`updatedAt` descending) applies to unpinned notebooks — it's preserved as-is for the unpinned section. Pinned notebooks get their own sort by `pinnedDate`. This two-array approach is readable and maps directly to the two rendered sections.

**Alternatives considered**:
- Single sorted array with a `isPinned` flag and a sentinel element as section divider: works but is more complex to render and harder to reason about.
- Sorting on the server: out of scope — pin state is client-only.

## Decision 5: Section label component

**Decision**: Render section labels as plain `<div>` elements styled with CSS Modules — no Framework7 `ListItem` group title, since the notebooks list is not a `List` component.

**Rationale**: `NotebooksPage` renders notebooks as a custom CSS grid/flex layout (not an F7 `<List>`). Adding F7 group titles would require restructuring the page into an F7 List, which is a larger change. A simple `<div className={styles.sectionLabel}>` is minimal, compliant (CSS Modules), and sufficient.

**Alternatives considered**:
- F7 `<Block>` with title: adds F7 padding/margins that would misalign with the card grid.
- Inline text with `<hr>` divider: less visually consistent with the existing design language.

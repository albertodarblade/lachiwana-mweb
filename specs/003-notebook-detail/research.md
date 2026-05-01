# Research: Notebook Detail View

**Feature**: `003-notebook-detail` | **Date**: 2026-04-29

---

## Decision: Notebook Data Access (No Single-Item Endpoint)

**Decision**: `useNotebook(id)` uses `useQuery` with the `['notebooks']` query key and
a `select` function to extract the matching notebook: `select: (data) => data?.data?.find(n => n.id === id)`.

**Rationale**: No `GET /api/v1/notebooks/:id` endpoint exists. The list is already
cached from the home page. Using `select` is zero-cost — no extra network request — and
the query reactively updates when the list cache changes (e.g., after an edit mutation).

**Edge case**: If the user navigates directly to `/notebooks/:id` (deep link or F5) before
the list is loaded, `useNotebooks()` fires a fresh fetch. The detail page shows a loading
state until the list resolves, then finds the matching notebook. If the ID is not found
in the fetched list, an error state with a "Volver al inicio" link is shown.

**Alternatives considered**: Adding a `GET /api/v1/notebooks/:id` backend endpoint —
rejected (backend is out of scope and the cached list is sufficient for this use case).

---

## Decision: Notebook ID from Route

**Decision**: The route is registered as `{ path: '/notebooks/:id', component: ProtectedDetail }`.
F7 passes `f7route.params.id` to the route component. This prop is forwarded to
`NotebookDetailPage` via the `ProtectedDetail` wrapper's `{...props}` spread (same
pattern as feature 002's ProtectedHome/ProtectedCreate).

**Rationale**: F7 parses `:id` from the route path and exposes it in `f7route.params`.
No query string parsing needed.

---

## Decision: Toolbar Color Tinting

**Decision**: The `Navbar` element receives an inline `style={{ backgroundColor: notebook.color ?? 'var(--f7-theme-color)' }}`. All text and icons inside the Navbar use `color: '#fff'` via an inline style wrapper or className. The toolbar layout from left to right: back button (F7 NavLeft backLink), a custom NavTitle containing `<i className="f7-icons">` + title text in a flex row, and an options icon button (NavRight).

**Rationale**: F7's Navbar accepts inline styles. Using the notebook color directly gives the most visual impact with minimum code. White text ensures sufficient contrast against any of the 8 palette colors (all are saturated mid-to-dark tones).

**Note on navbar icon text color**: F7's default Navbar back-button arrow inherits color from the navbar's text color. Setting `--f7-navbar-link-color: #fff` via an inline CSS variable override on the navbar element achieves the white arrow.

---

## Decision: Options Menu

**Decision**: F7 `Actions` component (native-style action sheet from the bottom).
Triggered by a NavRight icon button (`ellipsis_vertical` F7 icon).
Actions:
- "Editar" — always shown (owner and member)
- "Eliminar" — shown only when `notebook.owner === currentUserId`
- "Cancelar" — always shown

**Rationale**: F7 `Actions` is the idiomatic mobile pattern for context menus. It feels
native on iOS and Android.

---

## Decision: Edit Sheet

**Decision**: F7 `Sheet` (bottom drawer) opened via React state, containing the same
form fields as `CreateNotebookPage`: `ListInput` for title and description, inline color
swatches, `IconSelector`, and `MemberPicker`. All fields are pre-populated from the
current notebook values. Submit calls `useUpdateNotebook().mutate(...)`.

**Rationale**: A Sheet keeps the user in context (detail page visible in the background).
Reusing the existing form components (ColorPicker swatches, IconSelector, MemberPicker)
ensures visual consistency and avoids duplicating implementation.

**Optimistic update pattern**:
- `onMutate`: cancel `['notebooks']` queries → snapshot → update the matching item in `data` array with new values.
- `onError`: restore snapshot.
- `onSettled`: invalidate `['notebooks']`.

---

## Decision: Delete Confirmation Dialog with Countdown

**Decision**: F7 `Dialog` (custom, not the built-in `f7.dialog.confirm`) to allow full
control over the countdown button state. The dialog contains:
- Message: "¿Eliminar «{title}»? Esta acción no se puede deshacer."
- A countdown display: "Espera {n}s..." that ticks down from 5 to 0 using `setInterval`.
- "Cancelar" button: always enabled, closes the dialog.
- "Eliminar" button: disabled while countdown > 0; enabled at 0.

On confirm: call `deleteNotebook(id)` mutation, show loading state on the button, wait
for server response. On success: invalidate cache, navigate back. On error: close dialog
and show toast.

**Rationale**: The countdown is a deliberate UX friction mechanism to prevent accidental
deletion. Using a custom Dialog (vs `f7.dialog.confirm`) allows React-controlled state
for the countdown and button disabled state. F7 custom Dialog fits within Principle III.

**Why non-optimistic**: The spec explicitly requires waiting for server confirmation.
Removing an item from the list before the server confirms would require a rollback if the
delete fails — disorienting for a destructive action. The 5-second countdown already
signals the intentional slowness of this flow.

---

## Decision: Navigation After Delete

**Decision**: Use `f7router.back()` (from the `f7router` prop on `NotebookDetailPage`)
after successful deletion. `back()` pops the navigation stack and returns to the notebooks
list without a full page reload, preserving the query cache state.

**Rationale**: `f7router.back()` is simpler and more reliable than `f7router.navigate('/')`
for this case — we always want to go "back" from the detail page to the list. The
`pageComponentLoader` issue we encountered earlier was with `navigate()` specifically;
`back()` uses a different internal code path in F7 and should work correctly.

---

## Decision: `patch` and `del` HTTP Helpers in client.js

**Decision**: Add two new helpers to `src/api/client.js`:
- `patch(path, body)`: PATCH request with JSON body, same auth/401 handling as `post`.
- `del(path)`: DELETE request with no body, same auth/401 handling as `get`.

**Rationale**: Mirrors the existing `get` and `post` helpers. Keeps the HTTP layer
consistent and avoids code duplication in `notebooks.js`.

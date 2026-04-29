# Research: Notebooks UI

**Feature**: `002-notebooks-ui` | **Date**: 2026-04-28

---

## Decision: Home Page Replacement

**Decision**: Delete `src/pages/HomePage.jsx` and create `src/pages/NotebooksPage.jsx`
as the new `/` route. The existing health-check content is removed.

**Rationale**: The health check was a placeholder for the initial scaffold. The spec
explicitly states the home page should show notebooks. Keeping the health block would
clutter the minimalist layout (Principle II).

**Alternatives considered**: Keeping health as a sub-section — rejected; violates
single-dominant-action principle.

---

## Decision: Toolbar User Display

**Decision**: The `Navbar` right slot renders the authenticated user's avatar as a
small circular `<img>` (40×40 px) loaded from `getSession().user.picture`. If the
user has no picture, fall back to the F7 `person_circle` icon. No name text in the
navbar — avatar alone keeps the toolbar minimal on mobile.

**Rationale**: Screen width on mobile is limited. Avatar is sufficient for identity;
name text would crowd the navbar with the app title on the left.

---

## Decision: "Crear Cuaderno" Placement

**Decision**: Use an F7 `Fab` (Floating Action Button) positioned `right-bottom` with
the label "Crear Cuaderno". On tap, navigate to `/notebooks/create`.

**Rationale**: FAB is the universally understood mobile pattern for a primary creation
action. It remains accessible at all scroll positions and doesn't compete with the list.

---

## Decision: Notebook Card Design

**Decision**: Each notebook is rendered as a custom `NotebookCard` component built on
an F7 `Card`. Displays: a left-side color strip (the `color` value as background), a
centered F7 icon (from `iconName` mapped to the F7 icon set), and the notebook `title`
below the icon. If no color is set, the strip uses the F7 theme default. If no icon is
set, a default `book` icon is shown.

**Alternatives considered**: F7 `ListItem` with media — rejected; card layout gives
better visual separation and a larger tap target on mobile.

---

## Decision: Color Palette

**Decision**: 8 predefined colors from F7's built-in CSS variable palette:
Red (`#FF3B30`), Orange (`#FF9500`), Yellow (`#FFCC00`), Green (`#34C759`),
Teal (`#5AC8FA`), Blue (`#007AFF`), Purple (`#AF52DE`), Pink (`#FF2D55`).
Rendered as a horizontal scrollable row of color swatches in the creation form.
The selected color is stored as the hex string.

**Rationale**: F7 color tokens are already available; using them ensures theme
consistency without custom CSS variables. 8 options cover all practical needs.

---

## Decision: Icon Selector

**Decision**: A horizontal scrollable grid of 12 commonly used F7 Icon names shown
as tappable icon buttons: `book`, `pencil`, `folder_fill`, `star_fill`, `heart_fill`,
`flag_fill`, `archivebox_fill`, `lightbulb_fill`, `briefcase_fill`, `graduationcap_fill`,
`chart_bar_fill`, `doc_fill`. The selected icon name is stored as the string value
for `iconName`. Rendered using F7's `<i className="f7-icons">` pattern.

**Rationale**: A curated subset avoids overwhelming the user while covering all
practical notebook categories. Icons are rendered via F7 Icons (already installed).

---

## Decision: MemberPicker Component

**Decision**: A custom component built on F7 `Sheet` (bottom drawer). Contains:
1. An F7 `Searchbar` at the top that filters the users list by `name` or `email`
   on every keystroke.
2. A scrollable `List` of all registered users (excluding the current owner), each
   rendered as a `ListItem` with checkbox, avatar, name, and email.
3. A "Listo" confirm button at the bottom that closes the sheet and commits the
   selected users.

The component is fully controlled: selected state is maintained in the parent form.
Users are sourced from the existing `useUsers()` hook (no new API call needed).

**Rationale**: F7 `Sheet` provides a native-feeling bottom drawer for the picker.
`Searchbar` is a built-in F7 component. No third-party select library needed (Principle IV).

**Alternatives considered**: F7 `Popup` — rejected; Sheet (bottom drawer) is more
natural for a selection task on mobile.

---

## Decision: Optimistic UI for Notebook Creation

**Decision**: `useCreateNotebook` implements the standard TanStack Query optimistic
update pattern:
- `onMutate`: cancel in-flight notebook queries, snapshot current data, inject an
  optimistic entry (with `id: \`temp-${Date.now()}\``) at the front of the list.
- `onError`: restore the snapshot from context.
- `onSettled`: always invalidate `['notebooks']` so the list syncs with server truth
  (replaces the temp entry with the real one).

**Rationale**: Mandated by Principle VI. The temp ID approach is necessary because the
server assigns the real `id` — we cannot know it before the response.

---

## Decision: Form Navigation on Create

**Decision**: `CreateNotebookPage` uses F7's `f7router` prop for navigation:
- Cancel / back button: `f7router.back()` — returns without creating.
- Successful submit: navigate to `/` with `{ reloadCurrent: false }` after the
  mutation fires (optimistic entry is already visible so navigation feels instant).

**Rationale**: Unlike auth flows (which use `window.location.replace`), in-app
navigation between SPA pages uses F7's router directly, which avoids full page reloads
and preserves the query cache.

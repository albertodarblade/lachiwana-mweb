# Implementation Plan: User Settings Page

**Branch**: `005-user-settings` | **Date**: 2026-05-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-user-settings/spec.md`

## Summary

Add a `/settings` page accessible by tapping the user's avatar on the notebooks list page.
The page displays the user's full name, email, and profile photo (from the existing auth
session), provides a logout action (with confirm dialog), and lets the user pick their
preferred UI theme (iOS or Material Design) and color scheme (light or dark). Both
preferences are persisted in `localStorage` keyed by `userId` and applied synchronously
before the first React render so there is never a flash of incorrect styling.

## Technical Context

**Language/Version**: JavaScript (ES2022) / React 19
**Primary Dependencies**: Framework7 9.x (UI + theme/dark-mode CSS classes),
  TanStack Query v5 (not used for settings — no server state)
**Storage**: `localStorage` — synchronous read/write; key `lachiwana_prefs_${userId}`;
  value `{ theme: 'ios' | 'md', colorScheme: 'light' | 'dark' }`
**Testing**: Manual (no unit tests — Principle IX)
**Target Platform**: Mobile browsers (iOS Safari, Android Chrome)
**Project Type**: Mobile web app (SPA)
**Performance Goals**: Preferences applied with zero perceptible flash on load;
  theme/color-scheme switch visible within one animation frame (≤16ms)
**Constraints**: No server call for profile data (session-sourced); no page reload on
  theme change; CSS class manipulation is the only mechanism for F7 theming
**Scale/Scope**: 1 new page, 1 new store, 1 new component; 3 file updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Single-column settings page optimised for mobile; no desktop
      layout needed.
- [x] **II. Minimalist Layout** — Three distinct sections (profile, preferences, logout);
      one action is dominant on each section.
- [x] **III. Framework7** — Navbar, Page, List, ListItem, Toggle, Sheet/Dialog — all
      native F7 primitives.
- [x] **IV. Custom Components** — `UserProfileHeader` is a custom component matching F7
      visual language.
- [x] **V. TanStack Query** — No server state in this feature; profile data comes from
      `getSession()` (synchronous localStorage). Principle V is not violated — there is
      no remote data to route through hooks.
- [x] **VI. Optimistic UI** — No remote mutations in this feature; preference writes are
      synchronous and never fail in a way requiring rollback.
- [x] **VII. Cache Integrity** — No TanStack Query keys are written by this feature; the
      `clearSession()` call on logout removes the auth token and `queryClient.clear()`
      purges all cached remote data.
- [x] **VIII. Clean Code** — Single-responsibility: `settingsStore` owns persistence +
      CSS application; `SettingsPage` owns layout only.
- [x] **IX. No Unit Tests** — No test files planned.
- [x] **X. Maintainability** — New `src/stores/settingsStore.js` follows the existing
      `authStore.js` pattern; `SettingsPage` sits alongside other pages in `src/pages/`.

## Project Structure

### Documentation (this feature)

```text
specs/005-user-settings/
├── plan.md           # This file
├── research.md       # Phase 0 output
├── data-model.md     # Phase 1 output
├── quickstart.md     # Phase 1 output
└── tasks.md          # /speckit-tasks output
```

### Source Code

```text
src/
├── stores/
│   ├── authStore.js          ← EXISTING (unchanged)
│   └── settingsStore.js      ← NEW: read/write/apply UserPreferences
├── pages/
│   ├── NotebooksPage.jsx     ← UPDATE: make avatar tappable → /settings
│   └── SettingsPage.jsx      ← NEW: profile, theme, dark-mode, logout
├── components/
│   └── settings/
│       └── UserProfileHeader.jsx  ← NEW: photo + name + email display block
└── App.jsx                   ← UPDATE: dynamic f7params.theme, add /settings route
src/main.jsx                  ← UPDATE: apply prefs before React.render() (no-flash)
```

**Structure Decision**: `settingsStore.js` mirrors `authStore.js` — a plain JS module
with named exports. No React context or hooks; callers read synchronously. This keeps
theme application usable both inside and outside the React tree (e.g., in `main.jsx`
before any component mounts).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Direct DOM class mutation (`document.documentElement.classList`) for theme/dark-mode | F7 theming is entirely CSS-class-driven (`.ios`, `.md`, `theme-dark` on `<html>`). Mutating the class list is the canonical F7 runtime theming mechanism and satisfies FR-007 (immediate effect) and FR-009 (no flash). | React state / context was rejected: updating a React state variable would cause a re-render after paint, producing a visible flash. DOM mutation before paint is the only way to satisfy the no-flash requirement. |

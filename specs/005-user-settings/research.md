# Research: User Settings Page

**Feature**: `005-user-settings` | **Date**: 2026-05-02

---

## Decision: Framework7 Theme Switching at Runtime

**Decision**: Toggle CSS classes on `document.documentElement` directly.

- Remove `ios` class and add `md` (or vice versa) for theme switching.
- Toggle `theme-dark` class for color scheme switching.
- Both changes are synchronous and take effect in the same paint cycle.

**Rationale**: Framework7's entire theming system is CSS-class-based — all component
styles are scoped to `html.ios` or `html.md` selectors, and dark mode is scoped to
`html.theme-dark`. Swapping these classes at runtime gives immediate visual update
without re-mounting the F7 app or triggering a page reload.

**Alternatives considered**:

- `f7.params.theme` mutation: F7 exposes `params.theme` but changing it does not
  retroactively update mounted components — the class approach is required regardless.
- Page reload: Reliable but violates FR-007 ("take effect immediately without a reload").
- CSS custom properties override layer: Adds complexity with no advantage over class toggling.

---

## Decision: No-Flash Preference Initialization

**Decision**: In `src/main.jsx`, before `ReactDOM.createRoot().render()`, call
`applyPrefs(getPrefs(userId))` from `settingsStore`. Since `localStorage` reads are
synchronous, preferences are applied to `document.documentElement` before React mounts
any component, preventing any flash of incorrect styling.

**Rationale**: CSS class changes made before the first React render are processed in the
same browser paint cycle as the initial render — there is no intermediate frame where
the wrong classes are visible.

**Implementation note**: `getSession()` is called first to get `userId`. If no session
exists (unauthenticated), preferences are not applied (defaults are already correct from
the initial `html` class state set by F7 during library initialization).

---

## Decision: f7params.theme Is Driven by Stored Preference

**Decision**: In `App.jsx`, `f7params.theme` is set by reading `settingsStore` at
module evaluation time (before the component renders). This ensures F7 initializes with
the correct theme, which avoids a class conflict between what F7 sets at startup and what
the `main.jsx` pre-render step applied.

**Rationale**: If `f7params.theme: 'ios'` but the user prefers MD, F7 would overwrite
the `md` class with `ios` at initialization, undoing the pre-render step. Reading from
`settingsStore` at init time aligns both.

---

## Decision: Preference Storage Key Schema

**Decision**: `localStorage` key: `lachiwana_prefs_${userId}` where `userId` is
`session.user.googleId`.

**Value shape**:
```json
{ "theme": "ios" | "md", "colorScheme": "light" | "dark" }
```

**Defaults** (when no stored prefs found): `{ theme: "ios", colorScheme: "light" }`

**Rationale**: Keying by `googleId` (stable, unique Google subject identifier) ensures
independent preferences for each user on a shared device. The key is intentionally
prefixed with `lachiwana_` for namespace isolation from other localStorage entries.

---

## Decision: Profile Data Source

**Decision**: All user profile data (name, email, picture) is read from `getSession().user`.
No network request is made on the settings page.

**Available fields from session** (confirmed from `UserResponseDto`):
- `user.name` — display name (always present)
- `user.email` — email address (always present)
- `user.picture` — Google profile photo URL (nullable)
- `user.googleId` — stable unique identifier (used as preferences key)

**Rationale**: The session is already stored in `localStorage` from the auth callback.
Re-fetching from the server would add latency and a loading state for data the client
already has. The spec explicitly states "no additional network request is required."

---

## Decision: Logout Flow

**Decision**: Tapping "Cerrar sesión" opens an F7 `Dialog.confirm()` or a custom F7
`Sheet`. On confirm:
1. `clearSession()` — removes the auth token from localStorage
2. `queryClient.clear()` — purges all cached remote data
3. `window.location.replace('/login')` — hard navigation to login (avoids back-button
   return to protected pages)

**Rationale**: Using `window.location.replace` (same pattern as notebook deletion)
avoids the React/F7 router keeping stale pages in the history stack after logout. It
also resets the entire app state cleanly.

---

## Decision: settingsStore Architecture

**Decision**: Plain ES module with named exports (no React context, no hooks).

```js
// src/stores/settingsStore.js
export function getPrefs(userId) { ... }   // synchronous read
export function setPrefs(userId, prefs) { ... }  // synchronous write
export function applyPrefs(prefs) { ... }  // DOM class mutation
```

**Rationale**: Mirrors the existing `authStore.js` pattern. Being framework-agnostic
allows it to be called from `main.jsx` (outside React) and from `SettingsPage` (inside
React) without creating a React context dependency. Since writes are synchronous and
always succeed, no async handling or error state is needed.

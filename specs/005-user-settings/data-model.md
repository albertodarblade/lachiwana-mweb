# Data Model: User Settings Page

**Feature**: `005-user-settings` | **Date**: 2026-05-02

---

## UserPreferences (client-side only, persisted in localStorage)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `theme` | `'ios' \| 'md'` | `'ios'` | Controls F7 visual theme; applied as CSS class on `<html>` |
| `colorScheme` | `'light' \| 'dark'` | `'light'` | Controls color mode; `'dark'` adds `theme-dark` class on `<html>` |

**Storage key**: `lachiwana_prefs_${userId}` (where `userId = session.user.googleId`)

**Applied CSS classes**:

| Preference | CSS class on `<html>` |
|------------|----------------------|
| `theme: 'ios'` | `ios` (remove `md`) |
| `theme: 'md'` | `md` (remove `ios`) |
| `colorScheme: 'dark'` | `theme-dark` |
| `colorScheme: 'light'` | _(remove `theme-dark`)_ |

---

## UserProfile (read-only, sourced from session)

Consumed by `SettingsPage` and `UserProfileHeader`. Never written by this feature.

| Field | Type | Source |
|-------|------|--------|
| `name` | `string` | `getSession().user.name` |
| `email` | `string` | `getSession().user.email` |
| `picture` | `string \| null` | `getSession().user.picture` |
| `googleId` | `string` | `getSession().user.googleId` (used as prefs key) |

---

## settingsStore API

```js
getPrefs(userId: string): UserPreferences
  // Returns stored prefs or { theme: 'ios', colorScheme: 'light' } if not found

setPrefs(userId: string, prefs: UserPreferences): void
  // Writes prefs to localStorage and calls applyPrefs(prefs)

applyPrefs(prefs: UserPreferences): void
  // Mutates document.documentElement.classList to match prefs
  // Safe to call before React mounts (used in main.jsx)
```

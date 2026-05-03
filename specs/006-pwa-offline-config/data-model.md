# Data Model: PWA Offline Configuration

**Feature**: 006-pwa-offline-config  
**Date**: 2026-05-02

This feature introduces no new server-side entities. All data models are client-side only.

---

## Client-Side Models

### NetworkStatus

Managed by `src/stores/networkStore.js`.

| Field | Type | Description |
|-------|------|-------------|
| `isOnline` | `boolean` | Reflects `navigator.onLine`; updated on `online`/`offline` window events |

**Lifecycle**:
- Initialised from `navigator.onLine` when the store module is first imported.
- Transitions: `true → false` on `offline` event; `false → true` on `online` event.
- Subscribers are notified synchronously on each transition.

---

### UpdateState

Managed inside `src/main.jsx` as a module-level reference (not a store, because it only needs to drive the `UpdateBanner` component via a callback).

| Field | Type | Description |
|-------|------|-------------|
| `waitingWorker` | `ServiceWorker \| null` | Reference to the installed but waiting service worker; `null` if no update pending |

**Lifecycle**:
- Set to the waiting `ServiceWorker` instance when `updatefound` fires and the new worker reaches `installed` state.
- Cleared to `null` after the user triggers a reload.

---

### PersistedQueryCache

Managed by `@tanstack/react-query-persist-client`. Stored in `localStorage` under the key `LACHIWANA_QUERY_CACHE`.

| Field | Type | Description |
|-------|------|-------------|
| `clientState` | `DehydratedState` | Serialised snapshot of all active TanStack Query cache entries |
| `timestamp` | `number` | Unix ms timestamp of last persist; used to enforce `maxAge` |

**Lifecycle**:
- Written to localStorage on every query cache mutation (debounced by the persister).
- Restored from localStorage on app boot before the first render.
- Entries older than `maxAge` (24 hours) are discarded on restore.
- Cleared entirely on `clearSession()` (logout) to prevent stale cross-user data.

---

## Service Worker Cache

Not a JS data model — managed natively by the Cache API.

| Cache Name | Contents | Strategy |
|------------|----------|----------|
| `lachiwana-static-v1` | App shell: HTML, JS bundles, CSS, icons, manifest, offline.html | Cache-first |

**Versioning**: The cache name string includes a version suffix (`-v1`). Bumping it triggers the `activate` phase to delete the old cache bucket.

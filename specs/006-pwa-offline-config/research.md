# Research: PWA Offline Configuration

**Feature**: 006-pwa-offline-config  
**Date**: 2026-05-02

## Decision 1: User Data Caching Strategy

**Decision**: Use TanStack Query `persistQueryClient` with a sync localStorage persister (`@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister`) to persist the query cache across page reloads.

**Rationale**: The backend API lives at a different origin (`LACHIWANA_SERVICE_URL`). Service workers only intercept same-origin fetch requests by default; cross-origin API responses cannot be cached via service worker without `no-cors` mode, which produces opaque responses whose content cannot be read. TanStack Query's own persistence layer serialises the in-memory query cache to localStorage and restores it on boot — making user data (notebooks, notes, attachments metadata) available offline without any service worker involvement.

**Alternatives considered**:
- SW cross-origin caching with `no-cors` — opaque responses cannot be inspected; cache size is uncontrollable; rejected.
- Manual IndexedDB store — high implementation cost; TanStack Query's persister already solves this correctly; rejected.
- In-memory only (no persist) — cache lost on page reload while offline; rejected because offline access across reloads is a core requirement.

---

## Decision 2: Service Worker Implementation

**Decision**: Hand-written `public/sw.js` with a cache-first strategy for same-origin static assets (JS, CSS, HTML, images) and a network-first fallback for navigation requests. No Workbox or `vite-plugin-pwa`.

**Rationale**: The user has already placed static files in `public/`. Vite serves `public/` files as-is with no transformation. Adding Workbox or `vite-plugin-pwa` would introduce a significant dependency and opinionated build-time configuration. A hand-written service worker (~100 lines) achieves the required cache-first strategy with full control and zero added dependencies.

**Cache strategy breakdown**:
- `CACHE_NAME = 'lachiwana-static-v1'` — versioned; bump string to invalidate on deploy.
- Pre-cache on `install`: `/`, `/index.html`, all JS/CSS bundles, icons, manifest.json, offline.html.
- On `fetch`: cache-first for same-origin static assets; network-first with offline fallback for navigation.
- Cross-origin requests (API) — pass through to network; do not cache.

**Alternatives considered**:
- `vite-plugin-pwa` — auto-generates SW and handles Vite asset hashing; adds Rollup plugin overhead; rejected to keep config minimal and preserve user's public-folder approach.
- Workbox CDN import in SW — adds runtime dependency; rejected.

---

## Decision 3: Network Status Management

**Decision**: Plain module `src/stores/networkStore.js` following the existing `authStore.js` pattern — no Zustand or React context. Exports `getNetworkStatus()`, `subscribeToNetwork(callback)`, and an internal initialiser. A custom hook `src/hooks/useNetwork.js` wraps this for React components.

**Rationale**: The existing stores are vanilla JS modules with localStorage and event listeners. Consistency with the established pattern avoids introducing a new state-management primitive. Network events (`online`/`offline` on `window`) are global and do not need React lifecycle management at the store level.

**Alternatives considered**:
- React Context — unnecessary overhead for a global singleton; rejected.
- Zustand — not in project dependencies; rejected to avoid new dep.

---

## Decision 4: Service Worker Update Notification

**Decision**: Listen for `updatefound` + `statechange` on the active `ServiceWorkerRegistration` inside `src/main.jsx`. When a new worker reaches `installed` state, store a reference to it and emit a network store event so `UpdateBanner` can appear. On user confirmation ("Reload"), send `{ type: 'SKIP_WAITING' }` via `postMessage`, then `window.location.reload()`.

**Rationale**: This is the canonical pattern for SW update detection without Workbox. Storing the waiting worker reference allows the banner to trigger skip-waiting on demand. The banner uses Framework7 primitives per Constitution III/IV.

**Alternatives considered**:
- Auto-reload on update — rejected per spec (user explicitly chose manual reload via banner).
- `clients.claim()` only — doesn't prompt user; rejected.

---

## Decision 5: Offline Fallback Page

**Decision**: Create `public/offline.html` — a minimal standalone HTML page styled to match the app's brand (`#FAF8F5` background, `#e17100` accent from manifest). Served by the service worker when a navigation request fails and the target URL is not cached.

**Rationale**: `public/offline.html` is absent from the current public folder despite being referenced in the spec assumptions. The service worker requires a cached fallback URL for FR-006; a dedicated page is cleaner than falling back to `/` (which would attempt to boot the React app, possibly showing an empty/broken state). A standalone HTML page avoids any JS dependency and always renders correctly offline.

**Alternatives considered**:
- Fallback to `/` (app shell) — shell boots but TanStack Query cache may be empty for uncached routes; ambiguous UX; rejected.
- No fallback — violates FR-006; rejected.

---

## New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query-persist-client` | `^5.0.0` | Wires TanStack Query to a persistence adapter |
| `@tanstack/query-sync-storage-persister` | `^5.0.0` | Serialises query cache to localStorage synchronously |

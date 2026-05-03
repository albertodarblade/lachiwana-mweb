# Tasks: PWA Offline Configuration

**Input**: Design documents from `specs/006-pwa-offline-config/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested — manual validation per quickstart.md.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- No unit test files — per Constitution IX

---

## Phase 1: Setup

**Purpose**: Install new dependencies required for query cache persistence.

- [x] T001 Install `@tanstack/react-query-persist-client` and `@tanstack/query-sync-storage-persister` via pnpm

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that all user stories depend on. No user story work begins until this phase is complete.

**⚠️ CRITICAL**: Blocks US1, US2, US3.

- [x] T002 Create `public/offline.html` — standalone offline fallback page styled with brand colors (`#FAF8F5` background, `#e17100` accent), no JS dependencies, shows "You're offline" message with app name
- [x] T003 Create `public/sw.js` — full service worker with: versioned cache name `lachiwana-static-v1`; `install` handler pre-caching app shell (`/`, `/index.html`, icons, manifest, `offline.html`); `activate` handler deleting stale cache buckets and calling `clients.claim()`; `fetch` handler (pass-through cross-origin, cache-first same-origin static assets, network-first navigation with `/offline.html` fallback); `message` handler calling `self.skipWaiting()` on `{ type: 'SKIP_WAITING' }`
- [x] T004 [P] Create `src/stores/networkStore.js` — plain module following `authStore.js` pattern; initialises from `navigator.onLine`; listens to `window` `online`/`offline` events; tracks `{ isOnline, justReconnected }` state; exports `getNetworkStatus()` and `subscribeToNetwork(callback)` returning an unsubscribe function
- [x] T005 [P] Create `src/hooks/useNetwork.js` — React hook that calls `subscribeToNetwork` in a `useEffect`, syncs state via `useState`, returns `{ isOnline, justReconnected }` (depends on T004)

**Checkpoint**: Foundation ready — all user story phases can now proceed.

---

## Phase 3: User Story 1 — Install App as PWA (Priority: P1) 🎯 MVP

**Goal**: App meets PWA installability criteria so the browser shows an install prompt and the app opens in standalone mode.

**Independent Test**: Open app in Chrome/Edge → DevTools → Application → Manifest shows no errors; Application → Service Workers shows `sw.js` registered; Lighthouse PWA audit passes installability checks.

- [x] T006 [US1] Register service worker in `src/main.jsx` — wrap `navigator.serviceWorker.register('/sw.js')` inside a `window load` listener guarded by `'serviceWorker' in navigator`; store the `registration` reference on the module for reuse in US3

**Checkpoint**: App installs from browser. Lighthouse PWA installability passes. `public/manifest.json` (already complete) + `public/sw.js` (T003) + registration (T006) satisfy all install criteria.

---

## Phase 4: User Story 2 — Browse App Content Offline (Priority: P1)

**Goal**: User can read their notebooks, notes, and attachment metadata after going offline; write actions are blocked; offline indicator is shown; reconnect banner appears on restoration.

**Independent Test**: In DevTools → Network → set "Offline"; reload app; navigate to Notebooks — cached data renders; attempt create action — UI blocks or API error is surfaced; restore network — "Back online" banner appears with Refresh button.

- [x] T007 [P] [US2] Modify `src/queryClient.js` — import `persistQueryClient` from `@tanstack/react-query-persist-client` and `createSyncStoragePersister` from `@tanstack/query-sync-storage-persister`; wrap `QueryClient` with `persistQueryClient({ queryClient, persister: createSyncStoragePersister({ storage: window.localStorage, key: 'LACHIWANA_QUERY_CACHE' }), maxAge: 24 * 60 * 60 * 1000 })`; set `gcTime` to `24 * 60 * 60 * 1000` on `defaultOptions.queries` so cache entries survive long enough to be persisted
- [x] T008 [P] [US2] Create `src/components/OfflineBanner.jsx` — Framework7 `Block`/`Link` primitives only (Constitution III/IV); fixed top strip below navbar; shows "You're offline — read-only mode" in red (`color-red`) when `isOnline === false`; shows "Back online" strip in green with a "Refresh" `Link` when `justReconnected === true`; reads state via `useNetwork()` hook; returns `null` when `isOnline === true` and `justReconnected === false`
- [x] T009 [US2] Modify `src/App.jsx` — render `<OfflineBanner />` as a sibling to `<F7App>` (outside the F7App tree so it renders on top); import `OfflineBanner` from `./components/OfflineBanner`
- [x] T010 [US2] Modify `src/stores/authStore.js` `clearSession()` function — add `localStorage.removeItem('LACHIWANA_QUERY_CACHE')` to prevent stale cross-user data persisting after logout

**Checkpoint**: Offline read works across page reloads. Offline banner visible. Reconnect banner with Refresh appears when network restores.

---

## Phase 5: User Story 3 — App Loads Instantly on Repeat Visits (Priority: P2)

**Goal**: App shell renders from cache on repeat visit regardless of connection quality; update banner prompts user to reload when a new version is available.

**Independent Test**: Load app online; throttle to "Slow 3G" or "Offline" in DevTools; reload — shell appears without waiting for network. Force a SW update (change cache name in `sw.js`, reload) — "Update available" strip appears at bottom; click "Reload" — app reloads with new version.

- [x] T011 [P] [US3] Create `src/components/UpdateBanner.jsx` — Framework7 `Block`/`Link` primitives only (Constitution III/IV); fixed bottom strip; shows "Update available" text on left, "Reload" `Link` on right; `color-blue` background; on "Reload" click: calls `waitingWorker.postMessage({ type: 'SKIP_WAITING' })` then `window.location.reload()`; accepts props `waitingWorker` (ServiceWorker | null) and optional `onDismiss`; returns `null` when `waitingWorker === null`
- [x] T012 [US3] Extend SW registration in `src/main.jsx` — after storing `registration`, add `updatefound` listener; inside it, listen for `statechange` on `registration.installing`; when `newWorker.state === 'installed'` and `navigator.serviceWorker.controller` exists (not first install), call a module-level `onUpdateReady(newWorker)` callback to signal the app; expose `setOnUpdateReady(cb)` from `main.jsx` or manage via a simple module-level setter so `App.jsx` can subscribe (depends on T006)
- [x] T013 [US3] Modify `src/App.jsx` — add `useState(null)` for `waitingWorker`; subscribe to the SW update signal from `main.jsx` in a `useEffect`; render `<UpdateBanner waitingWorker={waitingWorker} />` as a sibling to `<F7App>` and `<OfflineBanner />` (depends on T011, T012)

**Checkpoint**: Cache-first shell loading verified. Update banner appears on new deployment and triggers clean reload.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation.

- [x] T014 [P] Verify `public/sw.js` cache-name versioning comment is present — add a one-line comment above `CACHE_NAME` explaining that bumping the version suffix invalidates all cached assets on the next deploy
- [x] T015 Run all validation steps from `specs/006-pwa-offline-config/quickstart.md` — Lighthouse PWA audit, offline mode test, reconnect banner test, update banner test; fix any issues found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — blocks US1, US2, US3
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion; can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 3 (T006 must exist for T012); US3's T011 is independent
- **Phase 6 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T003 service worker)
- **US2 (P1)**: Depends on Foundational (T004, T005 networkStore); independent of US1
- **US3 (P2)**: Depends on US1 (T006 SW registration) for T012; T011 is independent

### Within Each User Story

- US2: T007 and T008 are parallel (different files); T009 depends on T008; T010 is independent
- US3: T011 is independent; T012 depends on T006; T013 depends on T011 and T012

### Parallel Opportunities

- T004 and T005 run in parallel (foundational, different files)
- T007 and T008 run in parallel (US2, different files)
- T010 runs in parallel with T007 and T008 (US2, different file)
- T011 runs independently of T012 (US3)

---

## Parallel Example: User Story 2

```
# Launch in parallel:
Task T007: Modify src/queryClient.js — add persistQueryClient
Task T008: Create src/components/OfflineBanner.jsx
Task T010: Modify src/stores/authStore.js — clear cache on logout

# Then sequential:
Task T009: Modify src/App.jsx — render OfflineBanner (depends on T008)
```

## Parallel Example: User Story 3

```
# Launch in parallel:
Task T011: Create src/components/UpdateBanner.jsx (no deps)
Task T012: Extend SW registration in src/main.jsx (depends on T006)

# Then sequential:
Task T013: Modify src/App.jsx — render UpdateBanner (depends on T011 + T012)
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T005)
3. Complete Phase 3: US1 (T006)
4. **STOP and VALIDATE**: Lighthouse PWA audit passes, install prompt appears
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → foundation ready
2. Phase 3 (US1) → PWA installable ✅
3. Phase 4 (US2) → offline read-only + banners ✅
4. Phase 5 (US3) → cache-first + update flow ✅
5. Phase 6 (Polish) → production ready ✅

---

## Notes

- `[P]` = different files, no incomplete-task dependencies — safe to run in parallel
- `[Story]` label maps task to user story for traceability
- No test files per Constitution IX — validate manually via quickstart.md
- `public/sw.js` is served as-is by Vite (public folder); no build step needed
- Bump `CACHE_NAME` version suffix on every production deploy to bust old caches
- `LACHIWANA_QUERY_CACHE` localStorage key must be cleared on logout (T010) to prevent data leakage between users

# Quickstart: PWA Offline Configuration

## Install new dependencies

```bash
pnpm add @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
```

## Files to create

| File | Purpose |
|------|---------|
| `public/sw.js` | Service worker (cache-first, offline fallback, skip-waiting) |
| `public/offline.html` | Standalone offline fallback page |
| `src/stores/networkStore.js` | Online/offline state module |
| `src/hooks/useNetwork.js` | React hook for network status |
| `src/components/OfflineBanner.jsx` | Fixed top banner shown when offline |
| `src/components/UpdateBanner.jsx` | Fixed bottom banner shown when SW update available |

## Files to modify

| File | Change |
|------|--------|
| `src/queryClient.js` | Wrap `QueryClient` with `persistQueryClient` + localStorage persister |
| `src/main.jsx` | Register service worker; detect updates; propagate `waitingWorker` state |
| `src/App.jsx` | Render `OfflineBanner` + `UpdateBanner` |
| `src/stores/authStore.js` | Clear persisted query cache on `clearSession()` |

## Verify PWA install criteria

After implementation, run `pnpm dev` and open Chrome DevTools → Application → Manifest. Confirm:
- Manifest loads with name, icons, start_url, display mode.
- Service worker registered under Application → Service Workers.
- Lighthouse PWA audit passes installability checks.

## Test offline mode

1. In DevTools → Network, set throttling to "Offline".
2. Reload — app shell should appear from cache.
3. Navigate to Notebooks — cached data should render.
4. Attempt to create a notebook — UI should block or show offline message.
5. Re-enable network — "Back online" banner should appear with Refresh button.

## Cache versioning

To invalidate the cache on a new deploy, change `CACHE_NAME` in `public/sw.js`:

```js
const CACHE_NAME = 'lachiwana-static-v2'  // was v1
```

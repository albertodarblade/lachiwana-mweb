# UI Contracts: PWA Offline Configuration

**Feature**: 006-pwa-offline-config  
**Date**: 2026-05-02

---

## OfflineBanner

**File**: `src/components/OfflineBanner.jsx`  
**Constitution**: Built from Framework7 primitives only (Principle III/IV).

### Behaviour

| State | Rendered? | Content |
|-------|-----------|---------|
| `isOnline === true` | No | Nothing (returns `null`) |
| `isOnline === false` | Yes | Offline indicator strip |

### Visual Contract

- Displayed as a fixed strip at the top of the viewport (below Framework7 navbar).
- Background: Framework7 `color-red` token (danger/offline semantic).
- Text: "You're offline — read-only mode" centred in one line.
- Must not scroll with page content.
- Z-index must sit above page content but below modals.

### Props

None. Reads network status from `src/stores/networkStore.js` via `src/hooks/useNetwork.js`.

---

## UpdateBanner

**File**: `src/components/UpdateBanner.jsx`  
**Constitution**: Built from Framework7 primitives only (Principle III/IV).

### Behaviour

| State | Rendered? | Content |
|-------|-----------|---------|
| `waitingWorker === null` | No | Nothing (returns `null`) |
| `waitingWorker !== null` | Yes | Update notification strip |

### Visual Contract

- Displayed as a fixed strip at the bottom of the viewport (above Framework7 toolbar if present).
- Background: Framework7 `color-blue` token (informational).
- Text: "Update available" on the left; "Reload" action button on the right.
- Tapping "Reload" sends `SKIP_WAITING` to the waiting worker and calls `window.location.reload()`.
- Must not scroll with page content.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `waitingWorker` | `ServiceWorker \| null` | Yes | The waiting SW instance; banner renders only when non-null |
| `onDismiss` | `() => void` | No | Optional dismiss without reloading; hides banner until next update |

---

## NetworkStore API

**File**: `src/stores/networkStore.js`

| Export | Signature | Description |
|--------|-----------|-------------|
| `getNetworkStatus` | `() => boolean` | Returns current `isOnline` value |
| `subscribeToNetwork` | `(cb: (isOnline: boolean) => void) => () => void` | Registers a listener; returns unsubscribe function |

---

## Service Worker Message Protocol

The app communicates with the waiting service worker via `postMessage`.

| Message | Direction | Payload | Effect |
|---------|-----------|---------|--------|
| `SKIP_WAITING` | App → SW | `{ type: 'SKIP_WAITING' }` | Waiting SW calls `self.skipWaiting()`; becomes active on next reload |

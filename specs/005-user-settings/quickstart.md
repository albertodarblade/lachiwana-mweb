# Quickstart: User Settings Page

**Feature**: `005-user-settings` | **Date**: 2026-05-02

---

## Prerequisites

1. `pnpm dev` → `http://localhost:5175`
2. Signed in as at least one Google account.

---

## Testing US1 — View Profile Information

1. Open the notebooks list (home page).
2. Verify: user's avatar (profile photo) is visible in the Navbar top-right.
3. Tap the avatar → `/settings` opens.
4. Verify: full name, email address, and profile photo all appear within 1 second.
5. **Error case**: Temporarily modify the `picture` URL to a broken URL → verify a
   fallback avatar (initials or icon) is shown instead.

---

## Testing US2 — Logout with Confirmation

1. Open `/settings`.
2. Tap "Cerrar sesión".
3. Verify: a confirm/cancel dialog appears (does NOT log out immediately).
4. Tap cancel → verify: dialog closes, you remain on settings page, session intact.
5. Tap "Cerrar sesión" again → confirm → verify: redirected to login screen.
6. Attempt to navigate to `/` directly → verify: redirected back to login.

---

## Testing US3 — Theme Selection

1. Open `/settings`.
2. Switch to "Google" (MD) style.
3. Verify: UI updates immediately (button shapes, typography, navigation style change).
4. Navigate to notebooks list and note detail — verify MD theme is active on all screens.
5. Close and reopen the app (or hard-reload) → verify: MD theme is still active.
6. Log in as a **second Google account** → verify: default iOS theme is shown (not the
   first user's MD preference).
7. Switch back to first account → verify: MD preference is restored.

---

## Testing US4 — Dark / Light Mode

1. Open `/settings`.
2. Enable dark mode → verify: the app switches to dark background immediately on all
   visible screens.
3. Navigate away and back → verify: dark mode persists.
4. Hard-reload the app → verify: dark mode is applied with no flash of light mode.
5. Disable dark mode → verify: app switches back to light immediately.

---

## Testing No-Flash Initialization (SC-003)

1. Set dark mode + MD theme in settings.
2. Hard-reload (`Cmd+Shift+R` / `Ctrl+Shift+R`).
3. Observe the very first frame: verify there is no brief flash of iOS + light mode
   before the correct theme appears.

---

## Testing Cross-User Preference Isolation (SC-004)

1. User A: set MD theme + dark mode.
2. Log out → log in as User B.
3. Verify: User B sees default iOS + light mode.
4. User B: set iOS theme + dark mode.
5. Log out → log in as User A.
6. Verify: User A sees MD theme + dark mode (their own settings, unaffected by User B).

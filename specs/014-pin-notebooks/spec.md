# Feature Specification: Pin Notebooks

**Feature Branch**: `014-pin-notebooks`  
**Created**: 2026-05-25  
**Status**: Draft  
**Input**: User description: "The user should be allowed to pin notebooks, and sorted by pinnedDate, this should be stored by user in the localstorage, and tied to loggedUserID, the latest pin should appear at the top."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pin a Notebook (Priority: P1)

A user opens their notebooks list and pins a notebook they frequently use. The pinned notebook immediately moves to the top of the list, above all unpinned notebooks. The next time the user opens the app, the notebook is still pinned and still appears at the top.

**Why this priority**: Core behavior of the feature — without this, nothing else works.

**Independent Test**: Can be fully tested by pinning one notebook and verifying it appears at the top of the list, both immediately and after a page reload.

**Acceptance Scenarios**:

1. **Given** a user is on the notebooks list with at least one notebook, **When** they pin a notebook, **Then** that notebook moves to the top of the list immediately.
2. **Given** a user has pinned a notebook, **When** they reload or reopen the app, **Then** the pinned notebook still appears at the top of the list.
3. **Given** a user has no pinned notebooks, **When** they pin one, **Then** a visual indicator (e.g., pin icon) appears on that notebook card.

---

### User Story 2 - Pin Multiple Notebooks, Ordered by Most Recent Pin (Priority: P2)

A user pins several notebooks over time. The most recently pinned notebook always appears first among pinned notebooks, so the top of the list reflects recency of pinning action.

**Why this priority**: Defines the ordering behavior for the multi-pin case, which is the main value proposition of the feature.

**Independent Test**: Can be tested by pinning two notebooks in sequence and verifying the second-pinned notebook appears above the first.

**Acceptance Scenarios**:

1. **Given** a user has pinned Notebook A, **When** they also pin Notebook B, **Then** Notebook B appears above Notebook A in the list.
2. **Given** three pinned notebooks (pinned at T1 < T2 < T3), **When** the list is displayed, **Then** the order is T3, T2, T1 — most recently pinned first.
3. **Given** pinned notebooks at the top and unpinned notebooks below, **When** sorting is applied, **Then** pinned and unpinned groups are each internally consistent.

---

### User Story 3 - Unpin a Notebook (Priority: P3)

A user decides a notebook no longer needs to be pinned. They unpin it, and it returns to the regular (unpinned) section of the list.

**Why this priority**: Completing the pin/unpin toggle is essential for usability, but the basic pinning flow (P1/P2) is valuable on its own.

**Independent Test**: Can be tested by pinning a notebook and then unpinning it, verifying it leaves the pinned section.

**Acceptance Scenarios**:

1. **Given** a user has a pinned notebook, **When** they unpin it, **Then** it moves out of the pinned section and back among unpinned notebooks.
2. **Given** a user unpins the last pinned notebook, **When** the list is displayed, **Then** no notebooks appear in the pinned section.
3. **Given** a user unpins a notebook, **When** they reload the app, **Then** the notebook remains unpinned.

---

### User Story 4 - Per-User Pin State (Priority: P2)

Two users share a device or log into the same app. Each user's pinned notebooks are stored and displayed independently — User A's pins do not affect what User B sees.

**Why this priority**: Correctness requirement. Without user isolation, pins would bleed across accounts on shared devices.

**Independent Test**: Can be tested by logging in as two different users and verifying each user has their own independent pin state.

**Acceptance Scenarios**:

1. **Given** User A has pinned Notebook X, **When** User B logs in on the same device, **Then** User B does not see Notebook X as pinned.
2. **Given** User B pins Notebook Y, **When** User A logs in again, **Then** User A's pin state is unchanged.

---

### Edge Cases

- What happens when a pinned notebook is deleted? The pin entry for it should be silently ignored and not affect the list.
- What happens if the localStorage entry is corrupted or missing? The feature degrades gracefully — all notebooks appear unpinned and the normal list is shown.
- What happens when the user is not logged in? Pinning is unavailable (no user ID to key the storage on).
- What if a user pins the same notebook twice? The pin action is idempotent — the `pinnedDate` updates to the current time, effectively moving it to the top.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to pin any notebook from the notebooks list. There is no limit on the number of notebooks a user can pin.
- **FR-002**: Users MUST be able to unpin any currently pinned notebook.
- **FR-003**: Pinned notebooks MUST appear at the top of the notebooks list, above all unpinned notebooks, separated by a visible section label (e.g., "Pinned"). Unpinned notebooks below MUST also have a section label (e.g., "All" or "Notebooks"). The section label for unpinned notebooks MUST only appear when at least one notebook is pinned.
- **FR-004**: Among pinned notebooks, the list MUST be sorted by `pinnedDate` descending — the most recently pinned notebook appears first.
- **FR-005**: Pin state MUST be stored per user in the device's local storage, keyed by the logged-in user's ID (`googleId`).
- **FR-006**: Pin state MUST persist across page reloads and app restarts.
- **FR-007**: Each pinned notebook entry MUST record the date and time it was pinned (`pinnedDate`).
- **FR-008**: Each notebook card MUST display a pin icon button that is always visible. Tapping/clicking it toggles the pin state. Pinned cards show the icon in an active/filled state; unpinned cards show it in an inactive/outline state.
- **FR-009**: If a pinned notebook no longer exists (deleted), its pin entry MUST be silently ignored without causing errors.
- **FR-010**: If the stored pin data is corrupt or unreadable, the app MUST fall back to showing all notebooks as unpinned.
- **FR-011**: Pin state MUST be user-isolated — pins for one user MUST NOT be visible to another user on the same device.

### Key Entities

- **PinnedNotebook**: Represents a single pin record. Key attributes: `notebookId` (string), `pinnedDate` (ISO timestamp string).
- **UserPinStore**: The full pin state for a user. Key attributes: `userId` (string, the `googleId`), `pinnedNotebooks` (array of `PinnedNotebook`), stored under a namespaced localStorage key.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can pin or unpin a notebook in a single interaction (one tap/click), with the list reordering immediately — no page reload required.
- **SC-002**: Pinned state is correctly restored on every app load for 100% of users who have previously pinned notebooks.
- **SC-003**: The notebooks list reflects the correct pin-first ordering on every render, with no visual flicker or reorder after initial paint.
- **SC-004**: Pin state for User A is never visible to User B when both use the same device — verified across 100% of cross-user test scenarios.
- **SC-005**: Corrupted or missing pin data causes zero application errors — the list renders normally with all notebooks in the unpinned state.

## Clarifications

### Session 2026-05-25

- Q: What is the UI affordance for pin/unpin? → A: Always-visible pin icon button on each notebook card (one-tap toggle, no menu needed).
- Q: Should pinned and unpinned notebooks be visually grouped with section labels? → A: Yes — show a section label/divider ("Pinned" above pinned group, "All" or "Notebooks" above unpinned group).
- Q: Should pin data be cleared or retained in local storage when the user logs out? → A: Retain — pins are restored automatically on next login.
- Q: Is there a maximum number of notebooks a user can pin? → A: No limit — users can pin as many notebooks as they want.

## Assumptions

- The pinned state is stored entirely on the client (localStorage) — no backend changes are required for this feature.
- The localStorage key for pin data follows the existing project convention: `lachiwana_pins_{googleId}`.
- Unpinned notebooks retain their existing sort order (whatever order the API returns them in).
- Pin/unpin is triggered via an always-visible pin icon button on each notebook card — one tap/click toggles the state with no menu required.
- Only the notebooks list view (`NotebooksPage`) needs to reflect pin ordering for this feature; detail views are unaffected.
- Users must be logged in to use the pin feature; unauthenticated states are out of scope.
- Pin data is retained in localStorage after logout — it is restored when the same user logs back in, since data is already isolated by user ID.

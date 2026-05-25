# Data Model: Pin Notebooks

**Branch**: `014-pin-notebooks` | **Date**: 2026-05-25

## Entities

### PinnedEntry

Represents a single pin record for one notebook belonging to one user.

| Field        | Type   | Required | Notes                                         |
|--------------|--------|----------|-----------------------------------------------|
| `notebookId` | string | yes      | Matches `notebook.id` from the API response   |
| `pinnedDate` | string | yes      | ISO 8601 timestamp of when the pin was set    |

**Validation rules**:
- `notebookId` must be a non-empty string.
- `pinnedDate` must be a valid ISO 8601 string (produced via `new Date().toISOString()`).
- Duplicate `notebookId` entries are not allowed — pinning an already-pinned notebook replaces the existing entry (updates `pinnedDate` to now).

**State transitions**:
```
Unpinned ──[pin action]──► Pinned (entry added / pinnedDate updated)
Pinned   ──[unpin action]─► Unpinned (entry removed)
```

---

### UserPinStore (localStorage value)

The full set of pin records for a single user, stored as a JSON-serialized array.

| Field   | Type            | Notes                              |
|---------|-----------------|------------------------------------|
| entries | `PinnedEntry[]` | Ordered array; sorted at read time |

**localStorage key**: `lachiwana_pins_{googleId}`

**Example stored value**:
```json
[
  { "notebookId": "abc123", "pinnedDate": "2026-05-25T14:30:00.000Z" },
  { "notebookId": "def456", "pinnedDate": "2026-05-24T09:00:00.000Z" }
]
```

**Lifecycle**:
- Created on first pin action for a user.
- Updated on every subsequent pin/unpin.
- Retained in localStorage after logout (survives across sessions).
- Silently reset to `[]` if the stored value is corrupt or unparseable.
- Entries for deleted notebooks are ignored at render time (filtered against the live notebook list from the API).

---

## Store API — `pinStore.js`

```
getPins(userId)           → PinnedEntry[]   — reads and parses localStorage; returns [] on error
pinNotebook(userId, notebookId)             — upserts entry with current timestamp; writes to localStorage
unpinNotebook(userId, notebookId)           — removes entry; writes to localStorage
isPinned(userId, notebookId) → boolean     — derived from getPins; no separate storage
```

---

## Hook API — `usePinnedNotebooks(userId)`

```
pins          → PinnedEntry[]       — reactive list of current pins
pinNotebook(notebookId)             — calls store + updates state
unpinNotebook(notebookId)           — calls store + updates state
isPinned(notebookId) → boolean      — derived from pins array
```

---

## Sorting Contract (NotebooksPage)

Given a raw `notebooks` array from the API and a `pins` array from `usePinnedNotebooks`:

1. Build a lookup: `pinnedMap = { [notebookId]: pinnedDate }` from `pins`.
2. Split: `pinnedNotebooks = notebooks.filter(n => pinnedMap[n.id])`.
3. Split: `unpinnedNotebooks = notebooks.filter(n => !pinnedMap[n.id])`.
4. Sort `pinnedNotebooks` by `pinnedMap[n.id]` descending (most recent pin first).
5. `unpinnedNotebooks` retain their existing API sort order (`updatedAt` descending, applied before split).
6. Render: `[...pinnedNotebooks, ...unpinnedNotebooks]` with section labels between groups.

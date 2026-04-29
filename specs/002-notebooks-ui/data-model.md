# Data Model: Notebooks UI

**Feature**: `002-notebooks-ui` | **Date**: 2026-04-28

---

## Notebook (server-side entity, read via API)

Fetched from `GET /api/v1/notebooks`. Cached under query key `['notebooks']`.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | MongoDB ObjectId as string. |
| `title` | `string` | No | Display name of the notebook. |
| `description` | `string` | Yes | Optional free-text description. |
| `color` | `string` | Yes | Hex color string (e.g., `#007AFF`) or `null`. |
| `iconName` | `string` | Yes | F7 icon name (e.g., `book`) or `null`. |
| `owner` | `string` | No | GoogleId of the creating user. |
| `users` | `string[]` | No | Array of member GoogleIds (may be empty). |
| `createdAt` | `string` | No | ISO 8601 creation timestamp. |
| `updatedAt` | `string` | No | ISO 8601 last-update timestamp. |

**Sort order**: Descending by `updatedAt` (most recently updated first).

**Optimistic entry shape**: Same as above, with `id: "temp-${Date.now()}"`,
`owner` from `getSession().user.googleId`, `createdAt`/`updatedAt` set to
`new Date().toISOString()`.

---

## CreateNotebookPayload (sent to POST /api/v1/notebooks)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | `string` | Yes | Non-empty; max ~100 chars enforced client-side |
| `description` | `string` | No | Optional free text |
| `color` | `string` | No | One of the 8 predefined hex values or omitted |
| `iconName` | `string` | No | One of the 12 predefined F7 icon names or omitted |
| `users` | `string[]` | No | Array of member GoogleIds; may be empty |

---

## AuthSession (existing, read-only in this feature)

Read from localStorage via `getSession()` from `src/stores/authStore.js`.

| Field | Used in this feature for |
|-------|--------------------------|
| `token` | Injected as Bearer by API client (automatic, no change) |
| `user.name` | Reserved for potential future navbar text |
| `user.picture` | Rendered as circular avatar in Navbar right slot |
| `user.googleId` | Set as `owner` in optimistic notebook entry |

---

## Color Palette (UI constant)

Defined as a constant array in `CreateNotebookPage.jsx`.

| Label | Hex |
|-------|-----|
| Red | `#FF3B30` |
| Orange | `#FF9500` |
| Yellow | `#FFCC00` |
| Green | `#34C759` |
| Teal | `#5AC8FA` |
| Blue | `#007AFF` |
| Purple | `#AF52DE` |
| Pink | `#FF2D55` |

---

## Icon Set (UI constant)

Defined as a constant array in `CreateNotebookPage.jsx`. Values are F7 icon names.

```js
['book', 'pencil', 'folder_fill', 'star_fill', 'heart_fill', 'flag_fill',
 'archivebox_fill', 'lightbulb_fill', 'briefcase_fill', 'graduationcap_fill',
 'chart_bar_fill', 'doc_fill']
```

---

## MemberPicker State (component-local)

| State | Type | Description |
|-------|------|-------------|
| `searchQuery` | `string` | Current text in the Searchbar; filters user list client-side |
| `selectedIds` | `Set<string>` | GoogleIds of currently selected members |
| `isOpen` | `boolean` | Controls F7 Sheet open/closed state |

Filtering logic: `users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))`.

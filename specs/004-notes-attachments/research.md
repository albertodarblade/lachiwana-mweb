# Research: Notes & Attachments

**Feature**: `004-notes-attachments` | **Date**: 2026-05-02

---

## Decision: File Rendering Strategy (auth-gated files)

**Decision**: Fetch all files via the authenticated API layer using `getBlob(path)`,
convert to base64 data URLs using `FileReader.readAsDataURL`, and cache the result in
TanStack Query under `['file', fileSrcId]`. Use the data URL directly as the `src` for
`<img>` elements and as the `href` for download links.

**Rationale**: The files endpoint requires `Authorization: Bearer <token>`. Standard
`<img src>` tags do not send custom headers. Using data URLs avoids the complexity of
blob URL lifecycle management (`URL.createObjectURL` / `URL.revokeObjectURL`) while
keeping the cache simple (data URLs are plain strings). The size overhead (~33% larger
than binary) is acceptable for the typical attachment sizes in this app.

**Alternatives considered**:
- Direct `<img src="/api/v1/files/:id">`: rejected — no auth header sent.
- Blob URLs with manual cleanup: rejected — requires precise lifecycle management
  (revoke on unmount) that conflicts with TanStack Query's cache-first approach.
- Token as query param (`?token=...`): rejected — exposes auth token in URLs, browser
  history, and server logs.

---

## Decision: useBlobUrl Hook

**Decision**: A `useBlobUrl(fileSrcId)` hook uses `useQuery` with:
- `queryKey: ['file', fileSrcId]`
- `queryFn`: fetches the file as a blob via `getBlob`, reads it with `FileReader` to
  produce `{ dataUrl: string, mimeType: string }`, where `mimeType` is `blob.type`.
- `staleTime: Infinity` — file content never changes (immutable by fileSrcId).
- `enabled: !!fileSrcId`

The `mimeType` field is used to determine image vs non-image: `mimeType.startsWith('image/')`.

**Cache key `['file', fileSrcId]` is distinct** from notes/notebooks keys so file
fetches are never accidentally invalidated by notebook or note mutations.

---

## Decision: Auto-Save Debounce

**Decision**: In `NoteDetailPage`, the title `ListInput` calls `handleTitleChange` on
every `onInput` event. `handleTitleChange`:
1. Updates local state immediately (React state → instant feedback).
2. Clears any pending debounce timer (`useRef`).
3. Sets a new 800ms timer that calls `mutate({ notebookId, noteId, title })`.

A `isSaving` state flag is set to `true` when the timer fires and the mutation begins;
it reverts to `false` in `onSettled`. A "Guardando…" indicator renders while `isSaving`
is true.

**Rationale**: 800ms balances responsiveness (user sees the field react instantly) with
server load (doesn't fire on every keystroke). SC-003 requires saves within 1 second
of pausing, so 800ms debounce satisfies this constraint.

---

## Decision: Optimistic Note Creation

**Decision**: `useCreateNote` implements the standard TanStack Query optimistic pattern:
- `onMutate`: cancel `['notes', notebookId]`, snapshot, prepend an optimistic note with
  `id: 'temp-${Date.now()}'`, `title: payload.title`, `attachments: []`.
- `onError`: restore snapshot.
- `onSettled`: invalidate `['notes', notebookId]`.

On success, the mutation callback navigates to the real note's detail page using the
server-returned `noteId`. The temp entry is replaced by the invalidation refetch.

---

## Decision: Optimistic Attachment Deletion

**Decision**: `useDeleteAttachment` implements optimistic removal from the note's
`attachments` array in both `['note', notebookId, noteId]` and `['notes', notebookId]`
caches. On error, the snapshot is restored. On settled, both query keys are invalidated
(`refetchType: 'none'` for the list, immediate for the note detail).

**Rationale**: Deletion is fast and reversible if it fails. Removing the item
immediately makes the gallery feel responsive. The attachment record has no downstream
dependencies that would require server confirmation before the UX update.

---

## Decision: PhotoBrowser for Fullscreen Images

**Decision**: F7's `PhotoBrowser` component renders fullscreen image viewing with swipe
navigation. `AttachmentGallery` collects the data URLs of all image attachments (using
`useBlobUrl` per item) and passes them as `photos={[{ url: dataUrl }, ...]}` to
`PhotoBrowser`. Tapping an image thumbnail opens the PhotoBrowser at the correct index.

**Constraint**: `PhotoBrowser` is opened programmatically via a ref:
`photoBrowserRef.current.open(imageIndex)`. Since data URLs are loaded asynchronously,
the PhotoBrowser can only be opened after the tapped image's data URL is available.
Images that haven't loaded yet show a `Preloader` in their thumbnail slot.

---

## Decision: Non-Image File Download

**Decision**: For non-image attachments, the "Descargar" button in `AttachmentItem`:
1. Calls `getBlob('/api/v1/files/${fileSrcId}')` on tap.
2. Creates a temporary `<a>` element with `href = URL.createObjectURL(blob)` and
   `download = 'archivo-${attachment.id}'`.
3. Programmatically clicks it, then revokes the blob URL immediately after.

The filename uses `archivo-${attachment.id}` because the backend stores no original
filename. This is a known limitation documented in the spec Assumptions.

**Alternative**: Use the cached data URL from `useBlobUrl` — rejected because the data
URL approach uses `FileReader.readAsDataURL` which produces base64, and `<a download>`
with a base64 data URL works in browsers but creates a large in-memory string for large
files. Using a fresh blob URL for downloads avoids holding large data URLs in memory.

---

## Decision: Query Key Strategy

| Query Key | Endpoint | Stale Policy |
|-----------|----------|--------------|
| `['notes', notebookId]` | `GET /api/v1/notebooks/:id/notes` | Invalidated (refetchType: none) from note detail; active refetch only from notebook detail page |
| `['note', notebookId, noteId]` | `GET /api/v1/notebooks/:id/notes/:id` | Invalidated immediately after title update / attachment delete |
| `['file', fileSrcId]` | `GET /api/v1/files/:id` | staleTime: Infinity (immutable) |

---

## Decision: Route Order in App.jsx

Note routes must be added in this order to prevent `create` from matching as `:noteId`:

1. `/notebooks/:notebookId/notes/create` (static segment — more specific)
2. `/notebooks/:notebookId/notes/:noteId` (dynamic segment — less specific)

Both routes use the same `ProtectedRoute` wrapper pattern as existing notebook routes.
`f7navigate` utility is used for programmatic navigation (same as feature 003).

---

## Decision: client.js New Helpers

Two new helpers added to `src/api/client.js`:

- `getBlob(path)`: Fetches with `Authorization` header, returns a `Blob` (uses
  `response.blob()` instead of `response.json()`). Handles 401 identically to `get()`.
- `postForm(path, formData)`: Sends a `multipart/form-data` POST with `Authorization`
  header. Does NOT set `Content-Type` (let the browser set it with the boundary).
  Returns `response.json()` on success. Handles 401 identically to `post()`.

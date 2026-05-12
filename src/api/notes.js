import { get, post, patch, del, postForm } from './client'

export const listNotes = (notebookId, params = {}) => {
  const query = new URLSearchParams()
  if (params.content) query.set('content', params.content)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.tags?.length) params.tags.forEach((t) => query.append('tags', t))
  const qs = query.toString()
  return get(`/api/v1/notebooks/${notebookId}/notes${qs ? `?${qs}` : ''}`)
}

export const createNote = (notebookId, payload) =>
  post(`/api/v1/notebooks/${notebookId}/notes`, payload)

export const getNote = (notebookId, noteId) =>
  get(`/api/v1/notebooks/${notebookId}/notes/${noteId}`)

export const updateNote = (notebookId, noteId, payload) =>
  patch(`/api/v1/notebooks/${notebookId}/notes/${noteId}`, payload)

export const deleteNote = (notebookId, noteId) =>
  del(`/api/v1/notebooks/${notebookId}/notes/${noteId}`)

export const uploadAttachment = (notebookId, noteId, formData) =>
  postForm(`/api/v1/notebooks/${notebookId}/notes/${noteId}/attachments`, formData)

export const deleteAttachment = (notebookId, noteId, attachId) =>
  del(`/api/v1/notebooks/${notebookId}/notes/${noteId}/attachments/${attachId}`)

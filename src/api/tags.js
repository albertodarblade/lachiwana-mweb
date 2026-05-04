import { post, patch, del } from './client'

export const addTag = (notebookId, payload) =>
  post(`/api/v1/notebooks/${notebookId}/tags`, payload)

export const updateTag = (notebookId, tagId, payload) =>
  patch(`/api/v1/notebooks/${notebookId}/tags/${tagId}`, payload)

export const deleteTag = (notebookId, tagId) =>
  del(`/api/v1/notebooks/${notebookId}/tags/${tagId}`)

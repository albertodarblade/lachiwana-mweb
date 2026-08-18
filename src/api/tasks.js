import { get, post, patch, del, postForm } from './client'

export const listTasks = (notebookId, params = {}) => {
  const query = new URLSearchParams()
  if (params.isCompleted != null) query.set('isCompleted', params.isCompleted)
  if (params.parentTaskId) query.set('parentTaskId', params.parentTaskId)
  if (params.assignedTo) query.set('assignedTo', params.assignedTo)
  if (params.tags?.length) params.tags.forEach((t) => query.append('tags', t))
  const qs = query.toString()
  return get(`/api/v1/notebooks/${notebookId}/tasks${qs ? `?${qs}` : ''}`)
}

export const createTask = (notebookId, payload) =>
  post(`/api/v1/notebooks/${notebookId}/tasks`, payload)

export const getTask = (notebookId, taskId) =>
  get(`/api/v1/notebooks/${notebookId}/tasks/${taskId}`)

export const updateTask = (notebookId, taskId, payload) =>
  patch(`/api/v1/notebooks/${notebookId}/tasks/${taskId}`, payload)

export const deleteTask = (notebookId, taskId) =>
  del(`/api/v1/notebooks/${notebookId}/tasks/${taskId}`)

export const uploadTaskAttachment = (notebookId, taskId, formData) =>
  postForm(`/api/v1/notebooks/${notebookId}/tasks/${taskId}/attachments`, formData)

export const deleteTaskAttachment = (notebookId, taskId, attachId) =>
  del(`/api/v1/notebooks/${notebookId}/tasks/${taskId}/attachments/${attachId}`)

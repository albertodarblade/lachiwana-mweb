import React from 'react'
import { Paperclip, CircleUser } from 'lucide-react'
import TagChip from '../notebooks/TagChip'
import CheckBox from '../CheckBox/CheckBox'
import { navigate } from '../../utils/f7navigate'
import styles from './TaskCard.module.css'

export default function TaskCard({ task, tags = [], members = [], onToggleComplete, depth = 0, className, exiting, entering, notebookId }) {
  const { id, title, isCompleted, attachments = [], assignedTo, tags: taskTagIds = [], parentTaskId } = task
  const pending = task._pending === true

  const resolvedTags = taskTagIds
    .map((tagId) => tags.find((t) => (t.id ?? t._id) === tagId))
    .filter(Boolean)

  const assignee = assignedTo
    ? members.find((m) => m.googleId === assignedTo)
    : null

  const attachmentCount = attachments?.length ?? 0

  function handleCardClick(e) {
    if (pending) return
    if (e.target.closest('button')) return
    if (!notebookId) return
    if (parentTaskId) {
      navigate(`/notebooks/${notebookId}/tasks/${parentTaskId}/childTask/${id}`)
    } else {
      navigate(`/notebooks/${notebookId}/tasks/${id}`)
    }
  }

  return (
    <div
      className={`${styles.card}${pending ? ` ${styles.pending}` : ''}${className ? ` ${className}` : ''}${exiting ? ` ${styles.exiting}` : ''}${entering ? ` ${styles.entering}` : ''}`}
      style={depth > 0 ? { paddingLeft: 16 + depth * 24 } : undefined}
      onClick={handleCardClick}
      data-testid={`task-card-${id}`}
    >
      <CheckBox
        checked={isCompleted}
        disabled={pending}
        data-testid={`task-toggle-${id}`}
        onClick={(next) => onToggleComplete(id, next)}
      />

      <div className={styles.content}>
        <p className={`${styles.title}${isCompleted ? ` ${styles.titleCompleted}` : ''}`}>
          {title}
        </p>
        <div className={styles.meta}>
          {resolvedTags.length > 0 && (
            <div className={styles.tags}>
              {resolvedTags.map((tag) => (
                <TagChip key={tag.id ?? tag._id} tag={tag} />
              ))}
            </div>
          )}
          {attachmentCount > 0 && (
            <span className={styles.attachBadge}>
              <Paperclip size={12} />
              {attachmentCount}
            </span>
          )}
          {assignee && (
            <span className={styles.assignee}>
              {assignee.picture ? (
                <img src={assignee.picture} alt="" className={styles.assigneeAvatar} />
              ) : (
                <CircleUser size={14} className={styles.assigneeFallback} />
              )}
              {assignee.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

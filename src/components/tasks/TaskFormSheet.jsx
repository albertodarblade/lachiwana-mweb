import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Tag, Paperclip, ListChecks, User, Plus, X, CircleUser } from 'lucide-react'
import {
  Sheet, PageContent, Block, Button, Badge, Link, f7,
} from 'framework7-react'
import { createTask, uploadTaskAttachment } from '../../api/tasks'
import { useUsers } from '../../hooks/useUsers'
import queryClient from '../../queryClient'
import TagChip from '../notebooks/TagChip'
import PendingAttachmentItem from './PendingAttachmentItem'
import { prepareFileForUpload } from '../../utils/compressImage'
import styles from './TaskFormSheet.module.css'

export default function TaskFormSheet({
  opened,
  notebookId,
  notebookOwner,
  notebookMembers = [],
  notebookTags = [],
  onClose,
  onSuccess,
}) {
  const [title, setTitle] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState(new Set())
  const [assignedTo, setAssignedTo] = useState(null)
  const [showTags, setShowTags] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [showChildInput, setShowChildInput] = useState(false)
  const [showAssignee, setShowAssignee] = useState(false)
  const [childTitles, setChildTitles] = useState([])
  const [childInput, setChildInput] = useState('')
  const [pendingFiles, setPendingFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleRef = useRef(null)
  const fileInputRef = useRef(null)
  const childInputRef = useRef(null)

  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []

  const memberIds = [notebookOwner, ...notebookMembers].filter(Boolean)
  const members = allUsers.filter((u) => memberIds.includes(u.googleId))

  useEffect(() => {
    if (opened) {
      setTitle('')
      setSelectedTagIds(new Set())
      setAssignedTo(null)
      setShowTags(false)
      setShowAttachments(false)
      setShowChildInput(false)
      setShowAssignee(false)
      setChildTitles([])
      setChildInput('')
      setPendingFiles([])
      setIsSubmitting(false)
      const timer = setTimeout(() => titleRef.current?.focus(), 350)
      return () => clearTimeout(timer)
    }
  }, [opened])

  useEffect(() => {
    if (showChildInput) {
      const timer = setTimeout(() => childInputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [showChildInput])

  function toggleTag(tagId) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }
      return next
    })
  }

  function handleAddChild() {
    const trimmed = childInput.trim()
    if (!trimmed) return
    setChildTitles((prev) => [...prev, trimmed])
    setChildInput('')
    childInputRef.current?.focus()
  }

  function handleChildKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChild()
    }
  }

  function handleRemoveChild(index) {
    setChildTitles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    try {
      const prepared = await prepareFileForUpload(file)
      setPendingFiles((prev) => [...prev, prepared])
    } catch (err) {
      f7.toast.create({ text: err.message, closeTimeout: 3500, position: 'top' }).open()
    }
  }

  function handleRemovePendingFile(index) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = useCallback(async () => {
    const trimmed = title.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      const tagIds = [...selectedTagIds].filter(Boolean)
      const taskRes = await createTask(notebookId, {
        title: trimmed,
        ...(tagIds.length && { tags: tagIds }),
        ...(assignedTo && { assignedTo }),
      })
      const taskId = taskRes?.data?.id ?? taskRes?.id

      if (taskId) {
        for (const childTitle of childTitles) {
          await createTask(notebookId, {
            title: childTitle,
            parentTaskId: taskId,
          })
        }

        for (const file of pendingFiles) {
          const formData = new FormData()
          formData.append('file', file, file.name)
          await uploadTaskAttachment(notebookId, taskId, formData)
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tasks', notebookId] })
      onSuccess()
    } catch (err) {
      f7.toast.create({
        text: err?.message ?? 'Error al guardar la tarea. Intenta de nuevo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    } finally {
      setIsSubmitting(false)
    }
  }, [title, isSubmitting, selectedTagIds, assignedTo, notebookId, childTitles, pendingFiles, onSuccess])

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasContent = title.trim().length > 0

  return (
    <Sheet
      opened={opened}
      onSheetClosed={onClose}
      backdrop
      style={{ height: 'auto' }}
    >
      <PageContent className={styles.pageContent}>
        <div className={styles.dragHandle} />

        <div className={styles.titleRow}>
          <input
            ref={titleRef}
            type="text"
            className={styles.titleInput}
            placeholder="Título de la tarea"
            value={title}
            onInput={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            disabled={isSubmitting}
            data-testid="task-title-input"
          />
        </div>

        <div className={styles.iconButtonsRow}>
          {notebookTags.length > 0 && (
            <button
              className={`${styles.iconBtn}${showTags ? ` ${styles.iconBtnActive}` : ''}`}
              onClick={() => { setShowTags((v) => !v); setShowAttachments(false); setShowChildInput(false); setShowAssignee(false) }}
              data-testid="task-btn-tags"
            >
              <span className={styles.iconWrap}>
                <Tag size={20} />
                {selectedTagIds.size > 0 && <Badge color="primary" className={styles.iconBadge}>{selectedTagIds.size}</Badge>}
              </span>
            </button>
          )}
          <button
            className={`${styles.iconBtn}${showAttachments ? ` ${styles.iconBtnActive}` : ''}`}
            onClick={() => { setShowAttachments((v) => !v); setShowTags(false); setShowChildInput(false); setShowAssignee(false) }}
            data-testid="task-btn-attachments"
          >
            <span className={styles.iconWrap}>
              <Paperclip size={20} />
              {pendingFiles.length > 0 && <Badge color="primary" className={styles.iconBadge}>{pendingFiles.length}</Badge>}
            </span>
          </button>
          <button
            className={`${styles.iconBtn}${showChildInput ? ` ${styles.iconBtnActive}` : ''}`}
            onClick={() => { setShowChildInput((v) => !v); setShowTags(false); setShowAttachments(false); setShowAssignee(false) }}
            data-testid="task-btn-child-tasks"
          >
            <span className={styles.iconWrap}>
              <ListChecks size={20} />
              {childTitles.length > 0 && <Badge color="primary" className={styles.iconBadge}>{childTitles.length}</Badge>}
            </span>
          </button>
          <button
            className={`${styles.iconBtn}${showAssignee ? ` ${styles.iconBtnActive}` : ''}`}
            onClick={() => { setShowAssignee((v) => !v); setShowTags(false); setShowAttachments(false); setShowChildInput(false) }}
            data-testid="task-btn-assignee"
          >
            <span className={styles.iconWrap}>
              <User size={20} />
              {assignedTo && <Badge color="primary" className={styles.iconBadge}>1</Badge>}
            </span>
          </button>
        </div>

        {showTags && notebookTags.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Etiquetas</p>
            <div className={styles.tagsRow}>
              {notebookTags.map((tag) => {
                const tagId = tag.id ?? tag._id
                const isSelected = selectedTagIds.has(tagId)
                return (
                  <span
                    key={tagId}
                    className={styles.tagChipInline}
                    style={isSelected ? { outline: '2px solid var(--f7-theme-color)', outlineOffset: '1px' } : undefined}
                    onClick={() => toggleTag(tagId)}
                    data-testid={`task-tag-${tagId}`}
                  >
                    <TagChip tag={tag} />
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {showAttachments && (
          <div className={styles.attachmentsSection}>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.fileInput}
              onChange={handleFileSelect}
              data-testid="task-file-input"
            />
            <Button
              small
              outline
              onClick={() => fileInputRef.current?.click()}
              data-testid="task-attachment-add"
            >
              <Paperclip size={13} style={{ marginRight: 4 }} />
              Agregar archivo
            </Button>
            {pendingFiles.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {pendingFiles.map((file, i) => (
                  <PendingAttachmentItem
                    key={`${file.name}-${i}`}
                    file={file}
                    onRemove={() => handleRemovePendingFile(i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {showChildInput && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Subtareas</p>
            <div className={styles.childInputRow}>
              <input
                ref={childInputRef}
                type="text"
                className={styles.childInput}
                placeholder="Nueva subtarea..."
                value={childInput}
                onInput={(e) => setChildInput(e.target.value)}
                onKeyDown={handleChildKeyDown}
                disabled={isSubmitting}
                data-testid="task-child-input"
              />
              <button
                className={styles.childAddBtn}
                onClick={handleAddChild}
                disabled={!childInput.trim()}
                data-testid="task-child-add"
              >
                <Plus size={16} />
              </button>
            </div>
            {childTitles.length > 0 && (
              <ul className={styles.childList}>
                {childTitles.map((ct, i) => (
                  <li key={`${ct}-${i}`} className={styles.childItem}>
                    <button
                      className={styles.childRemoveBtn}
                      onClick={() => handleRemoveChild(i)}
                      data-testid={`task-child-remove-${i}`}
                    >
                      <X size={14} />
                    </button>
                    <p className={styles.childItemText}>{ct}</p>

                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showAssignee && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Asignar a</p>
            <div className={styles.membersRow}>
              {members.map((member) => {
                const isSelected = assignedTo === member.googleId
                return (
                  <button
                    key={member.googleId}
                    className={`${styles.memberChip}${isSelected ? ` ${styles.memberChipSelected}` : ''}`}
                    onClick={() => setAssignedTo(isSelected ? null : member.googleId)}
                    data-testid={`task-member-${member.googleId}`}
                  >
                    {member.picture ? (
                      <img src={member.picture} alt="" className={styles.memberAvatar} />
                    ) : (
                      <CircleUser size={28} className={styles.memberFallback} />
                    )}
                    <span className={styles.memberName}>{member.name}</span>
                  </button>
                )
              })}
              {members.length === 0 && (
                <p className={styles.emptyMembers}>Sin miembros</p>
              )}
            </div>
          </div>
        )}

        <Block className={styles.submitSection}>
          <Button
            large
            fill
            disabled={isSubmitting || !hasContent}
            onClick={handleSubmit}
            className={styles.submitBtn}
            data-testid="task-submit"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}

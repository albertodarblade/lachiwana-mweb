import { useState, useEffect, useRef, useCallback } from 'react'
import { Paperclip, EllipsisVertical, CircleUser, Plus, X, ListChecks } from 'lucide-react'
import { Circle, Check } from 'lucide'
import { MorphIcon } from 'morphicons/react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Preloader, Block,
  Actions, ActionsGroup, ActionsButton,
  Sheet, PageContent, Button, f7,
} from 'framework7-react'
import { useTask } from '../hooks/useTask'
import { useTasks } from '../hooks/useTasks'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateTask } from '../hooks/useUpdateTask'
import { useDeleteTask } from '../hooks/useDeleteTask'
import { useCreateTask } from '../hooks/useCreateTask'
import { useUsers } from '../hooks/useUsers'
import { uploadTaskAttachment, deleteTaskAttachment } from '../api/tasks'
import TaskAttachmentGallery from '../components/tasks/TaskAttachmentGallery'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import TagChip from '../components/notebooks/TagChip'
import ThemedButton from '../components/notebooks/ThemedButton'
import { navigate } from '../utils/f7navigate'
import { prepareFileForUpload } from '../utils/compressImage'
import styles from './TaskEditPage.module.css'

const DEBOUNCE_MS = 300
const COUNTDOWN_START = 5

export default function TaskEditPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const routeTaskId = f7route?.params?.taskId
  const childTaskId = f7route?.params?.childTaskId
  const isChildView = !!childTaskId
  const taskId = isChildView ? childTaskId : routeTaskId
  const parentTaskId = isChildView ? routeTaskId : null

  const [deleted, setDeleted] = useState(false)
  const { data: task, isLoading, isFetching, isError, fetchStatus } = useTask(notebookId, taskId, { enabled: !deleted })
  const { data: notebook } = useNotebook(notebookId)
  const notebookTags = notebook?.tags ?? []
  const { mutate } = useUpdateTask(notebookId)
  const { mutate: deleteTaskMutation, isPending: isDeleting } = useDeleteTask(notebookId, taskId)

  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []
  const memberIds = [notebook?.owner, ...(notebook?.users ?? [])].filter(Boolean)
  const members = allUsers.filter((u) => memberIds.includes(u.googleId))

  const { data: childTasks = [] } = useTasks(notebookId, { parentTaskId: taskId })
  const { mutate: createChildTask, isPending: isCreatingChild } = useCreateTask(notebookId)

  const [saveStatus, setSaveStatus] = useState('saved')
  const [title, setTitle] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [assignedTo, setAssignedTo] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [memberSheetOpen, setMemberSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('subtasks')
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const [dismissError, setDismissError] = useState(false)
  const [childInput, setChildInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const debounceRef = useRef(null)
  const childInputRef = useRef(null)
  const needsInitRef = useRef(true)
  const intervalRef = useRef(null)

  function handlePageBeforeIn() {
    needsInitRef.current = true
  }

  useEffect(() => {
    if (task && needsInitRef.current) {
      needsInitRef.current = false
      setTitle(task.title ?? '')
      setIsCompleted(task.isCompleted ?? false)
      setSelectedTagIds(task.tags ?? [])
      setAssignedTo(task.assignedTo ?? null)
      setAttachments(task.attachments ?? [])
      setSaveStatus('saved')
    }
  }, [task])

  useEffect(() => {
    if (deleteOpen) {
      setCountdown(COUNTDOWN_START)
      intervalRef.current = setInterval(() => {
        setCountdown((n) => {
          if (n <= 1) { clearInterval(intervalRef.current); return 0 }
          return n - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setCountdown(COUNTDOWN_START)
    }
    return () => clearInterval(intervalRef.current)
  }, [deleteOpen])

  function save(payload) {
    setSaveStatus('saving')
    mutate({ taskId, ...payload }, {
      onSuccess: () => setSaveStatus('saved'),
      onError: () => {
        setSaveStatus('error')
        f7.toast.create({
          text: 'Error al guardar. Intenta de nuevo.',
          closeTimeout: 3000,
          position: 'top',
        }).open()
      },
    })
  }

  function triggerDebounced(payload) {
    setSaveStatus('editing')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(payload), DEBOUNCE_MS)
  }

  function handleTitleChange(e) {
    const val = e.target.value
    setTitle(val)
    triggerDebounced({ title: val.trim() })
  }

  function handleToggleComplete() {
    const next = !isCompleted
    setIsCompleted(next)
    save({ isCompleted: next })
  }

  function handleTagToggle(tagId) {
    setSelectedTagIds((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
      save({ tags: next })
      return next
    })
  }

  function handleAssigneeToggle(googleId) {
    const next = assignedTo === googleId ? null : googleId
    setAssignedTo(next)
    save({ assignedTo: next })
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    try {
      setIsUploading(true)
      setSaveStatus('saving')
      const prepared = await prepareFileForUpload(file)
      const formData = new FormData()
      formData.append('file', prepared, prepared.name)
      const res = await uploadTaskAttachment(notebookId, taskId, formData)
      const newAttachment = res?.data ?? res
      if (newAttachment) {
        setAttachments((prev) => [...prev, newAttachment])
      }
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
      f7.toast.create({
        text: 'Error al subir el archivo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteAttachment(att) {
    try {
      await deleteTaskAttachment(notebookId, taskId, att.id)
      setAttachments((prev) => prev.filter((a) => a.id !== att.id))
    } catch {
      f7.toast.create({
        text: 'Error al eliminar el archivo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    }
  }

  function handleDeleteConfirm() {
    deleteTaskMutation(undefined, {
      onSuccess: () => {
        setDeleted(true)
        setDeleteOpen(false)
        navigate(`/notebooks/${notebookId}/tasks`)
      },
    })
  }

  function handleAddChild() {
    const val = childInput.trim()
    if (!val || isCreatingChild) return
    createChildTask({ title: val, parentTaskId: taskId }, {
      onSuccess: () => {
        setChildInput('')
        f7.toast.create({ text: 'Subtarea creada', closeTimeout: 2000, position: 'bottom' }).open()
      },
      onError: () => {
        f7.toast.create({ text: 'Error al crear subtarea', closeTimeout: 3000, position: 'top' }).open()
      },
    })
  }

  function handleChildKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChild()
    }
  }

  function handleToggleChildComplete(childId, nextCompleted) {
    mutate({ taskId: childId, isCompleted: nextCompleted })
  }

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting ? 'Eliminando...' : 'Eliminar'

  return (
    <>
      <Page onPageBeforeIn={handlePageBeforeIn}>
        <Navbar>
          <NavLeft
            backLink="Atrás"
            backLinkUrl={isChildView ? `/notebooks/${notebookId}/tasks/${parentTaskId}` : undefined}
          />
          <NavTitle>
            <SaveStatusIndicator status={saveStatus} />
          </NavTitle>
          <NavRight>
            <ThemedButton
              variant="icon"
              color={notebook?.color}
              onClick={() => setActionsOpen(true)}
              data-testid="edit-task-actions-open"
            >
              <EllipsisVertical size={20} />
            </ThemedButton>
          </NavRight>
        </Navbar>

        {isError && !task && (
          <div className={styles.loadingBackdrop}>
            <div style={{ background: 'white', borderRadius: 12, padding: '2rem', maxWidth: 300, textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px' }}>Error al cargar la tarea.</p>
              <Button onClick={() => window.location.reload()} style={{ marginTop: 8 }}>Reintentar</Button>
            </div>
          </div>
        )}

        {fetchStatus === 'paused' && !task && (
          <div className={styles.loadingBackdrop}>
            <p style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Sin conexión — no hay datos guardados.</p>
          </div>
        )}
        {(isLoading || isFetching) && !task && fetchStatus !== 'paused' && (
          <div className={styles.loadingBackdrop}>
            <Preloader size={44} color="white" />
          </div>
        )}

        {isError && task && !dismissError && (
          <div className={styles.errorBanner}>
            <span>Error al cargar. Mostrando datos guardados.</span>
            <span className={styles.errorBannerDismiss} onClick={() => setDismissError(true)}>×</span>
          </div>
        )}

        {task && (
          <div className={styles.titleRow}>
            <button
              className={`${styles.checkbox}${isCompleted ? ` ${styles.checkboxChecked}` : ''}`}
              onClick={handleToggleComplete}
              data-testid="edit-task-toggle"
            >
              <MorphIcon
                icon={isCompleted ? Check : Circle}
                size={24}
                strokeWidth={2}
                spring="smooth"
                className={styles.morphIcon}
              />
            </button>
            <input
              type="text"
              className={styles.titleInputInline}
              placeholder="Título de la tarea"
              value={title}
              onInput={handleTitleChange}
              data-testid="edit-task-title"
            />
          </div>
        )}

        {task && (
          <>
            <div className={styles.tagsRow}>
              {notebookTags.map((tag) => {
                const tagId = tag.id ?? tag._id
                const isSelected = selectedTagIds.includes(tagId)
                return (
                  <span
                    key={tagId}
                    className={styles.tagChipInline}
                    style={isSelected ? { outline: '2px solid var(--f7-theme-color)', outlineOffset: '1px' } : undefined}
                    onClick={() => handleTagToggle(tagId)}
                    data-testid={`edit-task-tag-${tagId}`}
                  >
                    <TagChip tag={tag} color={isSelected ? undefined : 'var(--f7-list-item-subtitle-text-color)'} />
                  </span>
                )
              })}
            </div>

            {members.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Asignado a</div>
                <div className={styles.tagsRow}>
                  {assignedTo ? (
                    <button
                      className={`${styles.memberChip}`}
                      onClick={() => setMemberSheetOpen(true)}
                      data-testid="edit-task-assigned-chip"
                    >
                      {(() => {
                        const m = members.find((mem) => mem.googleId === assignedTo)
                        return m?.picture ? (
                          <img src={m.picture} alt="" className={styles.memberAvatar} />
                        ) : (
                          <CircleUser size={20} />
                        )
                      })()}
                      {members.find((m) => m.googleId === assignedTo)?.name ?? assignedTo}
                    </button>
                  ) : (
                    <button
                      className={styles.addAttachmentBtn}
                      onClick={() => setMemberSheetOpen(true)}
                      data-testid="edit-task-assign-btn"
                    >
                      <CircleUser size={16} />
                      Asignar persona
                    </button>
                  )}
                </div>

                <Sheet
                  opened={memberSheetOpen}
                  onSheetClosed={() => setMemberSheetOpen(false)}
                  style={{ height: 'auto' }}
                  swipeToClose
                  backdrop
                >
                  <PageContent style={{ padding: '16px 16px 32px' }}>
                    <div className={styles.sectionLabel} style={{ padding: '0 0 12px' }}>Asignar a</div>
                    <div className={styles.membersRow}>
                      {members.map((member) => {
                        const isSelected = assignedTo === member.googleId
                        return (
                          <button
                            key={member.googleId}
                            className={`${styles.memberChip}${isSelected ? ` ${styles.memberChipActive}` : ''}`}
                            onClick={() => { handleAssigneeToggle(member.googleId); setMemberSheetOpen(false) }}
                            data-testid={`edit-task-member-${member.googleId}`}
                          >
                            {member.picture ? (
                              <img src={member.picture} alt="" className={styles.memberAvatar} />
                            ) : (
                              <CircleUser size={20} />
                            )}
                            {member.name}
                          </button>
                        )
                      })}
                    </div>
                    {assignedTo && (
                      <button
                        className={styles.removeMemberBtn}
                        onClick={() => { handleAssigneeToggle(assignedTo); setMemberSheetOpen(false) }}
                        data-testid="edit-task-unassign"
                      >
                        Quitar asignación
                      </button>
                    )}
                  </PageContent>
                </Sheet>
              </>
            )}

            {!isChildView && (
              <div className={styles.tabBar}>
                <button
                  className={`${styles.tabBtn}${activeTab === 'subtasks' ? ` ${styles.tabBtnActive}` : ''}`}
                  onClick={() => setActiveTab('subtasks')}
                  data-testid="edit-task-tab-subtasks"
                >
                  <ListChecks size={18} />
                  <span>Subtareas</span>
                  {childTasks.length > 0 && <span className={styles.tabBadge}>{childTasks.length}</span>}
                </button>
                <button
                  className={`${styles.tabBtn}${activeTab === 'attachments' ? ` ${styles.tabBtnActive}` : ''}`}
                  onClick={() => setActiveTab('attachments')}
                  data-testid="edit-task-tab-attachments"
                >
                  <Paperclip size={18} />
                  <span>Archivos</span>
                  {attachments.length > 0 && <span className={styles.tabBadge}>{attachments.length}</span>}
                </button>
              </div>
            )}

            {activeTab === 'subtasks' && (
                  <div className={styles.childTasksSection}>
                    {!isChildView && (
                      <div className={styles.childInputRow}>
                        <input
                          ref={childInputRef}
                          type="text"
                          className={styles.childInput}
                          placeholder="Nueva subtarea..."
                          value={childInput}
                          onInput={(e) => setChildInput(e.target.value)}
                          onKeyDown={handleChildKeyDown}
                          disabled={isCreatingChild}
                          data-testid="edit-task-child-input"
                        />
                        <button
                          className={styles.childAddBtn}
                          onClick={handleAddChild}
                          disabled={!childInput.trim() || isCreatingChild}
                          data-testid="edit-task-child-add"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                    {childTasks.length > 0 && (
                      <div className={styles.childTasksList}>
                        {childTasks.map((child) => {
                          const childTags = (child.tags ?? [])
                            .map((tagId) => notebookTags.find((t) => (t.id ?? t._id) === tagId))
                            .filter(Boolean)
                          const childAssignee = child.assignedTo
                            ? members.find((m) => m.googleId === child.assignedTo)
                            : null
                          const childAttCount = child.attachments?.length ?? 0
                          return (
                            <div
                              key={child.id}
                              className={styles.childTaskRow}
                              onClick={() => navigate(`/notebooks/${notebookId}/tasks/${taskId}/childTask/${child.id}`)}
                            >
                              <button
                                className={`${styles.childCheckbox}${child.isCompleted ? ` ${styles.childCheckboxChecked}` : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleToggleChildComplete(child.id, !child.isCompleted) }}
                              >
                                <MorphIcon
                                  icon={child.isCompleted ? Check : Circle}
                                  size={16}
                                  strokeWidth={2}
                                  spring="smooth"
                                  className={styles.childMorphIcon}
                                />
                              </button>
                              <div className={styles.childContent}>
                                <span className={`${styles.childTitle}${child.isCompleted ? ` ${styles.childTitleCompleted}` : ''}`}>
                                  {child.title}
                                </span>
                                <div className={styles.childMeta}>
                                  {childTags.length > 0 && (
                                    <div className={styles.childTags}>
                                      {childTags.map((tag) => (
                                        <TagChip key={tag.id ?? tag._id} tag={tag} />
                                      ))}
                                    </div>
                                  )}
                                  {childAttCount > 0 && (
                                    <span className={styles.childAttachBadge}>
                                      <Paperclip size={12} />
                                      {childAttCount}
                                    </span>
                                  )}
                                  {childAssignee && (
                                    <span className={styles.childAssignee}>
                                      {childAssignee.picture ? (
                                        <img src={childAssignee.picture} alt="" className={styles.childAssigneeAvatar} />
                                      ) : (
                                        <CircleUser size={14} />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
              </div>
            )}

            {(isChildView || activeTab === 'attachments') && (
              <TaskAttachmentGallery
                attachments={attachments}
                onFileChange={handleFileUpload}
                onDelete={handleDeleteAttachment}
                isUploading={isUploading}
              />
            )}
          </>
        )}

        <>
          <Actions opened={actionsOpen} onActionsClosed={() => setActionsOpen(false)}>
            <ActionsGroup>
              <ActionsButton
                color="red"
                onClick={() => { setActionsOpen(false); setDeleteOpen(true) }}
                data-testid="edit-task-delete-action"
              >
                Eliminar tarea
              </ActionsButton>
            </ActionsGroup>
            <ActionsGroup>
              <ActionsButton bold onClick={() => setActionsOpen(false)}>
                Cancelar
              </ActionsButton>
            </ActionsGroup>
          </Actions>

          <Sheet
            opened={deleteOpen}
            onSheetClosed={() => setDeleteOpen(false)}
            style={{ height: 'auto' }}
            swipeToClose={false}
            backdrop
          >
            <PageContent className={styles.deletePageContent}>
              <Block className={styles.deleteBlock}>
                <h3 className={styles.deleteHeading}>Eliminar Tarea</h3>
                <p className={styles.deleteBody}>
                  ¿Eliminar esta tarea y todas sus subtareas? Esta acción no se puede deshacer.
                </p>
              </Block>

              <Button
                large fill color="red"
                disabled={countdown > 0 || isDeleting}
                onClick={handleDeleteConfirm}
                className={styles.confirmButton}
                data-testid="edit-task-delete-confirm"
              >
                {confirmLabel}
              </Button>

              <Button
                large outline
                disabled={isDeleting}
                onClick={() => setDeleteOpen(false)}
                data-testid="edit-task-delete-cancel"
              >
                Cancelar
              </Button>
            </PageContent>
          </Sheet>
        </>
      </Page>
    </>
  )
}

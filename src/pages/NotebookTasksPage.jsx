import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle,
  Block, Preloader, Fab, Icon,
} from 'framework7-react'
import { CheckSquare } from 'lucide-react'
import { LUCIDE_ICONS } from '../components/IconSelector/lucideIcons'
import { useNotebook } from '../hooks/useNotebook'
import { useTasks } from '../hooks/useTasks'
import { useUpdateTask } from '../hooks/useUpdateTask'
import { useUsers } from '../hooks/useUsers'
import TaskCard from '../components/tasks/TaskCard'
import TaskEmptyState from '../components/tasks/TaskEmptyState'
import TaskFormSheet from '../components/tasks/TaskFormSheet'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookTasksPage.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function NotebookTasksPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isPending, isError, fetchStatus } = useNotebook(id)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const { data: allTasks = [], isLoading: tasksLoading, fetchStatus: tasksFetchStatus } = useTasks(id)
  const { mutate: updateTask } = useUpdateTask(id)

  const [transitions, setTransitions] = useState({})
  const timersRef = useRef({})

  const handleToggleComplete = useCallback((taskId, nextCompleted) => {
    const task = allTasks.find((t) => t.id === taskId)
    const isChild = task?.parentTaskId

    if (isChild) {
      updateTask({ taskId, isCompleted: nextCompleted })
      return
    }

    const phase1 = { [taskId]: 'exit' }
    setTransitions((prev) => ({ ...prev, ...phase1 }))

    if (timersRef.current[taskId]) clearTimeout(timersRef.current[taskId])
    timersRef.current[taskId] = setTimeout(() => {
      setTransitions((prev) => {
        const next = { ...prev }
        next[taskId] = 'enter'
        return next
      })

      timersRef.current[taskId] = setTimeout(() => {
        setTransitions((prev) => {
          const next = { ...prev }
          delete next[taskId]
          return next
        })
        delete timersRef.current[taskId]
      }, 300)
    }, 300)

    setTimeout(() => {
      updateTask({ taskId, isCompleted: nextCompleted })
      if (nextCompleted) {
        const descendantIds = getDescendantIds(taskId)
        descendantIds.forEach((childId) => {
          updateTask({ taskId: childId, isCompleted: true })
        })
      }
    }, 300)
  }, [allTasks, updateTask])

  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []
  const memberIds = [notebook?.owner, ...(notebook?.users ?? [])].filter(Boolean)
  const members = allUsers.filter((u) => memberIds.includes(u.googleId))

  const notebookTags = notebook?.tags ?? []

  const { rootTasks, completedTasks, childrenMap } = useMemo(() => {
    const map = {}
    allTasks.forEach((t) => {
      if (t.parentTaskId) {
        if (!map[t.parentTaskId]) map[t.parentTaskId] = []
        map[t.parentTaskId].push(t)
      }
    })
    const root = allTasks.filter((t) => !t.parentTaskId && !t.isCompleted)
    const completed = allTasks.filter((t) => !t.parentTaskId && t.isCompleted)
    return { rootTasks: root, completedTasks: completed, childrenMap: map }
  }, [allTasks])

  function getDescendantIds(parentId) {
    const ids = []
    const queue = [parentId]
    while (queue.length > 0) {
      const current = queue.shift()
      allTasks.forEach((t) => {
        if (t.parentTaskId === current && !t.isCompleted) {
          ids.push(t.id)
          queue.push(t.id)
        }
      })
    }
    return ids
  }



  if (isPending && fetchStatus === 'paused') {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.loadingBlock}>
          <p>Sin conexión — no hay datos guardados.</p>
        </Block>
      </Page>
    )
  }

  if (isLoading) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.loadingBlock}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  if (isError || !notebook) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.errorBlock}>
          <p className={styles.notFoundText}>Cuaderno no encontrado.</p>
          <span className={styles.backLink} onClick={() => navigateBack()}>
            Volver al inicio
          </span>
        </Block>
      </Page>
    )
  }

  const navbarColor = notebook.color ?? 'var(--f7-theme-color)'
  const isEmpty = allTasks.length === 0

  function renderTaskGroup(tasks, depth = 0) {
    return tasks.map((task) => (
      <React.Fragment key={task.id}>
        <TaskCard
          task={task}
          tags={notebookTags}
          members={members}
          onToggleComplete={handleToggleComplete}
          depth={depth}
          className={depth > 0 ? styles.childTask : undefined}
          exiting={transitions[task.id] === 'exit'}
          entering={transitions[task.id] === 'enter'}
          notebookId={id}
        />
        {childrenMap[task.id]?.length > 0 && renderTaskGroup(childrenMap[task.id], depth + 1)}
      </React.Fragment>
    ))
  }

  return (
    <Page>
      <Navbar>
        <NavLeft backLink="Atrás" backLinkUrl="/" backLinkForce />
        <NavTitle>
          <div
            className={styles.navTitleInner}
            onClick={() => navigate(`/notebooks/${id}/edit`)}
            data-testid="tasks-notebook-edit"
          >
            <div
              className={styles.iconContainer}
              style={{ '--icon-color': navbarColor }}
            >
              {(() => { const Icon = notebook.iconName ? (lucideMap[notebook.iconName] ?? CheckSquare) : CheckSquare; return <Icon size={20} className={styles.navIcon} /> })()}
            </div>
            <span className={styles.navTitleText}>{notebook.title}</span>
          </div>
        </NavTitle>
      </Navbar>

      {tasksLoading && tasksFetchStatus !== 'paused' && (
        <Block className={styles.loadingBlock}>
          <Preloader size={44} />
        </Block>
      )}

      {!tasksLoading && isEmpty && <TaskEmptyState />}

      {!tasksLoading && !isEmpty && (
        <div className={styles.list}>
          {rootTasks.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Tareas</span>
                <span className={styles.sectionCount}>{rootTasks.length}</span>
              </div>
              {renderTaskGroup(rootTasks)}
            </>
          )}

          {completedTasks.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Tareas completadas</span>
                <span className={styles.sectionCount}>{completedTasks.length}</span>
              </div>
              {renderTaskGroup(completedTasks)}
            </>
          )}
        </div>
      )}

      <Fab
        position="right-bottom"
        text="Nueva Tarea"
        onClick={() => setIsSheetOpen(true)}
        data-testid="task-create-fab"
        style={{
          '--f7-fab-bg-color': navbarColor,
          '--f7-fab-pressed-bg-color': navbarColor,
          '--f7-fab-text-color': '#fff',
          '--f7-glass-shadow-fab': '0 2px 8px rgba(0,0,0,0.28)',
          '--f7-touch-ripple-color': 'rgba(255,255,255,0.25)',
        }}
      >
        <Icon ios="f7:plus" md="material:add" />
      </Fab>

      <TaskFormSheet
        opened={isSheetOpen}
        notebookId={id}
        notebookOwner={notebook.owner}
        notebookMembers={notebook.users ?? []}
        notebookTags={notebook.tags ?? []}
        onClose={() => setIsSheetOpen(false)}
        onSuccess={() => setIsSheetOpen(false)}
      />
    </Page>
  )
}

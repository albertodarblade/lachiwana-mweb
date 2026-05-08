import React, { useState, useRef } from 'react'
import { Page, Navbar, NavLeft, NavTitle, f7 } from 'framework7-react'
import { useCreateNote } from '../hooks/useCreateNote'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import { getNote, uploadAttachment, deleteAttachment } from '../api/notes'
import { prepareFileForUpload } from '../utils/compressImage'
import NoteEditor from '../components/notes/NoteEditor'
import NoteEditorHeader from '../components/notes/NoteEditorHeader'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import queryClient from '../queryClient'

const DEBOUNCE_MS = 800

export default function CreateNoteEditorPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId

  const [noteId, setNoteId] = useState(null)
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [saveStatus, setSaveStatus] = useState('saved')
  const [createdAt, setCreatedAt] = useState(null)

  const contentRef = useRef('')
  const debounceRef = useRef(null)
  const noteIdRef = useRef(null)
  const isCreatingRef = useRef(false)

  const { mutateAsync: createNote } = useCreateNote(notebookId)

  const updateMutation = useUpdateNote(notebookId, noteId)
  const updateMutateRef = useRef(null)
  updateMutateRef.current = updateMutation.mutate

  const deleteMutation = useDeleteNote(notebookId, noteId)
  const deleteMutateRef = useRef(null)
  deleteMutateRef.current = deleteMutation.mutate

  function handleContentChange(markdown) {
    contentRef.current = markdown
    setSaveStatus('editing')
    clearTimeout(debounceRef.current)

    if (!noteIdRef.current) {
      if (isCreatingRef.current) return
      isCreatingRef.current = true
      setSaveStatus('saving')
      createNote({ title: markdown, tags: selectedTagIds })
        .then((result) => {
          const id = result?.data?.id
          if (id) {
            noteIdRef.current = id
            setNoteId(id)
            setCreatedAt(result?.data?.createdAt ?? new Date().toISOString())
            const latest = contentRef.current
            if (latest !== markdown) {
              clearTimeout(debounceRef.current)
              debounceRef.current = setTimeout(() => {
                debounceRef.current = null
                setSaveStatus('saving')
                updateMutateRef.current?.(
                  { title: latest },
                  { onSuccess: () => setSaveStatus('saved'), onError: () => setSaveStatus('error') }
                )
              }, 0)
            } else {
              setSaveStatus('saved')
            }
          }
        })
        .catch(() => setSaveStatus('error'))
        .finally(() => { isCreatingRef.current = false })
      return
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      setSaveStatus('saving')
      updateMutateRef.current?.(
        { title: contentRef.current },
        { onSuccess: () => setSaveStatus('saved'), onError: () => setSaveStatus('error') }
      )
    }, DEBOUNCE_MS)
  }

  function handleTagsConfirm(newTagIds) {
    setSelectedTagIds(newTagIds)
    if (noteIdRef.current) {
      updateMutateRef.current?.({ tags: newTagIds })
    }
  }

  async function handleImageUpload(file) {
    if (!noteIdRef.current) {
      f7.toast.create({
        text: 'Escribe algo antes de insertar imágenes.',
        closeTimeout: 2500,
        position: 'top',
      }).open()
      throw new Error('Note not yet created')
    }
    const prepared = await prepareFileForUpload(file)
    const formData = new FormData()
    formData.append('file', prepared, file.name)
    const result = await uploadAttachment(notebookId, noteIdRef.current, formData)
    await queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteIdRef.current] })
    return result?.data?.fileSrcId ?? ''
  }

  async function handleDeleteImage(fileSrcId) {
    const id = noteIdRef.current
    if (!id) return
    const fresh = await getNote(notebookId, id)
    const attachment = fresh?.data?.attachments?.find(a => a.fileSrcId === fileSrcId)
    if (!attachment) return
    await deleteAttachment(notebookId, id, attachment.id)
    await queryClient.invalidateQueries({ queryKey: ['note', notebookId, id] })
  }

  function flushAndCleanup() {
    if (!debounceRef.current) return
    clearTimeout(debounceRef.current)
    debounceRef.current = null
    const id = noteIdRef.current
    if (!id) return
    const content = contentRef.current
    if (!content.trim()) {
      deleteMutateRef.current?.()
    } else {
      updateMutateRef.current?.({ title: content })
    }
  }

  return (
    <Page pageContent={false} onPageBeforeOut={flushAndCleanup}>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle><SaveStatusIndicator status={saveStatus} /></NavTitle>
      </Navbar>
      <div className="note-editor-layout">
        <NoteEditorHeader
          notebookId={notebookId}
          selectedTagIds={selectedTagIds}
          onTagsConfirm={handleTagsConfirm}
          createdAt={createdAt}
        />
        <NoteEditor
          initialContent=""
          onContentChange={handleContentChange}
          imageUploadHandler={handleImageUpload}
          onDeleteImage={handleDeleteImage}
          autoFocus
        />
      </div>
    </Page>
  )
}

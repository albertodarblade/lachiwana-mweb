import React, { useState, useRef, useEffect } from 'react'
import { Sheet, PageContent, List, ListInput, Button, Block, f7 } from 'framework7-react'
import { useCreateNote, uploadAttachmentsSequentially } from '../../hooks/useCreateNote'

export default function CreateNotePopup({ notebookId, opened, onClose }) {
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState(false)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const titleContainerRef = useRef(null)

  const { mutateAsync: createNote } = useCreateNote(notebookId)

  useEffect(() => {
    if (!opened) return
    const timer = setTimeout(() => {
      titleContainerRef.current?.querySelector('input')?.focus()
    }, 500)
    return () => clearTimeout(timer)
  }, [opened])

  function reset() {
    setTitle('')
    setTitleError(false)
    setImages([])
    setIsSubmitting(false)
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    setTitleError(false)
    setIsSubmitting(true)

    try {
      const result = await createNote({ title: title.trim() })
      const noteId = result?.data?.id

      if (images.length > 0 && noteId) {
        const errors = await uploadAttachmentsSequentially(notebookId, noteId, images)
        errors.forEach((err) => {
          f7.toast.create({
            text: err?.message || 'Error al subir un archivo.',
            closeTimeout: 3500,
            position: 'top',
          }).open()
        })
      }

      reset()
      onClose()
    } catch {
      f7.toast.create({
        text: 'Error al crear la nota. Intenta de nuevo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
      setIsSubmitting(false)
    }
  }

  function handleImageChange(e) {
    setImages(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  function handleClosed() {
    reset()
    onClose()
  }

  return (
    <Sheet
      opened={opened}
      onSheetClosed={handleClosed}
      swipeToClose
      backdrop
      style={{ height: 'auto' }}
    >
      <PageContent style={{ padding: '0 0 32px' }}>
        {/* Drag handle */}
        <div style={{
          width: '36px',
          height: '4px',
          borderRadius: '2px',
          background: 'rgba(0,0,0,0.15)',
          margin: '12px auto 4px',
        }} />

        <List>
          <div ref={titleContainerRef}>
            <ListInput
              label="Título"
              type="text"
              placeholder="Título de la nota"
              value={title}
              onInput={(e) => { setTitle(e.target.value); setTitleError(false) }}
              errorMessage="El título es obligatorio"
              errorMessageForce={titleError}
              clearButton
            />
          </div>
        </List>

        <Block style={{ marginTop: 0 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <Button outline onClick={() => fileInputRef.current?.click()} style={{ marginBottom: '12px' }}>
            <i className="f7-icons" style={{ marginRight: '6px' }}>photo</i>
            {images.length > 0
              ? `${images.length} imagen${images.length !== 1 ? 'es' : ''} seleccionada${images.length !== 1 ? 's' : ''}`
              : 'Adjuntar imágenes (opcional)'}
          </Button>

          <Button large fill disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Guardando...' : 'Crear'}
          </Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}

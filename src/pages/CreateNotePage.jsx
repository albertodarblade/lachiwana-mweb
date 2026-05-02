import React, { useState, useRef } from 'react'
import { Page, Navbar, NavLeft, NavTitle, List, ListInput, Button, Block, f7 } from 'framework7-react'
import { useCreateNote, uploadAttachmentsSequentially } from '../hooks/useCreateNote'
import { navigate } from '../utils/f7navigate'

export default function CreateNotePage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState(false)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const { mutateAsync: createNote } = useCreateNote(notebookId)

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
        errors.forEach(() => {
          f7.toast.create({
            text: 'Error al subir un archivo. Puedes intentarlo desde la nota.',
            closeTimeout: 3500,
            position: 'top',
          }).open()
        })
      }

      navigate(`/notebooks/${notebookId}/notes/${noteId}`, { reloadCurrent: false })
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
  }

  const buttonLabel = isSubmitting
    ? images.length > 0 ? 'Subiendo archivos...' : 'Creando...'
    : 'Crear Nota'

  return (
    <Page>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle>Nueva Nota</NavTitle>
      </Navbar>

      <List>
        <ListInput
          label="Título"
          type="text"
          placeholder="Título de la nota"
          value={title}
          onInput={(e) => { setTitle(e.target.value); setTitleError(false) }}
          errorMessage="El título es obligatorio"
          errorMessageForce={titleError}
          clearButton
          autofocus
        />
      </List>

      <Block>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <Button outline onClick={() => fileInputRef.current?.click()}>
          <i className="f7-icons" style={{ marginRight: '6px' }}>photo</i>
          {images.length > 0
            ? `${images.length} imagen${images.length !== 1 ? 'es' : ''} seleccionada${images.length !== 1 ? 's' : ''}`
            : 'Adjuntar imágenes (opcional)'}
        </Button>
      </Block>

      <Block>
        <Button large fill disabled={isSubmitting} onClick={handleSubmit}>
          {buttonLabel}
        </Button>
      </Block>
    </Page>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, Block, Preloader, Messages, Message, f7,
} from 'framework7-react'
import { ArrowLeftRight, Send } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { LUCIDE_ICONS } from '../components/IconSelector/lucideIcons'
import { useNotebook } from '../hooks/useNotebook'
import { useAskTransactions } from '../hooks/useAskTransactions'
import { navigateBack } from '../utils/f7navigate'
import TransactionQuestionsDateRange, { presetRanges } from '../components/ai/TransactionQuestionsDateRange'
import styles from './NotebookTransactionsQuestionsPage.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

let messageSeq = 0

function suggestion() {
  return 'Pregúntame sobre tus movimientos del rango seleccionado.'
}

export default function NotebookTransactionsQuestionsPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isPending, isError, fetchStatus } = useNotebook(id)
  const { ask, isStreaming } = useAskTransactions()

  const [range, setRange] = useState(() => {
    const [month] = presetRanges()
    return { from: month.from, to: month.to, label: month.label }
  })
  const [messages, setMessages] = useState(() => [{ id: 0, role: 'assistant', text: suggestion() }])
  const [streaming, setStreaming] = useState('')
  const [pending, setPending] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const streamRef = useRef('')

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming, pending])

  const offline = typeof navigator !== 'undefined' && navigator.onLine === false

  function handleSend() {
    if (offline) {
      f7.toast.create({ text: 'Sin conexión — no se puede consultar.', closeTimeout: 3000 }).open()
      return
    }
    const question = input.trim()
    if (!question || isStreaming) return

    setInput('')
    streamRef.current = ''
    setStreaming('')
    setPending(true)
    setMessages((prev) => [...prev, { id: ++messageSeq, role: 'user', text: question }])

    ask({
      notebookId: id,
      question,
      from: range.from,
      to: range.to,
      onChunk: (chunk) => {
        streamRef.current += chunk
        setStreaming(streamRef.current)
        setPending(false)
      },
      onDone: () => {
        const text = streamRef.current.trim()
        streamRef.current = ''
        setStreaming('')
        setPending(false)
        setMessages((prev) => [...prev, { id: ++messageSeq, role: 'assistant', text }])
      },
    }).catch((err) => {
      if (err?.name === 'AbortError') return
      const text = err?.message
        ? `No pude responder: ${err.message}`
        : 'Ocurrió un error. Intenta de nuevo.'
      streamRef.current = ''
      setStreaming('')
      setPending(false)
      setMessages((prev) => [...prev, { id: ++messageSeq, role: 'assistant', text }])
    })
  }

  if (isPending && fetchStatus === 'paused') {
    return (
      <Page>
        <Navbar title="Asistente" backLink="Atrás" backLinkUrl="/" backLinkForce />
        <Block className={styles.centered}>
          <p>Sin conexión — no hay datos guardados.</p>
        </Block>
      </Page>
    )
  }

  if (isLoading) {
    return (
      <Page>
        <Navbar title="Asistente" backLink="Atrás" backLinkUrl="/" backLinkForce />
        <Block className={styles.centered}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  if (isError || !notebook) {
    return (
      <Page>
        <Navbar title="Asistente" backLink="Atrás" backLinkUrl="/" backLinkForce />
        <Block className={styles.centered}>
          <p className={styles.errorText}>Cuaderno no encontrado.</p>
          <span className={styles.backLink} onClick={() => navigateBack()}>
            Volver al inicio
          </span>
        </Block>
      </Page>
    )
  }

  const navbarColor = notebook.color ?? 'var(--f7-theme-color)'
  const canSend = input.trim().length > 0 && !isStreaming && !offline

  return (
    <Page className={styles.page} data-testid="transactions-questions-page">
      <Navbar>
        <NavLeft backLink="Atrás" backLinkForce backLinkUrl={`/notebooks/${id}/transactions`} />
        <NavTitle>
          <div className={styles.navTitleInner}>
            <div className={styles.iconContainer} style={{ '--icon-color': navbarColor }}>
              {(() => { const IconComp = notebook.iconName ? (lucideMap[notebook.iconName] ?? ArrowLeftRight) : ArrowLeftRight; return <IconComp size={18} className={styles.navIcon} /> })()}
            </div>
            <span className={styles.navTitleText}>
              {notebook.title}
              <span className={styles.navTitleSub}>Pregunta a tu asistente</span>
            </span>
          </div>
        </NavTitle>
      </Navbar>

      <TransactionQuestionsDateRange
        from={range.from}
        to={range.to}
        color={navbarColor}
        onChange={(next) => setRange(next)}
      />

      <div className={styles.messagesScroll} ref={scrollRef}>
        <Messages className={styles.messages} autoLayout={false} scrollMessages={false}>
          {messages.map((m) =>
            m.role === 'user' ? (
              <Message key={m.id} type="sent" className={styles.userMessage} text={m.text} first last tail />
            ) : (
              <Message key={m.id} type="received" className={styles.fullWidth} first last tail>
                <div slot="text" className={styles.markdownBody}>
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{m.text}</Markdown>
                </div>
              </Message>
            )
          )}
          {isStreaming &&
            (pending ? (
              <Message type="received" typing first last />
            ) : (
              <Message type="received" className={styles.fullWidth} first last tail>
                <div slot="text" className={styles.markdownBody}>
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{streaming}</Markdown>
                </div>
              </Message>
            ))}
        </Messages>
      </div>

      <div
        className={styles.messagebar}
        data-testid="questions-messagebar"
        style={canSend ? { '--send-color': navbarColor } : undefined}
      >
        <textarea
          className={styles.messagebarInput}
          placeholder="¿Qué necesitas preguntar?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          data-testid="questions-messagebar-input"
        />
        <button
          type="button"
          className={[styles.sendBtn, canSend ? styles.sendBtnActive : ''].join(' ')}
          onClick={handleSend}
          aria-label="Enviar"
          data-testid="questions-messagebar-send"
        >
          <Send size={22} />
        </button>
      </div>
    </Page>
  )
}
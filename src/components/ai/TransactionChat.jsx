import React, { useState, useRef, useEffect } from 'react'
import { Messages, Message, f7 } from 'framework7-react'
import { Send, Sparkles } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useAskTransactions } from '../../hooks/useAskTransactions'
import { navigate } from '../../utils/f7navigate'
import styles from './TransactionChat.module.css'

let messageSeq = 1000

export default function TransactionChat({ notebookId, from, to, color }) {
  const { ask, isStreaming } = useAskTransactions()
  const [messages, setMessages] = useState(() => [
    { id: 0, role: 'assistant', text: 'Pregúntame sobre tus movimientos.' },
  ])
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
      notebookId,
      question,
      from,
      to,
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

  const canSend = input.trim().length > 0 && !isStreaming && !offline

  return (
    <div className={styles.chat} style={{ '--complex-color': color }} data-testid="transactions-chat-tab">
      <div className={styles.chatHeader}>
        <span className={styles.chatHeaderText}>Chat del mes seleccionado</span>
        <button
          type="button"
          className={styles.complexBtn}
          onClick={() => navigate(`/notebooks/${notebookId}/transactions/questions`)}
          data-testid="transactions-chat-complex"
        >
          <Sparkles size={14} className={styles.complexIcon} />
          Consultas complejas
        </button>
      </div>
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
        data-testid="transactions-chat-messagebar"
        style={canSend ? { '--send-color': color } : undefined}
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
          data-testid="transactions-chat-input"
        />
        <button
          type="button"
          className={[styles.sendBtn, canSend ? styles.sendBtnActive : ''].join(' ')}
          onClick={handleSend}
          aria-label="Enviar"
          data-testid="transactions-chat-send"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import {
  Calculator as CalculatorIcon,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
  Delete,
} from 'lucide-react'
import { Popup, Page, Button } from 'framework7-react'
import styles from './Calculator.module.css'

const OPERATORS = { '+': '+', '−': '-', '×': '*', '÷': '/' }
const KEY_ICONS = { '÷': Divide, '×': X, '−': Minus, '+': Plus, '=': Equal, '⌫': Delete }

function evaluate(expr) {
  const tokens = expr.match(/\d+\.?\d*|\.\d+|[+\-×÷−]/g)
  if (!tokens || tokens.length < 3) return null

  const ops = {
    '+': (a, b) => a + b,
    '−': (a, b) => a - b,
    '×': (a, b) => a * b,
    '÷': (a, b) => (b === 0 ? null : a / b),
  }

  const pass1 = [parseFloat(tokens[0])]
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const num = parseFloat(tokens[i + 1])
    if (op === '×' || op === '÷') {
      const prev = pass1.pop()
      const res = ops[op](prev, num)
      if (res === null || !isFinite(res)) return null
      pass1.push(res)
    } else {
      pass1.push(op, num)
    }
  }

  let result = pass1[0]
  for (let i = 1; i < pass1.length; i += 2) {
    result = ops[pass1[i]](result, pass1[i + 1])
    if (!isFinite(result)) return null
  }
  return result
}

function trimResult(value) {
  return String(Number(value.toFixed(8)))
}

const KEYS = [
  ['AC', '×', '÷', '⌫'],
  ['7', '8', '9', '−'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '±'],
  ['0', '.', '='],
]

export default function Calculator({ onCalculationConfirm, initialValue = '', className }) {
  const [opened, setOpened] = useState(false)
  const [display, setDisplay] = useState('')
  const [hasCalculated, setHasCalculated] = useState(false)

  function open() {
    setDisplay(initialValue || '')
    setHasCalculated(false)
    setOpened(true)
  }

  function reset() {
    setOpened(false)
    setDisplay('')
    setHasCalculated(false)
  }

  function handleKey(key) {
    if (key === 'AC') {
      setDisplay('')
      setHasCalculated(false)
      return
    }

    if (key === '⌫') {
      setDisplay((prev) => prev.slice(0, -1))
      return
    }

    if (key === '±') {
      setDisplay((prev) => {
        if (!prev || prev === 'Error') return prev
        if (/[+\-×÷−]/.test(prev)) return prev
        return prev.startsWith('-') ? prev.slice(1) : '-' + prev
      })
      return
    }

    if (key === '=') {
      const result = evaluate(display)
      if (result === null) {
        setDisplay('Error')
        return
      }
      setDisplay(trimResult(result))
      setHasCalculated(true)
      return
    }

    if (key in OPERATORS) {
      if (!display || display === 'Error') return
      const last = display[display.length - 1]
      if (last in OPERATORS) {
        setDisplay((prev) => prev.slice(0, -1) + key)
      } else {
        setDisplay((prev) => prev + key)
      }
      return
    }

    setDisplay((prev) => {
      if (prev === 'Error') return key
      if (key === '.') {
        const last = prev[prev.length - 1]
        if (!prev || last in OPERATORS) return prev + '0.'
        const currentNumber = prev.split(/[+\-×÷−]/).pop()
        if (currentNumber.includes('.')) return prev
        return prev + '.'
      }
      return prev + key
    })
  }

  const canConfirm = hasCalculated && display && display !== 'Error'

  function handleConfirm() {
    if (!canConfirm) return
    onCalculationConfirm(parseFloat(display))
    reset()
  }

  return (
    <>
      <button
        type="button"
        className={[styles.iconBtn, className].filter(Boolean).join(' ')}
        onClick={open}
        aria-label="Abrir calculadora"
        data-testid="calculator-open"
      >
        <CalculatorIcon size={20} />
      </button>

      <Popup
        opened={opened}
        tabletFullscreen
        swipeToClose="to-bottom"
        onPopupClosed={reset}
        className={styles.popup}
      >
        <Page>
          <div className={styles.calculator}>
            <div className={styles.display} data-testid="calculator-display">
              {display || '0'}
            </div>

            <div className={styles.keypad}>
              {KEYS.map((row) =>
                row.map((key) => {
                  const Icon = KEY_ICONS[key]
                  const isOperator = key in OPERATORS || key === '='
                  const isAction = key === 'AC' || key === '±' || key === '⌫'
                  return (
                    <button
                      key={key}
                      type="button"
                      className={[
                        styles.key,
                        isOperator ? styles.keyOperator : '',
                        isAction ? styles.keyAction : '',
                        key === '0' ? styles.keyWide : '',
                      ].join(' ')}
                      onClick={() => handleKey(key)}
                      data-testid={`calculator-key-${key === '=' ? 'equals' : key}`}
                    >
                      {Icon ? <Icon size={24} /> : key}
                    </button>
                  )
                })
              )}
            </div>

            <div className={styles.footer}>
              <Button outline large onClick={reset} className={styles.cancelBtn} data-testid="calculator-cancel">
                Cancelar
              </Button>
              <Button fill large disabled={!canConfirm} onClick={handleConfirm} className={styles.confirmBtn} data-testid="calculator-confirm">
                Confirmar
              </Button>
            </div>
          </div>
        </Page>
      </Popup>
    </>
  )
}

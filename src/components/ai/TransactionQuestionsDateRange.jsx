import React, { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import styles from './TransactionQuestionsDateRange.module.css'

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function presetRanges(now = new Date()) {
  const today = fmtDate(now)
  const firstOf = (offsetMonths) =>
    fmtDate(new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1))
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  return [
    { key: 'month', label: 'Este mes', from: firstOf(0), to: today },
    { key: 'prev', label: 'Mes anterior', from: fmtDate(prevMonthStart), to: fmtDate(prevMonthEnd) },
    { key: '2m', label: '2 meses', from: firstOf(1), to: today },
    { key: '3m', label: '3 meses', from: firstOf(2), to: today },
    { key: '6m', label: '6 meses', from: firstOf(5), to: today },
    { key: 'year', label: '1 año', from: firstOf(11), to: today },
  ]
}

function matchPreset(from, to, now = new Date()) {
  const presets = presetRanges(now)
  return presets.find((p) => p.from === from && p.to === to)
}

function formatLabel(from, to) {
  if (!from || !to) return 'Fechas'
  const f = new Date(`${from}T00:00:00`)
  const t = new Date(`${to}T00:00:00`)
  const str = (d) =>
    d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${str(f)} – ${str(t)}`
}

export default function TransactionQuestionsDateRange({ from, to, onChange, color }) {
  const [customOpen, setCustomOpen] = useState(false)
  const presets = presetRanges()
  const active = matchPreset(from, to)
  const isCustom = !active
  const customLabel = customOpen ? 'Ocultar fechas' : 'Personalizado'

  function pick(preset) {
    setCustomOpen(false)
    onChange({ from: preset.from, to: preset.to, label: preset.label })
  }

  function applyCustom(nextFrom, nextTo) {
    onChange({
      from: nextFrom || from,
      to: nextTo || to,
      label: formatLabel(nextFrom || from, nextTo || to),
    })
  }

  return (
    <div className={styles.wrapper} data-testid="transactions-questions-range">
      <div className={styles.scroll}>
        {presets.map((preset) => {
          const selected = active?.key === preset.key
          return (
            <button
              key={preset.key}
              type="button"
              className={[styles.chip, selected ? styles.chipActive : ''].join(' ')}
              style={selected ? { '--chip-color': color } : undefined}
              onClick={() => pick(preset)}
              data-testid={`range-preset-${preset.key}`}
            >
              {preset.label}
            </button>
          )
        })}
        <button
          type="button"
          className={[styles.chip, isCustom ? styles.chipActive : ''].join(' ')}
          style={isCustom ? { '--chip-color': color } : undefined}
          onClick={() => setCustomOpen((v) => !v)}
          data-testid="range-preset-custom"
        >
          {customLabel}
        </button>
      </div>

      {customOpen && (
        <div className={styles.customRow}>
          <label className={styles.customField}>
            <CalendarClock size={16} className={styles.customIcon} />
            <input
              type="date"
              value={from ?? ''}
              max={to ?? undefined}
              onChange={(e) => applyCustom(e.target.value, to)}
              data-testid="range-custom-from"
            />
          </label>
          <span className={styles.customSep}>→</span>
          <label className={styles.customField}>
            <CalendarClock size={16} className={styles.customIcon} />
            <input
              type="date"
              value={to ?? ''}
              min={from ?? undefined}
              onChange={(e) => applyCustom(from, e.target.value)}
              data-testid="range-custom-to"
            />
          </label>
        </div>
      )}
    </div>
  )
}
export function sanitizeAmountInput(raw) {
  if (raw == null) return ''
  let value = String(raw).replace(',', '.')
  // keep digits and dots only
  value = value.replace(/[^0-9.]/g, '')
  // keep only first dot
  const parts = value.split('.')
  if (parts.length <= 1) return value
  return `${parts[0]}.${parts.slice(1).join('')}`
}

export function parseAmountInput(value) {
  const normalized = sanitizeAmountInput(value)
  if (normalized === '' || normalized === '.') return NaN
  return parseFloat(normalized)
}

export function isValidAmountInput(value) {
  const n = parseAmountInput(value)
  return !isNaN(n) && n !== 0
}

import React from 'react'
import styles from './ThemedButton.module.css'

/**
 * Custom button that applies a notebook theme color cleanly via a CSS variable.
 * Replaces F7 Button for cases where F7's hover/focus overrides cause visual issues.
 *
 * variant: 'outline' | 'icon'
 * color: runtime notebook color (inline CSS var — dynamic value exception, Principle XI)
 */
export default function ThemedButton({
  children,
  color,
  variant = 'outline',
  onClick,
  disabled = false,
  className,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={color ? { '--btn-color': color } : undefined}
      className={[styles.btn, styles[variant], className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  )
}

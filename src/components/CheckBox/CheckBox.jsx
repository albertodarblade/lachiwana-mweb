import React from 'react'
import { Circle, CircleCheckBig } from 'lucide'
import { MorphIcon } from 'morphicons/react'
import styles from './CheckBox.module.css'

export default function CheckBox({ checked, onClick, disabled = false, className, ...rest }) {
  function handleClick(e) {
    e.stopPropagation()
    if (!disabled) onClick?.(!checked)
  }

  return (
    <button
      type="button"
      className={`${styles.checkbox}${checked ? ` ${styles.checked}` : ''}${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={checked}
      {...rest}
    >
      <MorphIcon
        icon={checked ? CircleCheckBig : Circle}
        size={26}
        strokeWidth={2}
        spring="smooth"
        className={styles.icon}
      />
    </button>
  )
}

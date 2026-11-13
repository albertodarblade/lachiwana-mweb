import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import styles from './BloomRadialFabMenu.module.css'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className={styles.svgIcon}>
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className={styles.svgIcon}>
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function getReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function BloomRadialFabMenu({
  items = [],
  ariaLabel = 'Abrir menú de acciones',
  closeAriaLabel = 'Cerrar menú',
  color,
  triggerLabel = '',
  triggerIcon,
  menuAriaLabel = 'Acciones',
  className,
  floating = true,
  triggerShape,
  style,
}) {
  const [open, setOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const itemRefs = useRef([])
  const wasOpenRef = useRef(false)
  const menuId = useId()

  const menuItems = useMemo(() => items.slice(0, 6), [items])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReducedMotion(e.matches)
    setReducedMotion(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      // M3 FAB menu: initial focus remains on the close button when opened.
      const t = setTimeout(() => {
        triggerRef.current?.focus()
      }, 0)
      return () => clearTimeout(t)
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false
      triggerRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('touchstart', onDocMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('touchstart', onDocMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle() {
    setOpen((v) => !v)
  }

  function handleItemSelect(item) {
    if (item.disabled) return
    try {
      item.onSelect?.(item)
    } finally {
      setOpen(false)
    }
  }

  // Visual stack above FAB: topmost menu item first, bottommost last (closest to FAB).
  // DOM order inside menu follows this so Tab moves top -> bottom after close button.
  const orderedItems = useMemo(() => [...menuItems], [menuItems])

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${!floating ? ` ${styles.embedded}` : ''}${className ? ` ${className}` : ''}${reducedMotion ? ` ${styles.reducedMotion}` : ''}`}
      style={{
        ...(color ? { '--fab-menu-color': color } : {}),
        ...(triggerShape ? { '--fab-trigger-shape': triggerShape } : {}),
        ...style,
      }}
    >
      {open && <div className={styles.scrim} aria-hidden="true" onClick={() => setOpen(false)} />}

      <div className={styles.anchor}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.fab}${open ? ` ${styles.fabOpen}` : ''}${triggerLabel ? ` ${styles.fabExtended}` : ''}`}
          onClick={toggle}
          aria-label={open ? closeAriaLabel : ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
        >
          <span className={`${styles.fabIcon}${open ? ` ${styles.fabIconOpen}` : ''}`} aria-hidden="true">
            {open ? <CloseIcon /> : (triggerIcon || <PlusIcon />)}
          </span>
          {triggerLabel ? <span className={styles.fabLabel}>{triggerLabel}</span> : null}
        </button>

        <div
          id={menuId}
          className={`${styles.menu}${open ? ` ${styles.menuOpen}` : ''}`}
          role="menu"
          aria-label={menuAriaLabel}
          aria-hidden={!open}
        >
          {orderedItems.map((item, index) => {
            const delay = reducedMotion ? 0 : index * 25
            return (
              <button
                key={item.id ?? index}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                role="menuitem"
                className={styles.menuItem}
                style={{
                  '--delay': `${delay}ms`,
                  ...(item.color ? { '--item-accent': item.color, '--item-on-accent': item.onColor || '#fff' } : {}),
                }}
                onClick={() => handleItemSelect(item)}
                disabled={item.disabled}
                tabIndex={open ? 0 : -1}
              >
                <span className={styles.itemIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles.itemLabel}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

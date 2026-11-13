import React from 'react'
import styles from './NavigationBar.module.css'

export default function NavigationBar({
  items = [],
  activeId,
  onSelect,
  reserveFabSpace = false, // false | true | 'small' | 'large' (true = 'large')
  ariaLabel = 'Navigation bar',
  className = '',
  fixed = false, // true | 'bottom' to fix at bottom
  zIndex,
}) {
  const destinations = (items || []).slice(0, 5)
  const isFixedBottom = fixed === true || fixed === 'bottom'
  const reserveSize =
    reserveFabSpace === true || reserveFabSpace === 'large'
      ? 'large'
      : reserveFabSpace === 'small'
        ? 'small'
        : null

  return (
    <nav
      className={`${styles.bar} ${reserveSize === 'small' ? styles.reserveFabSpaceSmall : ''} ${reserveSize === 'large' ? styles.reserveFabSpaceLarge : ''} ${isFixedBottom ? styles.fixedBottom : ''} ${className}`.trim()}
      aria-label={ariaLabel}
      style={zIndex != null ? { zIndex } : undefined}
    >
      <div className={styles.inner}>
        {destinations.map((item) => {
          const active = item.id === activeId
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${active ? styles.active : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  onSelect?.(item.id, item)
                  item.onSelect?.(item)
                }
              }}
              disabled={item.disabled}
              aria-current={active ? 'page' : undefined}
              aria-label={item.ariaLabel || item.label}
            >
              <span className={styles.indicator} aria-hidden="true">
                <span className={styles.iconSlot}>
                  {typeof Icon === 'function' ? <Icon active={active} /> : Icon}
                </span>
              </span>
              {item.label ? <span className={styles.label}>{item.label}</span> : null}
            </button>
          )
        })}
        {reserveSize ? <div className={styles.fabSpacer} aria-hidden="true" /> : null}
      </div>
    </nav>
  )
}

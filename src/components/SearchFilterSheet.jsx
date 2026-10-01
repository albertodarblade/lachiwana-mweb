import React, { useState, useEffect, useRef } from 'react'
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import { Sheet, PageContent, Button } from 'framework7-react'
import { LUCIDE_ICONS } from './IconSelector/lucideIcons'
import styles from './SearchFilterSheet.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function SearchFilterSheet({
  opened,
  onClose,
  filters,
  onApply,
  tags = [],
  title,
  placeholder,
  testIdPrefix,
}) {
  const [localContent, setLocalContent] = useState('')
  const [localTagIds, setLocalTagIds] = useState(new Set())
  const [tagsOpen, setTagsOpen] = useState(false)

  const searchRef = useRef(null)
  const debouncedTimer = useRef(null)

  useEffect(() => {
    if (!opened) return
    setTagsOpen((filters.tagIds?.size ?? 0) > 0)
    const timer = setTimeout(() => searchRef.current?.focus(), 350)
    return () => clearTimeout(timer)
  }, [opened])

  useEffect(() => {
    if (opened) {
      setLocalContent(filters.content ?? '')
      setLocalTagIds(new Set(filters.tagIds ?? []))
    }
  }, [opened, filters])

  useEffect(() => {
    if (!opened) return
    if (debouncedTimer.current) clearTimeout(debouncedTimer.current)
    debouncedTimer.current = setTimeout(() => {
      onApply({
        content: localContent.trim(),
        tagIds: localTagIds,
      })
    }, 900)
    return () => {
      if (debouncedTimer.current) clearTimeout(debouncedTimer.current)
    }
  }, [opened, localContent, localTagIds])

  function toggleTag(id) {
    setLocalTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleClear() {
    setLocalContent('')
    setLocalTagIds(new Set())
    onApply({ content: '', tagIds: new Set() })
    onClose()
  }

  const hasCriteria = localContent.trim() !== '' || localTagIds.size > 0

  return (
    <Sheet
      top
      opened={opened}
      onSheetClosed={onClose}
      backdrop
      style={{ height: 'auto' }}
    >
      <PageContent className={styles.pageContent}>
        <div className={styles.dragHandle} />

        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            data-testid={`${testIdPrefix}-close`}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.searchRow}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={localContent}
            onInput={(e) => setLocalContent(e.target.value)}
            data-testid={`${testIdPrefix}-content`}
          />
        </div>

        {tags.length > 0 && (
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => setTagsOpen((v) => !v)}
              data-testid={`${testIdPrefix}-tags-toggle`}
            >
              <span className={styles.sectionTitle}>Etiquetas</span>
              {tagsOpen ? (
                <ChevronDown size={18} className={styles.sectionChevron} />
              ) : (
                <ChevronRight size={18} className={styles.sectionChevron} />
              )}
            </button>
            {tagsOpen && (
              <div className={styles.tagsBlock}>
                {tags.map((tag) => {
                  const tagId = tag.id ?? tag._id
                  const active = localTagIds.has(tagId)
                  return (
                    <button
                      key={tagId}
                      className={[styles.tagChip, active ? styles.tagChipActive : ''].join(' ')}
                      onClick={() => toggleTag(tagId)}
                      data-testid={`${testIdPrefix}-tag-${tagId}`}
                    >
                      {(() => {
                        const LucideIcon = tag.icon ? lucideMap[tag.icon] : null
                        if (LucideIcon) return <LucideIcon size={14} className={styles.tagChipIcon} />
                        if (tag.icon) return <i className={['f7-icons', styles.tagChipIcon].join(' ')}>{tag.icon}</i>
                        return null
                      })()}
                      {tag.title}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <Button large outline onClick={handleClear} disabled={!hasCriteria} className={styles.clearBtn} data-testid={`${testIdPrefix}-clear`}>
            Limpiar todo
          </Button>
        </div>
      </PageContent>
    </Sheet>
  )
}
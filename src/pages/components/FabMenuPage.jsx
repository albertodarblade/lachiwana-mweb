import React, { useMemo, useState } from 'react'
import { Page, Navbar, Block, BlockTitle } from 'framework7-react'
import { Edit, FileText, Share2, Star, Image, Link2, Plus } from 'lucide-react'
import BloomRadialFabMenu from '../../components/lab/BloomRadialFabMenu/BloomRadialFabMenu'
import styles from './FabMenuPage.module.css'

const ICON_OPTIONS = [
  { id: 'plus', label: 'Más (+)', icon: <Plus size={20} /> },
  { id: 'edit', label: 'Editar', icon: <Edit size={20} /> },
  { id: 'note', label: 'Nota', icon: <FileText size={20} /> },
  { id: 'share', label: 'Compartir', icon: <Share2 size={20} /> },
  { id: 'star', label: 'Favorito', icon: <Star size={20} /> },
  { id: 'image', label: 'Imagen', icon: <Image size={20} /> },
  { id: 'link', label: 'Enlace', icon: <Link2 size={20} /> },
]

const DEFAULT_ITEMS = [
  { id: 'edit', label: 'Editar', iconId: 'edit', disabled: false },
  { id: 'note', label: 'Nueva nota', iconId: 'note', disabled: false },
  { id: 'share', label: 'Compartir', iconId: 'share', disabled: false },
  { id: 'star', label: 'Favorito', iconId: 'star', disabled: false },
]

export default function FabMenuPage() {
  const [lastAction, setLastAction] = useState('Ninguna')
  const [triggerLabel, setTriggerLabel] = useState('Editar')
  const [triggerIconId, setTriggerIconId] = useState('edit')
  const [ariaLabel, setAriaLabel] = useState('Abrir menú de acciones')
  const [closeAriaLabel, setCloseAriaLabel] = useState('Cerrar menú')
  const [menuAriaLabel, setMenuAriaLabel] = useState('Acciones')
  const [color, setColor] = useState('')
  const [itemConfigs, setItemConfigs] = useState(DEFAULT_ITEMS)

  const triggerIcon = useMemo(() => {
    const opt = ICON_OPTIONS.find((o) => o.id === triggerIconId) || ICON_OPTIONS[0]
    return opt.icon
  }, [triggerIconId])

  const items = useMemo(
    () =>
      itemConfigs.map((cfg) => {
        const iconOpt = ICON_OPTIONS.find((o) => o.id === cfg.iconId) || ICON_OPTIONS[0]
        return {
          id: cfg.id,
          label: cfg.label,
          icon: iconOpt.icon,
          disabled: !!cfg.disabled,
          onSelect: () => setLastAction(cfg.label || cfg.id),
        }
      }),
    [itemConfigs]
  )

  function updateItem(index, patch) {
    setItemConfigs((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItemConfigs((prev) => {
      if (prev.length >= 6) return prev
      const nextIndex = prev.length
      const iconOpt = ICON_OPTIONS[nextIndex % ICON_OPTIONS.length]
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${nextIndex}`,
          label: `Acción ${nextIndex + 1}`,
          iconId: iconOpt.id,
          disabled: false,
        },
      ]
    })
  }

  function removeItem(index) {
    setItemConfigs((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)))
  }

  return (
    <Page name="components-buttons-fab-menu">
      <Navbar title="FAB Menu" subtitle="Buttons" backLink="Components" />
      <BlockTitle>FAB Menu (Material Design 3)</BlockTitle>
      <Block strong inset className={styles.intro}>
        <p className={styles.text}>
          Implementación desde cero siguiendo el comportamiento de FAB menu de Material Design 3,
          sin MUI/Radix/Shadcn. El FAB es redondeado, soporta texto y se expone con configuración editable.
        </p>
        <div className={styles.status}>
          <span className={styles.statusLabel}>Última acción:</span>
          <span className={styles.statusValue}>{lastAction}</span>
        </div>
      </Block>

      <BlockTitle>Configuración del componente</BlockTitle>
      <Block strong inset>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Texto del botón inicial (triggerLabel)</span>
            <input
              className={styles.input}
              type="text"
              value={triggerLabel}
              onChange={(e) => setTriggerLabel(e.target.value)}
              placeholder="Vacío = solo icono"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Icono del botón inicial (triggerIcon)</span>
            <select
              className={styles.input}
              value={triggerIconId}
              onChange={(e) => setTriggerIconId(e.target.value)}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>ariaLabel (abrir)</span>
            <input
              className={styles.input}
              type="text"
              value={ariaLabel}
              onChange={(e) => setAriaLabel(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>closeAriaLabel (cerrar)</span>
            <input
              className={styles.input}
              type="text"
              value={closeAriaLabel}
              onChange={(e) => setCloseAriaLabel(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>menuAriaLabel</span>
            <input
              className={styles.input}
              type="text"
              value={menuAriaLabel}
              onChange={(e) => setMenuAriaLabel(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Color (color) — CSS, ej. #6750A4 o var(--f7-theme-color)</span>
            <div className={styles.colorRow}>
              <input
                className={styles.input}
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Vacío = color del tema"
              />
              <input
                className={styles.colorPicker}
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#e17100'}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Selector de color"
              />
            </div>
          </label>
        </div>
      </Block>

      <BlockTitle>Ítems del menú (2–6)</BlockTitle>
      <Block strong inset>
        <div className={styles.itemsConfig}>
          {itemConfigs.map((item, index) => (
            <div key={item.id} className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>#{index + 1}</span>
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => removeItem(index)}
                  disabled={itemConfigs.length <= 2}
                >
                  Quitar
                </button>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Etiqueta (label)</span>
                <input
                  className={styles.input}
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(index, { label: e.target.value })}
                />
              </label>
              <div className={styles.inlineFields}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Icono</span>
                  <select
                    className={styles.input}
                    value={item.iconId}
                    onChange={(e) => updateItem(index, { iconId: e.target.value })}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.checkField}>
                  <input
                    type="checkbox"
                    checked={!!item.disabled}
                    onChange={(e) => updateItem(index, { disabled: e.target.checked })}
                  />
                  <span>Deshabilitado</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={addItem}
          disabled={itemConfigs.length >= 6}
        >
          Agregar ítem
        </button>
      </Block>

      <Block className={styles.spacer} />

      <BloomRadialFabMenu
        items={items}
        ariaLabel={ariaLabel}
        closeAriaLabel={closeAriaLabel}
        menuAriaLabel={menuAriaLabel}
        color={color || undefined}
        triggerLabel={triggerLabel}
        triggerIcon={triggerIcon}
      />
    </Page>
  )
}

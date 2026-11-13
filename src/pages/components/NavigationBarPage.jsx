import React, { useMemo, useState } from 'react'
import { Page, Navbar, Block, BlockTitle, List, ListItem, Toggle } from 'framework7-react'
import { Home, Search, Bookmark, User, Edit, FileText, Share2, Star } from 'lucide-react'
import NavigationBar from '../../components/lab/NavigationBar/NavigationBar'
import BloomRadialFabMenu from '../../components/lab/BloomRadialFabMenu/BloomRadialFabMenu'
import styles from './NavigationBarPage.module.css'

const DESTINATIONS = [
  { id: 'home', label: 'Inicio', icon: <Home size={24} strokeWidth={2} /> },
  { id: 'search', label: 'Buscar', icon: <Search size={24} strokeWidth={2} /> },
  { id: 'saved', label: 'Guardados', icon: <Bookmark size={24} strokeWidth={2} /> },
  { id: 'profile', label: 'Perfil', icon: <User size={24} strokeWidth={2} /> },
]

export default function NavigationBarPage() {
  const [activeId, setActiveId] = useState('home')
  const [reserveFabSpace, setReserveFabSpace] = useState('large')
  const [fixedBottom, setFixedBottom] = useState(false)
  const [zIndex, setZIndex] = useState('900')
  const [lastAction, setLastAction] = useState('Ninguna')

  const fabMenuItems = useMemo(
    () => [
      { id: 'edit', label: 'Editar', icon: <Edit size={20} />, onSelect: () => setLastAction('Editar') },
      { id: 'note', label: 'Nueva nota', icon: <FileText size={20} />, onSelect: () => setLastAction('Nueva nota') },
      { id: 'share', label: 'Compartir', icon: <Share2 size={20} />, onSelect: () => setLastAction('Compartir') },
      { id: 'star', label: 'Favorito', icon: <Star size={20} />, onSelect: () => setLastAction('Favorito') },
    ],
    []
  )

  return (
    <Page name="components-navigation-bar">
      <Navbar title="Navigation Bar" subtitle="Navigation · M3" backLink="Components" />

      <Block strong inset>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
          Navigation bar (Material Design 3). Sin FAB integrado: cuando se usa un FAB Menu flotante,
          la barra puede reservar espacio a la derecha para que no tape los destinos.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45, opacity: 0.8 }}>
          Specs: <a href="https://m3.material.io/components/navigation-bar/specs" target="_blank" rel="noreferrer">m3.material.io/components/navigation-bar/specs</a>
        </p>
      </Block>

      <BlockTitle>Configuración</BlockTitle>
      <List strong inset dividersIos outlineIos>
        <ListItem title="Fijar Navigation Bar abajo (fixed bottom)">
          <Toggle slot="after" checked={fixedBottom} onToggleChange={setFixedBottom} />
        </ListItem>
      </List>
      <Block strong inset>
        <div className={styles.field} style={{ marginBottom: 10 }}>
          <span className={styles.label}>reserveFabSpace</span>
          <select
            className={styles.input}
            value={String(reserveFabSpace)}
            onChange={(e) => {
              const v = e.target.value
              setReserveFabSpace(v === 'false' ? false : v)
            }}
          >
            <option value="false">false (sin reserva)</option>
            <option value="small">small</option>
            <option value="large">large</option>
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>zIndex</span>
          <input
            className={styles.input}
            type="number"
            value={zIndex}
            onChange={(e) => setZIndex(e.target.value)}
            placeholder="ej. 900"
          />
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5 }}>
          Props: <code>reserveFabSpace</code> (<code>false</code> | <code>"small"</code> | <code>"large"</code>), <code>fixed</code> (<code>true</code> | <code>"bottom"</code>), <code>zIndex</code>. Última acción del FAB: <strong>{lastAction}</strong>
        </p>
      </Block>

      <BlockTitle>Demo</BlockTitle>
      <Block strong inset className={styles.demoBlock}>
        <div className={styles.demoStage}>
          <div className={styles.demoContent}>
            <div className={styles.demoHint}>
              Destino activo: <strong>{activeId}</strong>
              <br />
              El FAB Menu flotante se mantiene a la derecha; la barra reserva espacio si la propiedad es <code>true</code>.
            </div>
          </div>
          <div className={styles.demoBarWrap}>
            <NavigationBar
              items={DESTINATIONS}
              activeId={activeId}
              onSelect={setActiveId}
              reserveFabSpace={reserveFabSpace}
              fixed={fixedBottom}
              zIndex={zIndex === '' ? undefined : Number(zIndex)}
              ariaLabel="Barra de navegación de ejemplo"
            />
          </div>
        </div>
      </Block>

      <BloomRadialFabMenu
        ariaLabel="Abrir acciones"
        closeAriaLabel="Cerrar acciones"
        menuAriaLabel="Acciones rápidas"
        items={fabMenuItems}
      />

      <Block strong inset>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Props: <code>items</code> (3–5 destinos), <code>activeId</code>, <code>onSelect</code>, <code>reserveFabSpace</code> (<code>false</code> | <code>"small"</code> | <code>"large"</code>, <code>true</code>=large), <code>fixed</code> (<code>true</code> | <code>"bottom"</code>), <code>zIndex</code>, <code>ariaLabel</code>.
        </p>
      </Block>
    </Page>
  )
}

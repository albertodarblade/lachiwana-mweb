import React, { useState } from 'react'
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, f7 } from 'framework7-react'
import UserProfileHeader from '../components/settings/UserProfileHeader'
import { getUser, clearSession } from '../stores/authStore'
import { getPrefs, setPrefs } from '../stores/settingsStore'
import { signOut } from '../api/auth'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const [, rerender] = useState(0)
  const userId = getUser()?.googleId ?? ''
  const currentPrefs = getPrefs(userId)

  async function handleLogout() {
    f7.dialog.confirm('¿Cerrar sesión?', 'Cerrar sesión', async () => {
      try {
        await signOut()
      } catch {
        // Idempotent — proceed to local cleanup even if the call fails
      }
      clearSession()
      window.location.replace('/login')
    })
  }

  function handleTheme(theme) {
    setPrefs(userId, { ...currentPrefs, theme })
    rerender(n => n + 1)
  }

  function handleColorScheme() {
    const newColorScheme = currentPrefs.colorScheme === 'dark' ? 'light' : 'dark'
    setPrefs(userId, { ...currentPrefs, colorScheme: newColorScheme })
    rerender(n => n + 1)
  }

  return (
    <Page>
      <Navbar title="Ajustes" backLink="Atrás" />

      <UserProfileHeader />

      <BlockTitle>Estilo</BlockTitle>
      <List>
        <ListItem
          title="iOS"
          after={currentPrefs.theme === 'ios' ? '✓' : ''}
          onClick={() => handleTheme('ios')}
          data-testid="settings-theme-ios"
        />
        <ListItem
          title="Google"
          after={currentPrefs.theme === 'md' ? '✓' : ''}
          onClick={() => handleTheme('md')}
          data-testid="settings-theme-md"
        />
      </List>

      <BlockTitle>Apariencia</BlockTitle>
      <List>
        <ListItem title="Modo oscuro">
          <Toggle
            slot="after"
            checked={currentPrefs.colorScheme === 'dark'}
            onToggleChange={handleColorScheme}
            data-testid="settings-dark-mode"
          />
        </ListItem>
      </List>

      <List className={styles.logoutList}>
        <ListItem
          title="Cerrar sesión"
          onClick={handleLogout}
          className={styles.logoutItem}
          data-testid="settings-signout"
        />
      </List>
    </Page>
  )
}

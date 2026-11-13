import React from 'react'
import { Page, Navbar, Block, BlockTitle, List, ListItem } from 'framework7-react'

export default function ComponentsPage() {
  return (
    <Page name="components">
      <Navbar title="Components" subtitle="UI Lab" />
      <Block strong inset>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
          Navegación de componentes de UI Lab. Selecciona una categoría y un componente para ver su exposición.
        </p>
      </Block>

      <BlockTitle>Buttons</BlockTitle>
      <List strong inset dividersIos outlineIos>
        <ListItem
          title="FAB Menu"
          subtitle="Material Design 3"
          footer="Ver componente y configuración"
          link="/components/buttons/fab-menu"
          chevronCenter
        />
      </List>

      <BlockTitle>Navigation</BlockTitle>
      <List strong inset dividersIos outlineIos>
        <ListItem
          title="Navigation Bar"
          subtitle="Material Design 3"
          footer="Barra de navegación con soporte de FAB"
          link="/components/navigation/navigation-bar"
          chevronCenter
        />
      </List>

      <Block strong inset>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          <strong>Sub-navegación:</strong> Buttons → FAB Menu
        </p>
      </Block>
    </Page>
  )
}

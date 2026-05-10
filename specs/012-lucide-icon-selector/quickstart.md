# Quickstart: Improved Icon Selector with Spanish Search

## Install Lucide React

```bash
npm install lucide-react
```

## Use the component

The `<IconSelector>` API is identical to the previous version. Only the import path changes.

```jsx
import { useState } from 'react'
import IconSelector from '../IconSelector/IconSelector'

export default function CreateEntityPage() {
  const [iconName, setIconName] = useState(null)

  return (
    <IconSelector value={iconName} onChange={setIconName} />
  )
}
```

## Files to create

```
src/components/IconSelector/
├── IconSelector.jsx         ← main component
├── IconSelector.module.css  ← styles
├── lucideIcons.js           ← full Lucide registry
└── spanishIconMap.js        ← Spanish keyword map
```

## Files to delete

```
src/components/notebooks/IconSelector.jsx
src/components/notebooks/IconSelector.module.css
src/components/notebooks/f7Icons.js
```

## Files to update (import path only)

```
src/pages/CreateNotebookPage.jsx
src/pages/EditNotebookPage.jsx
src/components/notebooks/EditNotebookSheet.jsx
src/components/notebooks/TagsPopup.jsx
```

Change each from:
```js
import IconSelector from '../notebooks/IconSelector'
// or
import IconSelector from '../../components/notebooks/IconSelector'
```
To the correct relative path pointing at:
```js
import IconSelector from '../IconSelector/IconSelector'
// (adjust relative depth per file)
```

## Search behaviour at a glance

| User types | Results shown |
|------------|---------------|
| *(nothing)* | ~40 curated default icons |
| `"comida"` | Hamburger, Utensils, Pizza, Apple, Coffee… |
| `"dinero"` | Wallet, CreditCard, Banknote, Coins, PiggyBank… |
| `"wallet"` | Wallet (English fuzzy match) |
| `"xyz"` | Empty state: "Sin resultados para 'xyz'" |

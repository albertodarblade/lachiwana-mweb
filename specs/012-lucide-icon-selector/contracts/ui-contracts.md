# UI Contracts: Improved Icon Selector with Spanish Search

## IconSelector Component

### Props

```
IconSelector({ value, onChange })
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| null` | Yes | Selected Lucide icon name (PascalCase, e.g. `"Wallet"`) or `null`. |
| `onChange` | `(name: string \| null) => void` | Yes | Fires when the user confirms an icon selection. Receives `null` when toggling off the current selection. |

### Trigger element behaviour

- When `value` is `null`: shows a placeholder icon + "Seleccionar ícono" label + chevron.
- When `value` is set: shows the selected Lucide icon + icon name label + chevron.
- Clicking anywhere on the trigger opens the Sheet.

### Sheet behaviour

| Condition | Behaviour |
|-----------|-----------|
| Sheet opens | Query reset to `""`. Default icon set displayed. |
| User types in Searchbar | `query` state updates; after 250ms debounce, search pipeline runs. |
| Query cleared | Default icon set restored. |
| User clicks an icon | `onChange(iconName)` called; sheet closes; query reset. |
| User clicks the same icon that is already `value` | `onChange(null)` called (toggle off). |
| Swipe down / backdrop tap | Sheet closes without calling `onChange`. |
| Zero results | Empty-state message shown: `Sin resultados para "{query}"`. No onChange call. |

### Search pipeline (in order)

1. Normalise query: lowercase + trim + strip diacritics.
2. Exact match in `spanishIconMap` → return mapped icons.
3. Prefix match in `spanishIconMap` → return union of all prefix-matched icons.
4. Fuzzy fallback: filter all Lucide icons where lowercased PascalCase name includes normalised query.
5. If still empty → show empty state.

### Visual states of a grid icon

| State | Visual |
|-------|--------|
| Default | Neutral background, icon + label |
| Selected (`name === value`) | Highlighted background (theme colour), icon + label |
| Hover/tap | Brief press state (Framework7 ripple) |

---

## spanishIconMap (data contract)

- **Shape**: `Record<string, string[]>` — keys are lowercase Spanish words, values are arrays of Lucide PascalCase icon names.
- **Key normalisation**: Applied at build time. Keys contain no diacritics, no uppercase, no surrounding whitespace.
- **Value validity**: Every string in every value array MUST match a named export of the installed `lucide-react` version.
- **Coverage minimum** (per SC-002): At least 10 life categories, each with ≥5 icons.

---

## lucideIcons.js (registry contract)

- **Shape**: `Array<{ name: string, Icon: React.ComponentType }>`.
- `name` is the PascalCase Lucide export name.
- `Icon` is the React component — renders an SVG, accepts standard Lucide props (`size`, `color`, `strokeWidth`, `className`).
- Built once at module load; never mutated.

---

## Integration contract with callers

All four existing callers (`CreateNotebookPage`, `EditNotebookPage`, `EditNotebookSheet`, `TagsPopup`) use the same props interface. Only the import path changes:

```js
// Before
import IconSelector from '../notebooks/IconSelector'

// After
import IconSelector from '../IconSelector/IconSelector'
```

No prop changes required in any caller.

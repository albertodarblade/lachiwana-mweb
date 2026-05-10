# Data Model: Improved Icon Selector with Spanish Search

This feature introduces no new backend entities. All data structures are client-side only.

---

## LucideIconEntry

A single entry in the static Lucide icon registry.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | PascalCase Lucide export name (e.g., `"Hamburger"`, `"Wallet"`). Used as the stored icon value. |
| `Icon` | `React.ComponentType` | The Lucide React component for rendering the icon as an SVG. |

**Constraints**:
- `name` is unique across the registry (guaranteed by Lucide's named-export model).
- `Icon` is a function component — never null.

---

## SpanishIconMap

A static lookup object mapping Spanish search terms to arrays of Lucide icon names.

```
SpanishIconMap = {
  [spanishTerm: string]: LucideIconEntry['name'][]
}
```

**Example**:
```
{
  "comida":   ["Hamburger", "Utensils", "Pizza", "Apple", "Coffee", "Sandwich", "Cookie"],
  "dinero":   ["Wallet", "CreditCard", "Banknote", "Coins", "PiggyBank", "DollarSign"],
  "salud":    ["Heart", "Activity", "Pill", "Stethoscope", "Bandage", "Hospital"],
  ...
}
```

**Constraints**:
- All keys are lowercase, trimmed, without diacritics (normalised at authoring time so lookup is direct).
- All values are valid PascalCase Lucide icon names that exist in the installed version of `lucide-react`.
- Values are ordered by relevance (most representative icon first).

---

## IconSelectorProps

The public interface of the `<IconSelector>` component.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| null` | Yes | Currently selected icon name (Lucide PascalCase) or `null` for no selection. |
| `onChange` | `(iconName: string \| null) => void` | Yes | Called when the user selects or deselects an icon. Passes `null` when the same icon is clicked twice (toggle-off). |

**Backward-compatibility note**: Callers that previously passed Framework7 icon name strings (e.g., `"heart_fill"`) will receive `null` from `onChange` on the first render because the old name does not exist in the Lucide registry. The trigger will show the empty state until the user picks a new icon.

---

## IconSelectorState (internal)

Internal state managed inside `<IconSelector>`.

| Field | Type | Description |
|-------|------|-------------|
| `isOpen` | `boolean` | Whether the Sheet is open. |
| `query` | `string` | Current search input value (raw, not debounced). |
| `debouncedQuery` | `string` | Debounced version of `query` (250ms delay) — drives the actual search computation. |

---

## Search Result (derived, not stored)

The filtered list of icons shown in the grid is derived synchronously from `debouncedQuery` and the static registry. It is never persisted.

| State | Source |
|-------|--------|
| Empty query | DEFAULT_ICONS (curated ~40-icon list) |
| Query matches Spanish map | Icons whose names appear in `spanishIconMap[normalisedQuery]` |
| Query matches map prefix | Union of all map entries whose key starts with `normalisedQuery` |
| No map match | Lucide icons whose lowercased PascalCase name includes `normalisedQuery` |
| No results at all | Empty array → "no results" message rendered |

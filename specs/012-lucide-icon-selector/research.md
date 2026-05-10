# Research: Improved Icon Selector with Spanish Search

## 1. Lucide React — Icon Registry Strategy

**Decision**: Import all Lucide icons via `import * as LucideIcons from 'lucide-react'` inside `lucideIcons.js` and export a filtered registry array.

**Rationale**: An icon picker must expose the full icon catalogue for browsing. Tree-shaking is intentionally bypassed for this file because the user can select any icon. The registry is built once at module load time and never changes at runtime. All other files in the project import individual icons for their own use (tree-shaken normally).

**Implementation**:
```js
import * as LucideIcons from 'lucide-react'

export const LUCIDE_ICONS = Object.entries(LucideIcons)
  .filter(([name, val]) => typeof val === 'function' && name !== 'createLucideIcon')
  .map(([name, Icon]) => ({ name, Icon }))
  // name is PascalCase: "Hamburger", "Wallet", "CreditCard"
```

**Alternatives considered**:
- Dynamic `import()` per icon — rejected; adds async complexity with no benefit for a picker that needs all icons.
- Bundling a hand-curated subset — rejected; defeats the purpose of exposing the full library.

---

## 2. Icon Name Storage Format

**Decision**: Store the Lucide PascalCase export name as the icon value (e.g., `"Hamburger"`, `"Wallet"`).

**Rationale**: The PascalCase name is the canonical identifier in the Lucide package and enables direct lookup (`LucideIcons[iconName]`) without any conversion. Display labels are derived from PascalCase by splitting on uppercase letters.

**Migration note**: Existing notebooks/tags with Framework7 icon names (e.g., `"heart_fill"`) will render a fallback placeholder until edited. The component checks whether the stored name exists in the Lucide registry; if not, it shows the "select icon" empty state rather than crashing.

**Alternatives considered**:
- kebab-case (`"hamburger"`) — requires a conversion function every time a component is rendered; rejected in favour of the direct-lookup approach.

---

## 3. Search Algorithm

**Decision**: Three-stage search pipeline, executed in order, stopping at the first stage that returns results.

**Stage 1 — Spanish map exact match**:
Normalise the query (lowercase, trim, remove common Spanish diacritics). Look up the normalised term in `spanishIconMap`. If found, return only the icons whose PascalCase names appear in the mapped array.

**Stage 2 — Spanish map prefix match**:
If no exact match, check whether any map key *starts with* the normalised query. Return the union of all matching keys' icon arrays. Handles partial typing (e.g., "com" → "comida" match).

**Stage 3 — Fuzzy fallback on icon name**:
Filter the full Lucide registry for icons where the PascalCase name (converted to lowercase) includes the normalised query. Catches unmapped terms and English searches simultaneously.

**Rationale**: Stages 1 and 2 give Spanish-first results. Stage 3 acts as the English/English-ish safety net and handles gaps in the curated map without requiring map maintenance for every possible query.

**Alternatives considered**:
- Full fuzzy library (fuse.js) — rejected; adds a dependency and adds complexity for marginal UX gain in a picker context.
- Levenshtein distance — rejected; overkill for icon names that are short and well-known.

---

## 4. Debounce Timing

**Decision**: 250ms debounce on the search input.

**Rationale**: 200–300ms is the industry standard for search-as-you-type inputs. At 250ms the UI feels instant to the user while avoiding unnecessary filtering on every intermediate keystroke. The filter runs in-memory (no network call), so even on a low-end device the computation cost per keystroke is negligible — the debounce is purely a UX smoothness measure.

---

## 5. Spanish Keyword Map — Coverage

**Decision**: Curate a static map covering at minimum 15 high-frequency personal-finance and everyday-life categories. Each category maps 6–10 Lucide icon names.

**Categories and sample mappings** (full map lives in `spanishIconMap.js`):

| Spanish term | Mapped Lucide icons |
|---|---|
| comida | Hamburger, Utensils, Pizza, Apple, Coffee, Sandwich, Cookie, Salad |
| dinero | Wallet, CreditCard, Banknote, Coins, PiggyBank, DollarSign, Receipt |
| salud | Heart, Activity, Pill, Stethoscope, Bandage, Hospital, Thermometer |
| transporte | Car, Bus, Train, Bike, Plane, Ship, Truck, Fuel |
| casa | Home, Building, Sofa, Bed, Bath, Key, Lamp, Armchair |
| trabajo | Briefcase, Laptop, Building2, HardHat, Wrench, Settings, Pen |
| educacion | Book, GraduationCap, Pencil, School, Library, Brain, BookOpen |
| entretenimiento | Music, Tv, Gamepad2, Film, Ticket, PartyPopper, Headphones |
| deporte | Dumbbell, Trophy, Medal, Bike, Footprints, Timer, Swords |
| viaje | Plane, Map, Compass, Backpack, MapPin, Globe, Luggage |
| ropa | Shirt, ShoppingBag, Tag, Scissors, Watch, Gem |
| mascota | Dog, Cat, Bird, Fish, Rabbit, PawPrint, Bone |
| tecnologia | Laptop, Smartphone, Monitor, Cpu, Wifi, BatteryCharging, Code |
| hogar | Home, Sofa, Refrigerator, WashingMachine, Plug, Lightbulb |
| ahorro | PiggyBank, Banknote, TrendingUp, BarChart2, Target, Percent |

**Rationale**: Prioritising personal-finance and daily-life vocabulary matches the app's domain (notebooks for tracking spending categories). The map is intentionally a static JavaScript object — no database, no server round-trip, no complexity.

---

## 6. Default Icon Set (~40 icons)

**Decision**: Curate 40 of the most recognisable Lucide icons as the default view when no search term is entered.

**Selected icons** (PascalCase names):
`Home, Star, Heart, Smile, Briefcase, Wallet, ShoppingCart, Car, Plane, Book, Music, Coffee, Pizza, Dog, Cat, Dumbbell, Laptop, Smartphone, Camera, Globe, Map, Gift, Cake, Sun, Moon, Cloud, Umbrella, Leaf, Flower2, Baby, Users, Building, School, Hospital, Church, Train, Bike, Scissors, Palette, GamepadIcon`

**Rationale**: A mix of universal symbols covering the most common life categories. 40 icons fits comfortably on a mobile screen (2–3 scrollable rows) without overwhelming the user before they type.

---

## 7. Component Location

**Decision**: Move the component from `src/components/notebooks/IconSelector.jsx` to `src/components/IconSelector/IconSelector.jsx`.

**Rationale**: The clarification session confirmed the selector must be generic across all entity types. Keeping it inside `notebooks/` would be semantically incorrect and would require awkward relative imports from non-notebook pages. Moving to the top-level `components/` folder follows the existing pattern for shared components (`OfflineBanner`, `ProtectedRoute`, `UpdateBanner`).

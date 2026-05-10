# Tasks: Improved Icon Selector with Spanish Search

**Input**: Design documents from `specs/012-lucide-icon-selector/`
**Branch**: `012-lucide-icon-selector`
**Tests**: Not requested — manual validation per Constitution IX

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: Add the Lucide React icon library to the project.

- [x] T001 Install `lucide-react` package via npm in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Static data files that all component tasks depend on. Must be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Create `src/components/IconSelector/lucideIcons.js` — export `LUCIDE_ICONS` array built from `import * as LucideIcons from 'lucide-react'`, filtering to function exports only (exclude `createLucideIcon`); each entry is `{ name: string, Icon: React.ComponentType }`; also export `DEFAULT_ICONS` — an array of ~40 curated PascalCase icon names for the default view (Home, Star, Heart, Smile, Briefcase, Wallet, ShoppingCart, Car, Plane, Book, Music, Coffee, Pizza, Dog, Cat, Dumbbell, Laptop, Smartphone, Camera, Globe, Map, Gift, Cake, Sun, Moon, Cloud, Umbrella, Leaf, Flower2, Baby, Users, Building, School, Hospital, Church, Train, Bike, Scissors, Palette, Gamepad2)
- [x] T003 [P] Create `src/components/IconSelector/spanishIconMap.js` — export `SPANISH_MAP` object with lowercase Spanish keys and PascalCase Lucide icon name arrays; cover at minimum: comida, dinero, salud, transporte, casa, trabajo, educacion, entretenimiento, deporte, viaje, ropa, mascota, tecnologia, hogar, ahorro (see research.md for icon name lists per category)

**Checkpoint**: Registry and map files ready — user story implementation can begin.

---

## Phase 3: User Story 1 — Search Icons in Spanish (Priority: P1) 🎯 MVP

**Goal**: User types a Spanish word and sees relevant Lucide icons appear in real time.

**Independent Test**: Open the icon selector sheet, type "comida" in the search bar, verify that food-related icons (Hamburger, Utensils, Pizza, Apple, etc.) appear in the grid within 300ms. Type "xyz" and verify the empty state message appears.

- [x] T004 [P] [US1] Create `src/components/IconSelector/IconSelector.module.css` — define all CSS Module classes needed by the component: `.trigger`, `.triggerIcon`, `.triggerIconEmpty`, `.triggerLabel`, `.triggerChevron`, `.sheetContent`, `.dragHandle`, `.stickyHeader`, `.resultCount`, `.grid`, `.gridItem`, `.gridLabel`, `.gridIcon`, `.emptyBlock`; grid layout is 5 columns; sticky header uses `position: sticky; top: 0`; no `style={{}}` props for static values
- [x] T005 [US1] Scaffold `src/components/IconSelector/IconSelector.jsx` — functional component accepting `{ value, onChange }` props; import Sheet, PageContent, Searchbar, Block from `framework7-react`; import `styles` from `./IconSelector.module.css`; add `isOpen` and `query` state; render a clickable trigger `<div>` that sets `isOpen(true)` and a `<Sheet>` with `swipeToClose backdrop style={{ height: '70vh' }}`; add `<Searchbar>` inside a sticky header `<div>`; add `close()` helper that resets query and closes sheet (depends on T004)
- [x] T006 [US1] Implement 3-stage search pipeline in `src/components/IconSelector/IconSelector.jsx` — add `debouncedQuery` state updated 250ms after `query` changes (use `useEffect` + `setTimeout`/`clearTimeout`); add `filtered` useMemo that: (1) returns `DEFAULT_ICONS` entries when query is empty, (2) normalises query (lowercase + trim), (3) checks `SPANISH_MAP[normalised]` for exact match, (4) checks keys starting with normalised for prefix match, (5) falls back to `LUCIDE_ICONS.filter(i => i.name.toLowerCase().includes(normalised))`; import `LUCIDE_ICONS`, `DEFAULT_ICONS` from `./lucideIcons.js` and `SPANISH_MAP` from `./spanishIconMap.js` (depends on T002, T003, T005)
- [x] T007 [US1] Implement icon grid display in `src/components/IconSelector/IconSelector.jsx` — inside the Sheet `<PageContent>`, render `<div className={styles.grid}>` mapping `filtered` to grid items each showing `<Icon size={24} className={styles.gridIcon} />` and `<span className={styles.gridLabel}>{name}</span>`; add result count paragraph `<p className={styles.resultCount}>` showing match count when query is active; render `<Block className={styles.emptyBlock}>` with `"Sin resultados para '{query}'"` when `filtered.length === 0` and query is non-empty; add drag handle `<div className={styles.dragHandle} />` at top of sheet (depends on T006)

**Checkpoint**: US1 fully testable — open sheet, type Spanish word, see icons.

---

## Phase 4: User Story 2 — Browse and Select an Icon (Priority: P2)

**Goal**: User clicks an icon from results, it is highlighted, and calling `onChange` saves the selection.

**Independent Test**: Open the icon selector, type "dinero", click the Wallet icon — verify the sheet closes, the trigger now shows the Wallet icon and its name, and the parent `onChange` receives `"Wallet"`. Click the trigger again, click Wallet again — verify `onChange` receives `null`.

- [x] T008 [P] [US2] Add selected visual state to `src/components/IconSelector/IconSelector.module.css` — add `.gridItemSelected` class with theme-coloured background (`var(--f7-theme-color)` at low opacity) and coloured icon/label; add `.gridItemDefault` class with neutral appearance; keep no static `style={{}}` props
- [x] T009 [US2] Add icon selection logic to `src/components/IconSelector/IconSelector.jsx` — add `select(iconName)` function that calls `onChange(value === iconName ? null : iconName)` then calls `close()`; in the grid, apply `styles.gridItemSelected` when `icon.name === value`, otherwise `styles.gridItemDefault`; attach `onClick={() => select(icon.name)}` and `title={icon.name}` to each grid item (depends on T007, T008)
- [x] T010 [US2] Implement dynamic trigger in `src/components/IconSelector/IconSelector.jsx` — look up the selected icon component from `LUCIDE_ICONS` when `value` is set; render `<SelectedIcon size={20} className={styles.triggerIcon} />` when found, otherwise render placeholder icon; render `<span className={styles.triggerLabel}>{value ?? 'Seleccionar ícono'}</span>` and `<span className={styles.triggerChevron}>›</span>`; use `style={{ color: value ? 'var(--f7-theme-color)' : 'var(--f7-list-item-subtitle-text-color)' }}` on the trigger div (dynamic runtime value — permitted) (depends on T009)

**Checkpoint**: US2 fully testable — select an icon, see it reflected in trigger, toggle-off works.

---

## Phase 5: Migration & Cleanup

**Purpose**: Wire the new generic component into all existing callers and remove the old implementation.

- [x] T011 [P] Update import in `src/pages/CreateNotebookPage.jsx` — change `import IconSelector from '../components/notebooks/IconSelector'` to `import IconSelector from '../components/IconSelector/IconSelector'`
- [x] T012 [P] Update import in `src/pages/EditNotebookPage.jsx` — change import path from `../components/notebooks/IconSelector` to `../components/IconSelector/IconSelector`
- [x] T013 [P] Update import in `src/components/notebooks/EditNotebookSheet.jsx` — change import path from `./IconSelector` to `../IconSelector/IconSelector`
- [x] T014 [P] Update import in `src/components/notebooks/TagsPopup.jsx` — change import path from `./IconSelector` to `../IconSelector/IconSelector`
- [x] T015 Delete the three old files: `src/components/notebooks/IconSelector.jsx`, `src/components/notebooks/IconSelector.module.css`, `src/components/notebooks/f7Icons.js` (depends on T011, T012, T013, T014)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (lucide-react installed) — **blocks all user story work**
- **User Story 1 (Phase 3)**: Depends on T002 + T003 (registry + map ready)
- **User Story 2 (Phase 4)**: Depends on Phase 3 being complete
- **Migration (Phase 5)**: Depends on Phase 4 being complete (component fully functional before wiring callers)

### Within Each User Story

- T004 and T005 are parallel (CSS file vs JSX scaffold); T005 references class names from T004
- T006 depends on T005 (adds search logic to the scaffold) and T002/T003 (uses the data files)
- T007 depends on T006 (renders the filtered results)
- T008 is parallel to T009/T010 (different file); T009 applies the classes from T008
- T010 depends on T009 (trigger reads `value` from parent, needs selection logic in place)
- T011–T014 are all parallel (different files); T015 depends on all four

### Parallel Opportunities

```
# Phase 2 — run both at once:
T002  Create lucideIcons.js
T003  Create spanishIconMap.js

# Phase 3 start — run both at once:
T004  Create IconSelector.module.css
       ↓ (T004 done)
T005  Scaffold IconSelector.jsx
       ↓ (T005 + T002 + T003 done)
T006  Search pipeline
       ↓
T007  Grid display

# Phase 4 — start T008 alongside T009 setup:
T008  Selected state CSS   (parallel with T009)
T009  Selection logic      (depends on T007 + T008)
       ↓
T010  Dynamic trigger

# Phase 5 — run all four import updates at once:
T011  T012  T013  T014   (parallel)
       ↓ (all done)
T015  Delete old files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install lucide-react
2. Complete Phase 2: Create registry + map files (T002, T003 in parallel)
3. Complete Phase 3: Build search + display (T004→T005→T006→T007)
4. **STOP and VALIDATE**: Open the selector, type "comida", confirm food icons appear
5. If validated, continue to Phase 4

### Incremental Delivery

1. Phase 1 + Phase 2 → icon library and vocabulary ready
2. Phase 3 → search and display working (US1 ✅)
3. Phase 4 → selection and trigger working (US2 ✅)
4. Phase 5 → all four callers migrated, old code deleted

---

## Notes

- [P] tasks can run in parallel (different files, no incomplete dependencies)
- [Story] label maps each task to its user story for traceability
- No unit tests per Constitution IX — validate manually at each checkpoint
- T010's `style={{ color: ... }}` is a runtime-dynamic value (theme colour conditional on selection state) — permitted by Constitution XI
- All static layout, spacing, and visual styles must live in `IconSelector.module.css`
- After T015 (delete old files), run the app and open every form that used the old selector to verify no broken imports

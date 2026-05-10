# Feature Specification: Improved Icon Selector with Spanish Search

**Feature Branch**: `012-lucide-icon-selector`
**Created**: 2026-05-10
**Status**: Draft
**Input**: User description: "icon selector is very hard to use, we need to improve it we will use Lucide react to search and select icons complete option, we need a mapper or some algorithm to search icons in spanish, and the results should reflect based on that word, should allow to choose preferred options example the user search by comida, should appear hamburger, food, etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Icons in Spanish (Priority: P1)

A user wants to assign an icon to any app entity (notebook, category, transaction, or other). They type a Spanish word such as "comida" into the icon search field. The system maps the word to related icon concepts and displays visually matching icons (e.g., hamburger, utensils, pizza, apple) in real time as they type.

**Why this priority**: This is the core pain point — the current selector is hard to use because users think in Spanish but the icon library uses English names. Without this mapping the feature is nearly unusable for Spanish-speaking users.

**Independent Test**: Can be fully tested by typing "comida" in the search box and verifying that food-related icons appear in results, delivering immediate value to Spanish-speaking users.

**Acceptance Scenarios**:

1. **Given** the icon selector is open, **When** the user types "comida", **Then** food-related icons (hamburger, utensils, pizza, apple, etc.) appear in the results list in real time
2. **Given** the icon selector is open, **When** the user types "dinero", **Then** money/finance-related icons (wallet, credit-card, coins, etc.) appear in the results list in real time
3. **Given** the icon selector is open, **When** no icons match the Spanish term, **Then** the system shows a clear "no results" message with guidance to try a different word

---

### User Story 2 - Browse and Select an Icon (Priority: P2)

A user reviews the icon search results, clicks the icon that best represents their entity, and confirms the selection so it is saved.

**Why this priority**: Selection is the essential action after search — the user must be able to clearly identify, preview, and confirm their choice before it is persisted.

**Independent Test**: Can be fully tested by selecting any icon from search results and verifying it is saved and displayed on the target entity.

**Acceptance Scenarios**:

1. **Given** search results are displayed, **When** the user clicks an icon, **Then** that icon is visually highlighted as selected and a confirmation action becomes available
2. **Given** an icon is selected, **When** the user confirms, **Then** the chosen icon is saved and shown on the entity
3. **Given** an icon is selected, **When** the user clicks a different icon, **Then** the selection changes to the new icon without requiring the user to deselect first

---

### Edge Cases

- What happens when a Spanish term has multiple meanings (e.g., "banco" = bank or bench)? Results should include icons for all interpretations.
- How does the system handle partial Spanish words or common misspellings? Partial matches should return results when possible.
- What if the icon library has no icons that match the mapped English keywords? Show "no results" with a suggestion to try a related word.
- When the user clears the search field, results reset to the curated default set of ~30–50 popular icons.
- How many icons are displayed at once? A scrollable set of the most relevant results is shown with no hard pagination.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to search for icons by typing a word or phrase in Spanish
- **FR-001a**: Search results MUST update in real time as the user types, using a short delay (debounce) to avoid triggering on every keystroke
- **FR-002**: System MUST map Spanish search terms to related English icon keywords using a curated keyword-mapping lookup
- **FR-002a**: When a Spanish term has no entry in the curated mapping, the system MUST fall back to a partial/fuzzy match against icon names directly, so gaps in the vocabulary do not result in empty results
- **FR-003**: System MUST display icons from the full icon library that match the mapped keywords
- **FR-004**: System MUST support bilingual search so that English terms also return direct icon name matches
- **FR-005**: Users MUST be able to see a clear visual preview of each icon alongside its name in search results
- **FR-006**: Users MUST be able to select an icon from search results to assign it to any app entity that supports icons (notebooks, categories, transactions, or any future labeled entity)
- **FR-007**: System MUST provide visible feedback (highlighted/selected state) when an icon is clicked
- **FR-008**: System MUST handle zero-result searches gracefully with a clear message and guidance to refine the query
- **FR-009**: System MUST display a curated set of popular/common icons (approximately 30–50) when no search term has been entered, giving users a useful starting point without overwhelming them

### Key Entities

- **Icon**: A visual symbol from the icon library identified by name; carries a visual representation and associated English keywords
- **Spanish Keyword Mapping**: A lookup that maps Spanish words or phrases to related English icon keywords (e.g., "comida" → ["food", "hamburger", "pizza", "utensils", "apple"])
- **Search Query**: The word or phrase entered by the user to find icons; may be in Spanish or English

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find and select a relevant icon in under 60 seconds using a Spanish search term
- **SC-002**: Spanish search terms for at least 10 common life categories (food, money, health, transport, home, work, entertainment, education, sport, travel) each return a minimum of 5 relevant icons
- **SC-003**: Icon selector task completion rate (user successfully selects and saves an icon) reaches 90% or higher
- **SC-004**: At least 80% of users rate the icon selector as easy to use in post-task feedback

## Clarifications

### Session 2026-05-10

- Q: Should icon results update in real time as the user types, or only on submit? → A: Real-time as-you-type (debounced)
- Q: In which contexts does the icon selector appear in the app? → A: Any entity that can be labeled/organized (fully generic component)
- Q: Should users be able to save favorite icons for quick re-access? → A: No — favorites feature is out of scope; the selector is search-only
- Q: What should the icon selector display when no search term is entered? → A: A curated set of ~30–50 popular/common icons as a starting point
- Q: When a Spanish term has no curated mapping, how should the system respond? → A: Fall back to partial/fuzzy match against icon names directly

## Assumptions

- The icon selector is a fully generic, reusable component embedded in any form flow where an app entity (notebook, category, transaction, or future entity) can have an icon assigned
- The Lucide React icon library has been chosen as the sole icon source for this feature
- The Spanish-to-English keyword mapping will be implemented as a curated static lookup table in the initial version, extensible later; terms outside the curated list fall back to partial/fuzzy matching against icon names
- English search terms work via direct name matching without requiring the Spanish mapping layer
- The initial Spanish vocabulary coverage will prioritize personal finance and everyday life categories
- Both mobile and desktop layouts are in scope for this feature
- Favorites / saved icon preferences are explicitly out of scope for this feature

# Feature Specification: User Settings Page

**Feature Branch**: `005-user-settings`
**Created**: 2026-05-02
**Status**: Draft
**Input**: User description: "now we need to add '/settings' page this page will have the complete name, email and foto of the user, the option to logout, the user can choose between ios, or google styles, the user can use darkmode, or lightmode, this should be stored on localstorage, asociated to the userID."

## Clarifications

### Session 2026-05-02

- Q: How does the user reach the settings page — where is the navigation entry point? → A: Tapping the user's own avatar (profile photo) on the notebooks list page (home screen) navigates to `/settings`. The avatar must therefore be visible on that page.
- Q: When the user taps "Cerrar sesión", should a confirmation dialog appear before the session is ended? → A: Yes — a confirm/cancel dialog must appear before the session is terminated.
- Q: How should the app handle the moment between first load and when saved preferences are applied — is a flash of default content acceptable? → A: No flash allowed. The app renders with defaults (iOS + light) and switches to saved preferences in the same render cycle before anything is visibly painted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Profile Information (Priority: P1)

An authenticated user navigates to the settings page and sees their full name, email address, and profile photo displayed prominently. This gives the user confidence they are signed in to the correct account.

**Why this priority**: Profile information is the foundational content of the settings page. Without it, users cannot verify their identity or trust that preferences belong to them.

**Independent Test**: Navigate to `/settings` → full name, email, and profile photo all appear within one second.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they open the settings page, **Then** their full name, email address, and profile photo are displayed.
2. **Given** the user's profile photo fails to load, **When** the settings page opens, **Then** a fallback avatar (initials or generic icon) is shown in place of the photo.

---

### User Story 2 - Logout (Priority: P2)

An authenticated user taps the logout option on the settings page. Their session is ended and they are redirected to the login screen.

**Why this priority**: Logout is a critical security action. Users must always be able to end their session, especially on shared devices.

**Independent Test**: Tap logout on `/settings` → session is cleared → user lands on the login screen and cannot access protected pages.

**Acceptance Scenarios**:

1. **Given** the user is on the settings page, **When** they tap "Cerrar sesión", **Then** a confirm/cancel dialog appears asking them to confirm the action.
2. **Given** the confirmation dialog is open, **When** the user confirms, **Then** their session is terminated and they are redirected to the login screen.
3. **Given** the confirmation dialog is open, **When** the user cancels, **Then** no action is taken and the settings page remains open.
4. **Given** the user has confirmed logout, **When** they attempt to navigate to a protected page, **Then** they are redirected back to the login screen.

---

### User Story 3 - Theme Selection (Priority: P3)

An authenticated user selects their preferred visual style — iOS or Google (Material Design) — from the settings page. The chosen style is applied immediately across the entire application and is remembered for future sessions.

**Why this priority**: Theme preference is a significant personalization feature that affects the entire application experience.

**Independent Test**: Select "Google" style on `/settings` → UI updates immediately → close and reopen the app → Google style is still active.

**Acceptance Scenarios**:

1. **Given** the settings page is open, **When** the user selects the iOS style, **Then** the application switches to the iOS visual theme immediately.
2. **Given** the settings page is open, **When** the user selects the Google style, **Then** the application switches to the Material Design visual theme immediately.
3. **Given** the user has selected a theme, **When** they close and reopen the app, **Then** the previously selected theme is applied automatically without any user action.
4. **Given** a second user logs in on the same device, **When** the settings page loads, **Then** that user's own saved theme is applied (independent of the first user's preference).

---

### User Story 4 - Dark / Light Mode (Priority: P4)

An authenticated user toggles between dark mode and light mode from the settings page. The color scheme is applied immediately and remembered for future sessions.

**Why this priority**: Dark mode is a widely expected accessibility and comfort feature; it is less critical than core identity and theme but highly valued by users.

**Independent Test**: Enable dark mode on `/settings` → app background and text invert → reopen app → dark mode is still active.

**Acceptance Scenarios**:

1. **Given** the settings page is open, **When** the user selects dark mode, **Then** the application color scheme switches to dark immediately.
2. **Given** the settings page is open, **When** the user selects light mode, **Then** the application color scheme switches to light immediately.
3. **Given** the user has set a color scheme, **When** they return to the app in a new session, **Then** the saved color scheme is applied automatically.
4. **Given** a second user logs in on the same device, **When** the settings page loads, **Then** that user's own saved color scheme is applied independently.

---

### Edge Cases

- What if the user's profile photo URL is broken or unavailable? A fallback avatar (user initials or a generic icon) is displayed instead.
- What if no preferences are stored for the current user (first visit or new device)? Default settings are applied: iOS theme and light mode.
- What if a different user logs in on the same device? Their own stored preferences (keyed by their user ID) are loaded, independently of the previous user's settings.
- What if localStorage is unavailable (e.g., private browsing, storage quota exceeded)? Preferences are applied for the current session only; no error is shown to the user and the page remains fully functional.
- What if the user navigates directly to `/settings` without being authenticated? They are redirected to the login screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The settings page MUST display the authenticated user's full name.
- **FR-002**: The settings page MUST display the authenticated user's email address.
- **FR-003**: The settings page MUST display the authenticated user's profile photo; if unavailable, a fallback avatar MUST be shown.
- **FR-004**: The settings page MUST provide a "Cerrar sesión" (logout) action; tapping it MUST show a confirm/cancel dialog before terminating the session and redirecting to the login screen.
- **FR-005**: The settings page MUST allow the user to choose between two visual styles: iOS and Google (Material Design).
- **FR-006**: The settings page MUST allow the user to choose between dark mode and light mode.
- **FR-007**: The selected theme and color scheme MUST take effect immediately across the entire application without requiring a page reload.
- **FR-008**: User preferences (theme and color scheme) MUST be persisted on the device, associated with the user's unique account ID, so that they survive application restarts without requiring the user to re-select them.
- **FR-009**: On application startup, the system MUST read saved preferences and apply them before the first screen is painted; no flash of default styling MUST be visible to the user. If no preferences are stored, defaults (iOS theme + light mode) are used without delay.
- **FR-010**: The settings page MUST be accessible only to authenticated users; unauthenticated access MUST redirect to the login screen.
- **FR-011**: The notebooks list page (home screen) MUST display the authenticated user's avatar in a tappable control; tapping it MUST navigate to `/settings`.
- **FR-012**: If the user's avatar image is unavailable on the notebooks list page, a fallback (initials or generic icon) MUST be displayed in its place.

### Key Entities

- **UserPreferences**: Stores a user's application preferences.
  - `userId` — the unique account identifier used as the storage key
  - `theme` — chosen visual style ("ios" or "md")
  - `colorScheme` — chosen color scheme ("light" or "dark")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Profile information (name, email, photo) is fully visible within 1 second of the settings page opening.
- **SC-002**: Theme and color scheme changes are applied to the entire application within 100 milliseconds of the user making a selection.
- **SC-003**: Saved preferences are restored automatically on every subsequent app session with no user action required, and with no perceptible flash of default styling before the correct theme and color scheme appear.
- **SC-004**: Two different users on the same device each have fully independent preference sets that do not influence each other.

## Assumptions

- The user's full name, email, and profile photo URL are available from the existing authentication session — no additional network request is required to display them.
- "Google style" refers to the Material Design (MD) visual theme, as opposed to the iOS / Apple Human Interface Guidelines theme.
- The default preference for a user with no stored settings is iOS theme with light mode.
- Preferences apply globally to the entire application; changing them on the settings page affects all screens.
- The settings page is reached by tapping the user's own avatar on the notebooks list page; the avatar is displayed in the Navbar of that page and navigates to `/settings`.
- Only theme and color scheme are stored as preferences; other potential settings (language, notifications, etc.) are out of scope for this feature.

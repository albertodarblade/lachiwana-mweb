# Feature Specification: Google SSO Login Page

**Feature Branch**: `001-google-sso-login`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "create a loginpage, in this page the user can autheticate throw our auth api with google auth sso, the client should be authenticated and consume users endpoint successfully, READ BE API to get context, if the user is not authenticated or the token was expired should redirect to this loginpage"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In with Google (Priority: P1)

An unauthenticated user opens the app and lands on the login page. They tap "Sign in with
Google", complete the Google consent flow, and are redirected to the main application
screen as an authenticated user.

**Why this priority**: Without authentication no other feature of the app is accessible.
This is the sole entry gate to the entire application.

**Independent Test**: Open the app fresh with no stored session. The login page must render.
Tapping "Sign in with Google" must launch the Google consent flow. After granting consent
the user must land on the main application page and a call to the users API endpoint must
succeed.

**Acceptance Scenarios**:

1. **Given** no stored session, **When** the user opens the app, **Then** the login page is
   displayed with "Sign in with Google" as the primary call-to-action.
2. **Given** the login page is displayed, **When** the user taps "Sign in with Google",
   **Then** the Google authorization screen is presented.
3. **Given** the Google consent screen, **When** the user grants access, **Then** they are
   redirected to the main app page with their session established.
4. **Given** a successful sign-in, **When** the main app loads, **Then** a request to the
   users API endpoint succeeds and returns data.

---

### User Story 2 - Redirect Unauthenticated Access (Priority: P2)

A user without a valid session attempts to navigate directly to any protected page. The
system intercepts the navigation and redirects them to the login page before any protected
content is displayed.

**Why this priority**: Prevents unauthorized data exposure. All content behind
authentication must be gated unconditionally.

**Independent Test**: With no stored token, attempt to navigate to a protected route URL.
The login page must appear before any protected content renders.

**Acceptance Scenarios**:

1. **Given** no stored session, **When** the user navigates to a protected route, **Then**
   they are immediately redirected to the login page.
2. **Given** a stored but invalid token, **When** the user attempts to load a protected
   page, **Then** they are redirected to the login page.

---

### User Story 3 - Session Expiry Redirect (Priority: P3)

An authenticated user whose session token has expired attempts to interact with the app.
The system detects the expired session, clears it, and redirects the user to the login page
with a message explaining the session has expired.

**Why this priority**: Google ID Tokens expire after approximately 1 hour. Users must be
gracefully re-prompted to sign in rather than seeing unexplained API errors.

**Independent Test**: Simulate a 401 Unauthorized API response. Any attempt to load data or
navigate to a protected page must redirect the user to the login page and display the
expiry message.

**Acceptance Scenarios**:

1. **Given** a stored but expired token, **When** the app makes an API request and receives
   a 401 response, **Then** the stored session is cleared and the user is redirected to the
   login page.
2. **Given** an expired token, **When** the user navigates to a protected page and the
   expiry is detected before content loads, **Then** they are redirected to the login page
   before protected content appears.
3. **Given** the user has been redirected due to expiry, **When** the login page renders,
   **Then** a message informs the user that their session has expired and they must sign in
   again.

---

### User Story 4 - Already-Authenticated User Visits Login Page (Priority: P4)

A user with a valid active session navigates to the login page (via direct URL or browser
back button). The system detects the active session and redirects them to the main app page
without displaying the login UI.

**Why this priority**: Prevents unnecessary re-authentication friction for signed-in users.

**Independent Test**: With a valid stored session, navigate to the login page URL. The main
app page must load instead without the login UI ever appearing.

**Acceptance Scenarios**:

1. **Given** a valid stored session, **When** the user navigates to the login page, **Then**
   they are automatically redirected to the main app page without displaying the login
   controls.

---

### Edge Cases

- What happens when the user denies the Google consent screen? The login page must
  re-display with a message indicating sign-in was cancelled, and the user can retry.
- What happens when Google's authorization service is unreachable? The login page must
  display an error message and allow the user to retry without crashing.
- What happens if the OAuth callback arrives but the token cannot be extracted? The login
  page must display an error, no session must be stored, and the user can retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Login page MUST display "Sign in with Google" as the primary and only
  sign-in action.
- **FR-002**: Activating "Sign in with Google" MUST initiate a full-page redirect to the
  Google OAuth authorization flow via the backend auth endpoint (`GET /api/v1/auth/google`).
  The current browser tab navigates away; no popup window is used.
- **FR-003**: After a successful Google authorization the system MUST receive and persist
  the authentication token and user profile in the browser's local storage so the session
  survives app restarts within the token's lifetime.
- **FR-004**: After successful authentication the system MUST redirect the user to the page
  they originally intended to visit before being sent to login; if no prior destination
  exists, the user is redirected to the home/dashboard page.
- **FR-005**: All requests to protected API endpoints MUST include the stored authentication
  token as a Bearer authorization header.
- **FR-006**: When a protected API endpoint returns a 401 Unauthorized response, the system
  MUST clear the stored session and redirect the user to the Login page.
- **FR-007**: When a user without a valid session navigates to any protected route, the
  system MUST redirect them to the Login page before rendering protected content.
- **FR-008**: When a user with a valid session navigates to the Login page, the system MUST
  redirect them to the main application page without displaying the login UI.
- **FR-009**: The Login page MUST display a user-friendly error message when the Google
  authorization flow fails or is cancelled.
- **FR-010**: The Login page MUST display a session-expiry message when the user has been
  redirected due to an expired or invalid token.

### Key Entities

- **AuthSession**: Represents the authenticated state persisted in local storage. Attributes:
  `token` (Google ID Token JWT, expires ~1 hour), `user` (`googleId`, `email`, `name`,
  `picture`, `createdAt`). Created on successful sign-in. Cleared on sign-out or 401
  response. Survives browser/tab close; removed only explicitly.
- **UserProfile**: Read-only identity data returned from the auth callback. Attributes:
  `googleId`, `email`, `name`, `picture`, `createdAt`. Used for display purposes only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user completes the full sign-in flow (tap button → Google consent →
  main app) in under 15 seconds on a standard mobile connection.
- **SC-002**: Users without a valid session are redirected to the login page within 500ms of
  accessing a protected resource.
- **SC-003**: Users with a valid session who visit the login page are redirected to the main
  app within 200ms.
- **SC-004**: The login page renders its initial UI within 2 seconds on a mid-range mobile
  device.
- **SC-005**: After successful sign-in, the first API call to a protected endpoint succeeds
  100% of the time when the network is available.

## Clarifications

### Session 2026-04-28

- Q: Should the Google sign-in open as a full-page redirect or a popup window? → A: Full-page redirect — the app navigates to the Google consent screen and returns to a callback route. No popup window is used.
- Q: After a successful sign-in, where should the user land? → A: Redirect to the page the user originally intended to visit; fall back to home/dashboard if no prior destination exists.
- Q: How long should the user's session persist on the device? → A: localStorage — session survives app restarts and tab closes; cleared only on sign-out or 401 response.

## Assumptions

- The backend auth callback (`GET /api/v1/auth/google/callback`) returns a JSON payload
  containing `{ idToken, user }` which the frontend receives and processes.
- The Google ID Token is the sole authentication credential; no refresh token mechanism
  exists. Sessions expire approximately 1 hour after sign-in.
- Google SSO is the sole sign-in method; no email/password or other provider is offered.
- Desktop browser support is a secondary concern; the primary target is mobile browsers and
  the mobile web experience takes precedence.
- The "main application page" after sign-in is the home/dashboard route of the app.
- The backend base URL is available as a configuration variable in the frontend environment.

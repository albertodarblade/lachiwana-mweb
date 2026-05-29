# Feature Specification: Sliding Session Auth — Frontend Integration

**Feature Branch**: `015-sliding-session-auth`  
**Created**: 2026-05-25  
**Status**: Draft  
**Input**: User description: "we implemented sliding session auth on the be could you read the spec and apply the front end to use the new methods"

## Clarifications

### Session 2026-05-25

- Q: What should users see while the startup session check (page load refresh) runs? → A: Full-screen loading spinner while startup refresh runs; navigate to destination once resolved.
- Q: When the refresh endpoint returns 429 (rate limit), what should the app do? → A: Show an error toast ("Too many requests, please wait a moment") and keep the user on the current screen — do not redirect to login.
- Q: Should the frontend log auth events? → A: Console-only debug logs (e.g., `[auth] token refreshed`, `[auth] session expired`) for development/debugging; no external service.

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Auth Callback Token Capture (Priority: P0)

After Google sign-in completes, the backend redirects to the frontend `/auth/callback` route with `accessToken`, `expiresIn`, `expiresAt`, and `user` as URL query parameters. The frontend reads these parameters, stores the Access Token in memory, clears the parameters from the URL (to prevent token leakage in browser history and referrer headers), stores the user profile, schedules proactive renewal, and navigates the user to the app home.

**Why this priority**: All other stories depend on successfully capturing and storing the Access Token at sign-in time.

**Independent Test**: After Google sign-in, the browser lands on `/auth/callback`, the URL parameters are removed, the user is navigated home, and subsequent protected API calls succeed with the captured token.

**Acceptance Scenarios**:

1. **Given** a successful Google sign-in, **When** the backend redirects to `/auth/callback?accessToken=...&expiresIn=3600&expiresAt=...&user=...`, **Then** the frontend reads the params, stores the token in memory, clears params from the URL, and navigates to the home screen.
2. **Given** the `/auth/callback` route receives no `accessToken` param, **When** the page loads, **Then** the user is redirected to the login screen.

---

### User Story 1 - Transparent Session Continuation (Priority: P1)

A user opens the app and signs in with Google. After 1 hour of use, their Access Token expires. Without any visible interruption, the app silently obtains a new Access Token using the Refresh Token stored in the HttpOnly cookie. The user continues working as if nothing happened.

**Why this priority**: This is the core value of the sliding session — users must never be forced to re-login while actively using the app. If this story fails, the entire auth experience degrades.

**Independent Test**: Can be fully tested by: sign in, wait for token expiry (or simulate it), make a protected API call, and confirm it succeeds without the user being redirected to login.

**Acceptance Scenarios**:

1. **Given** an authenticated user whose Access Token has just expired, **When** they perform any action that calls a protected API endpoint, **Then** the app silently refreshes the token and the original request succeeds without user interruption.
2. **Given** a valid in-memory Access Token, **When** the user makes API calls, **Then** the token is attached to requests and no refresh is attempted.
3. **Given** a concurrent scenario where two API calls fail with 401 simultaneously, **When** the refresh completes, **Then** both original requests are retried and succeed — only one refresh call is made.

---

### User Story 2 - Proactive Token Renewal (Priority: P2)

Before the Access Token expires, the app proactively refreshes it in the background based on the `expiresIn`/`expiresAt` values returned by the sign-in and refresh endpoints. This avoids a 401 latency hit during active use.

**Why this priority**: Improves UX by eliminating the brief delay that occurs when a token expires mid-request and a reactive refresh is needed.

**Independent Test**: Can be tested by: sign in, observe that a refresh call is made before the token expires (within the configured renewal window), and confirm the new token is stored without any failed API calls.

**Acceptance Scenarios**:

1. **Given** a valid Access Token with 5 minutes remaining before expiry, **When** the renewal window threshold is reached, **Then** the app refreshes the token in the background without any user action.
2. **Given** a proactive refresh is already in flight, **When** the threshold is reached again, **Then** no duplicate refresh call is made.

---

### User Story 3 - Session Expiry Redirect (Priority: P3)

A user leaves the app idle for more than 7 days. When they return, the Refresh Token has expired. Any attempt to call a protected endpoint (or proactively refresh) results in a 401 with no valid recovery. The app redirects the user to the login screen with a clear message.

**Why this priority**: Handles the end-of-session boundary gracefully, ensuring users are not left in a broken state.

**Independent Test**: Can be tested by: simulate an expired Refresh Token, trigger a token refresh attempt, and confirm the user is redirected to login.

**Acceptance Scenarios**:

1. **Given** an expired Refresh Token, **When** the app attempts to refresh, **Then** the refresh fails with 401 and the user is redirected to the login screen.
2. **Given** the user is redirected to login, **When** they sign in again, **Then** a new session is started and they can continue using the app.

---

### User Story 4 - Explicit Sign-Out (Priority: P4)

A user clicks "Sign out." The app calls the sign-out endpoint, clears the in-memory Access Token, and navigates the user to the login screen. The server-side Refresh Token is invalidated.

**Why this priority**: Necessary for users on shared or public devices to end their session securely.

**Independent Test**: Can be tested by: click sign out, confirm navigation to login screen, confirm subsequent protected API calls return 401.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click "Sign out", **Then** the sign-out API is called, the in-memory token is cleared, and the user is navigated to the login screen.
2. **Given** a signed-out user, **When** they navigate to a protected route, **Then** they are redirected to login.

---

### Edge Cases

- What happens when the device goes offline mid-refresh? The pending refresh fails; the app should retry when connectivity is restored or redirect to login if the token is already expired.
- What happens if two concurrent 401 responses trigger simultaneous refresh attempts? Only one refresh call must be made; the second must queue and reuse the result of the first.
- What happens if the refresh endpoint returns 429 (rate limit)? The app shows a toast ("Too many requests, please wait a moment") and keeps the user on the current screen. The session is not cleared and no redirect to login occurs.
- What happens if sign-in returns no `expiresAt` field (schema mismatch)? The app must fall back to reactive refresh only (no proactive scheduling).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST store the Access Token exclusively in memory (never in `localStorage`, `sessionStorage`, or cookies) to minimize XSS exposure.
- **FR-002**: The app MUST attach the in-memory Access Token as a Bearer token on every outgoing request to a protected API endpoint.
- **FR-003**: The app MUST implement a centralized HTTP interceptor that detects 401 responses and triggers a silent token refresh before retrying the original request.
- **FR-004**: The interceptor MUST queue all concurrent 401-triggered requests and replay them once a single refresh completes, preventing multiple simultaneous refresh calls.
- **FR-005**: On receiving a new Access Token from the refresh endpoint, the app MUST update the in-memory token and retry all queued requests with the new token.
- **FR-006**: The app MUST schedule proactive token renewal based on the `expiresAt` timestamp received from the sign-in and refresh responses, renewing the token before it expires (e.g., 5 minutes before expiry).
- **FR-007**: If the refresh endpoint returns a 401 (token expired or revoked), the app MUST clear the in-memory token, cancel any queued retries, and redirect the user to the login screen.
- **FR-008**: The app MUST call the sign-out API endpoint when the user explicitly signs out, clear the in-memory token, cancel any scheduled renewal, and navigate to the login screen.
- **FR-009**: The app MUST NOT redirect the user to login for transient failures — only for definitive auth failures (401 from the refresh endpoint). A 429 (rate limit) response from the refresh endpoint MUST display a toast notification ("Too many requests, please wait a moment") and leave the user on the current screen without clearing the session.
- **FR-011**: The app MUST emit console-only debug log entries for the following auth events: token captured at callback, proactive refresh triggered, silent refresh success, silent refresh failure (401), rate-limit response (429), session expiry redirect, and sign-out. No auth event data is sent to any external service.

- **FR-010**: On app startup (page load or app re-mount), the app MUST display a full-screen loading spinner while attempting a silent refresh to restore session state. Once the refresh resolves — successfully or not — the spinner is dismissed and the user is navigated to either the originally requested route (success) or the login screen (failure / no session).

### Key Entities

- **Access Token (in-memory)**: Short-lived bearer credential stored only in JavaScript memory. Cleared on sign-out, page reload, or session expiry.
- **Token Refresh State**: Application-level state tracking whether a refresh is currently in flight, used to de-duplicate concurrent refresh requests.
- **Renewal Timer**: Scheduled callback that fires before token expiry to trigger proactive refresh. Cleared on sign-out.
- **Request Queue**: List of pending API calls held while a refresh is in progress; replayed with the new token on success, cancelled on failure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users actively using the app never see a login redirect as long as their Refresh Token is valid (within 7 days of last use).
- **SC-002**: When a token expires mid-session, the user experiences no visible interruption — the failed request completes within 1 second of the token being refreshed.
- **SC-003**: In a scenario where 10 concurrent requests receive a 401, exactly 1 refresh call is made to the server and all 10 requests are retried successfully.
- **SC-004**: The app initiates proactive token renewal at least 5 minutes before the Access Token expires, so no request is blocked waiting for a refresh.
- **SC-005**: After sign-out, no protected API call can succeed from the same browser tab (in-memory token cleared within 500ms of sign-out action).
- **SC-006**: On a fresh page load with a valid Refresh Token cookie, the app restores the session and renders protected content without requiring the user to log in again.

## Assumptions

- The backend sliding session auth implementation is complete and live (per `../Lachiwana-service/specs/010-sliding-session-auth`). The frontend will consume the new auth endpoints as specified.
- After Google sign-in, the backend redirects to `/auth/callback?accessToken=<jwt>&expiresIn=3600&expiresAt=<iso8601>&user=<urlEncoded>`. The frontend reads these query params to capture the token.
- The Refresh Token is delivered and managed exclusively via an `HttpOnly` cookie (`lachiwana_rt`) — the frontend never reads or writes it directly.
- The refresh endpoint is `POST /api/v1/auth/refresh`; the sign-out endpoint is `POST /api/v1/auth/signout`.
- Both refresh and sign-out are rate-limited to 20 requests per 60 seconds per IP.
- A single centralized HTTP client instance (e.g., an Axios or Fetch wrapper) handles all API calls, making a single interceptor sufficient to cover all requests.
- The proactive renewal window (time before expiry to trigger refresh) is 5 minutes — configurable but not a user-facing setting.
- Mobile support and service-worker-based background refresh are out of scope for this iteration.
- The existing Google sign-in callback already handles the new token response shape from the backend; this spec focuses on session maintenance after initial sign-in.

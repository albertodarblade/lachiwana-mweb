<!--
SYNC IMPACT REPORT
Version change: N/A (template) → 1.0.0
Modified principles: N/A (initial ratification from template)
Added sections:
  - UI/UX Philosophy (Principles I–IV)
  - Data Fetching & State Management (Principles V–VII)
  - Engineering Standards (Principles VIII–X)
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Constitution Check gates now concrete)
  - .specify/templates/spec-template.md ✅ no changes required
  - .specify/templates/tasks-template.md ✅ no changes required (tests already marked optional)
  - .specify/templates/commands/ ✅ no command templates found; skipped
Follow-up TODOs: None — all placeholders resolved
-->

# Lachiwana Mobile Constitution

## UI/UX Philosophy

### I. Mobile-First Implementation

All features MUST be designed and developed for mobile devices as the primary target.
Desktop responsiveness is a secondary adaptation applied only after the mobile experience
is complete and validated. No feature may be shipped if it degrades the mobile experience
in order to accommodate a desktop layout.

### II. Clean & Minimalist Layout

Interfaces MUST prioritize whitespace, clear typography, and clutter-free composition.
Every screen MUST have a single dominant action; decorative elements that do not serve
user focus are prohibited. Visual density MUST remain low enough that the primary action
is immediately apparent without scanning.

### III. Framework7 as Primary UI Library

Framework7 is the MANDATORY foundation for all UI components. No alternative UI library
may be introduced without a constitutional amendment. All components MUST conform to
Framework7's theme tokens, spacing scale, and interaction patterns to guarantee a
consistent look and feel across the application.

### IV. Custom Component Strategy

When a required component is not available in Framework7's catalog, it MUST be built from
scratch while matching Framework7's visual language, motion design, and accessibility
standards. Importing third-party component libraries as substitutes is not permitted;
custom implementations are the only accepted alternative to native Framework7 components.

## Data Fetching & State Management

### V. TanStack Query as API Orchestration Layer

TanStack Query (React Query) is the EXCLUSIVE engine for all server state and API
consumption. Direct `fetch` or `axios` calls at the component level, outside of a
query function or mutation function, are not permitted. All remote data MUST be
accessed through `useQuery` or `useMutation` hooks.

### VI. Optimistic UI

Every mutation MUST implement optimistic updates so that the interface responds
instantly, regardless of network latency. Perceived latency during standard write
operations is considered a UX defect. Rollback logic MUST be implemented alongside
every optimistic update to restore previous state on mutation failure.

### VII. Cache Integrity

Query invalidation and cache synchronization MUST be enforced after every mutation that
alters server state. Stale data surfaced to the user after a successful write is
considered a defect. Cache keys MUST be structured to allow precise, targeted
invalidation without over-flushing unrelated queries.

## Engineering Standards

### VIII. Clean Code Principles

Code MUST be self-documenting through descriptive naming conventions and
single-responsibility functions. Comments are reserved exclusively for non-obvious
constraints, hidden invariants, or third-party workarounds. Inline narration of what
the code does is prohibited; well-named identifiers carry that responsibility.

### IX. Velocity over Ceremony

No unit tests will be created. Delivery speed and UX quality take precedence over
test coverage metrics. Validation relies on rapid manual testing and integration
verification. The time reclaimed from test authorship MUST be reinvested in faster
iteration and higher-fidelity UX outcomes.

### X. Maintainability

The codebase MUST be structured for high readability so that any senior developer can
contribute to the monorepo with zero onboarding friction. File structure, naming
conventions, and module boundaries MUST follow the conventions established in the
active feature plan at all times. Abstractions are introduced only when three or more
concrete usages justify them.

## Governance

This constitution supersedes all other documented practices and conventions within this
project. Amendments require a new `/speckit-constitution` invocation with documented
rationale, a semantic version bump (MAJOR for principle removals or redefinitions,
MINOR for additions, PATCH for clarifications), and propagation to all dependent
templates.

All feature plans MUST include a Constitution Check gate before Phase 0 research and
MUST re-verify compliance after Phase 1 design. Any constitution violation introduced
by implementation necessity MUST be documented in the plan's Complexity Tracking table
with explicit justification for why a simpler, compliant approach was insufficient.

**Version**: 1.0.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28

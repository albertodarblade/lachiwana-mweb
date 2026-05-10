<!--
SYNC IMPACT REPORT
Version change: 1.2.0 → 1.3.0 (MINOR — one new principle added)
Modified principles: none
Added sections:
  - XIV. data-testid on Interactive Elements (Engineering Standards)
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (XIV checklist gate added)
  - .specify/templates/spec-template.md ✅ no changes required
  - .specify/templates/tasks-template.md ✅ no changes required
Follow-up TODOs: none
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

### XI. CSS Modules for All Styling

All component styling MUST use co-located CSS Modules (`.module.css` files) imported as
`import styles from './Component.module.css'`. Inline `style` props are forbidden except
for genuinely dynamic values that cannot be expressed in static CSS — runtime colors
derived from server data, numeric offsets computed in JavaScript, or values that change
on every render. Static layout, spacing, typography, borders, and visual appearance MUST
live in the corresponding `.module.css` file and NEVER in a `style={{}}` prop. This rule
applies to every `.jsx` component and page in the project without exception.

### XII. Lucide React for All Icons

Lucide React is the EXCLUSIVE source of icons across the entire application. Every icon
rendered in JSX MUST use a named Lucide React component (e.g. `<Wallet size={20} />`).
The Framework7 icon font (`f7-icons` CSS class and `<i class="f7-icons">` elements) MUST
NOT appear in any `.jsx` file. No other icon library may be introduced. When a Lucide
icon does not exist for a use case, a custom SVG component MUST be built using
`createLucideIcon` or as a plain SVG — never by falling back to the F7 font or an
alternative library. Dynamic icon rendering (e.g. user-selected notebook icons) MUST
resolve names through the shared `LUCIDE_ICONS` registry in
`src/components/IconSelector/lucideIcons.js`.

### XIII. pnpm as Package Manager

pnpm is the MANDATORY package manager for this project. `npm` and `yarn` MUST NOT be
used to install, update, remove, or audit packages under any circumstances. All
`package.json` scripts, CI pipelines, and developer instructions MUST reference `pnpm`.
The presence of `pnpm-lock.yaml` is the authoritative lock file; `package-lock.json` and
`yarn.lock` MUST NOT exist in the repository. Any command requiring package management
MUST be prefixed with `pnpm` (e.g. `pnpm add`, `pnpm run`, `pnpm dlx`).

### XIV. data-testid on Interactive Elements

Every interactive element MUST carry a `data-testid` attribute with a unique,
descriptive, kebab-case value scoped to its component and action. Interactive elements
include — but are not limited to — buttons, links, inputs, textareas, selects, clickable
divs, form elements, and any element with an `onClick`, `onChange`, or `onSubmit`
handler. Framework7 components that accept native HTML attributes (e.g. `Button`, `Link`,
`ListInput`) MUST also receive `data-testid`. The value format MUST follow the pattern
`<component>-<action>` or `<component>-<descriptor>` (e.g. `create-notebook-submit`,
`icon-selector-trigger`, `tag-delete-button`). This enables reliable debugging via
browser DevTools and provides anchor points for future automated test targeting without
coupling tests to implementation details such as class names or element types.

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

**Version**: 1.3.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-05-10

---
artifact_type: master-requirements
name: ix-ui
org: agent-ix
component_type: react-lib
tags:
  - design-system
  - react
  - terminal
  - clack
  - listr2
  - ansi
implementation_language: typescript
relationships:
  - target: "ix://agent-ix/ix-cli"
    type: "consumed_by"
    cardinality: "1:N"
standards_alignment:
  - iso-iec-ieee-29148
  - ieee-828
---
# Master Requirements Specification
## IX UI — Agent IX Design System

---

## 1. Purpose

This document defines the **scope, intent, and governing requirements framework** for the ix-ui design system.

It establishes:
- The problem space addressed by the design system
- The boundaries of responsibility across `semantic`, `cli`, and `web` packages
- The authoritative structure for requirements, verification, and change control
- The shared visual and interaction language for all Agent IX CLI and web surfaces

This document is the **top-level requirements artifact** for the repository.

---

## 2. Scope

### 2.1 In Scope

This specification governs:
- The `semantic` package: platform-agnostic state model, glyph vocabulary, and shared type contracts
- The `cli` package: terminal UI components (phase-table, task-list, prompts, spinners) using ANSI/cursor control
- The `web` package: React component equivalents of cli components, CSS custom property tokens
- The design language contract shared across all Agent IX CLI tools and web dashboards
- Non-TTY / CI mode output contracts for all terminal components
- Component consumption API for first-party and third-party CLI packages

### 2.2 Out of Scope

This specification does not govern:
- Application-specific business logic in consuming CLIs
- The `ix-cli` command tree or plugin system
- Deployment concerns
- Branding and naming conventions (deferred to future versions)
- Storybook configuration and visual regression testing (deferred)

---

## 3. System Overview

### 3.1 System Description

ix-ui is a **multi-package TypeScript design system** providing a consistent visual and interaction language across Agent IX terminal (CLI) and web surfaces.

The system is organized into three published packages:

| Package | Name | Purpose |
|---------|------|---------|
| `packages/semantic` | `@agent-ix/ix-ui-semantic` | Platform-agnostic state types, glyph vocabulary, phase model |
| `packages/cli` | `@agent-ix/ix-ui-cli` | Terminal components: phase-table, task-list, clack wrappers |
| `packages/web` | `@agent-ix/ix-ui-web` | React components mirroring CLI components; CSS tokens |

`semantic` has no runtime dependencies. `cli` and `web` both depend on `semantic` and render the same conceptual states on their respective surfaces.

### 3.2 Intended Users

- **First-party CLI package authors** — `ix-cli` packages (`core`, `local`, `elements`, `spec`) import `@agent-ix/ix-ui-cli` for all terminal output
- **Third-party plugin authors** — teams building CLI plugins for the Agent IX ecosystem
- **Web dashboard authors** — teams building React UIs that reflect the same phase/state model as the CLI

---

## 4. Requirements Architecture

```
spec/
├── spec.md                     # This document
├── stakeholder/                # StR-XXX
├── usecase/                    # US-XXX
├── functional/                 # FR-XXX
├── non-functional/             # NFR-XXX
├── tests.md                    # Bidirectional requirements ↔ tests mapping
└── assets/                     # Diagrams, mockups
```

---

## 5. Requirement Classes

### 5.1 Stakeholder Requirements (`StR-XXX`)
Authoritative needs from CLI authors, plugin authors, and dashboard authors.

### 5.2 User Stories (`US-XXX`)
Usage scenarios describing developer intent when consuming the design system.

### 5.3 Functional Requirements (`FR-XXX`)
Testable behavioral contracts for each package and component.

### 5.4 Non-Functional Requirements (`NFR-XXX`)
Quality constraints: accessibility, performance, consistency, and API stability.

---

## 6. Requirement Identification

| Artifact | Format | Example |
|----------|--------|---------|
| Stakeholder Requirement | `StR-XXX` | `StR-001` |
| User Story | `US-XXX` | `US-002` |
| Functional Requirement | `FR-XXX` | `FR-014` |
| Non-Functional Requirement | `NFR-XXX` | `NFR-003` |
| Acceptance Criteria | `{FR}-AC-N` | `FR-014-AC-1` |
| Test Case | `TC-XXX` | `TC-021` |

Identifiers are immutable once assigned.

---

## 7. Requirement Quality Policy

All functional requirements SHALL:
- Define observable behavior
- Be unambiguous and atomic
- Be testable through explicit criteria

---

## 8. State and Execution Model

### 8.1 Phase State Model (`semantic`)

The canonical phase state vocabulary is defined in `@agent-ix/ix-ui-semantic`. All components in `cli` and `web` MUST use these types exclusively — no local state enumerations are permitted.

```
PhaseState: pending | queued | running | done | failed
```

### 8.2 Glyph Vocabulary

The canonical glyph mapping is defined in `@agent-ix/ix-ui-semantic`:

| State | TTY glyph | Non-TTY text | Animated |
|-------|-----------|--------------|----------|
| `pending` | `·` | `pending` | No |
| `queued` | `⏳` | `queued` | Yes (spinner) |
| `running` | `⟳` | `running` | Yes (spinner) |
| `done` | `✓` | `done` | No |
| `failed` | `✗` | `failed` | No |

### 8.3 Rendering Platform Contract

`cli` renders using ANSI escape codes and cursor-up sequences. `web` renders using React and CSS custom properties. Both derive state semantics from `semantic` — the rendering layer is platform-specific, the state model is not.

---

## 9. Component Model

### 9.1 CLI Components (`@agent-ix/ix-ui-cli`)

| Component | Description | Reference |
|-----------|-------------|-----------|
| `PhaseTable` | Concurrent multi-item progress with phase columns, live cursor-up redraws, and frozen final state | ix-local-cli FR-022 |
| `TaskList` | Listr2-based reactive task spinner with `@clack/prompts` intro/outro framing | ix-local-cli FR-005 |
| `intro` / `outro` | `@clack/prompts` wrappers for consistent command framing | ix-local-cli NFR-001 |

### 9.2 Web Components (`@agent-ix/ix-ui-web`)

React equivalents of the CLI components, sharing the `semantic` state model:

| Component | CLI equivalent |
|-----------|---------------|
| `PhaseTable` | `cli/PhaseTable` |
| `StatusBadge` | Phase glyph inline display |
| `TaskProgress` | `cli/TaskList` |

### 9.3 CSS Token Contract

`@agent-ix/ix-ui-web` publishes CSS custom properties for all semantic states. Tokens are NOT shared with `cli` (terminal uses ANSI, not CSS).

---

## 10. Error and Failure Model

- Components SHALL NOT throw on invalid `PhaseState` values — they SHALL render a `failed` glyph and log a warning
- `PhaseTable` SHALL handle empty item lists gracefully (render nothing, no crash)
- CLI components SHALL detect non-TTY environments and fall back to plain-text output automatically

---

## 11. Traceability

Bidirectional traceability SHALL be maintained between:
- Stakeholder Requirements → Functional Requirements
- Functional Requirements → Acceptance Criteria → Test Cases

---

## 12. Verification Strategy

- `semantic`: unit tests for type contracts and glyph mapping
- `cli`: unit tests with TTY mock; snapshot tests for rendered output
- `web`: React Testing Library unit tests; visual snapshot tests

---

## 13. References

- ISO/IEC/IEEE 29148 — Requirements Engineering
- IEEE 828 — Configuration Management
- ix-local-cli FR-022 — Phase-column table reference implementation
- ix-local-cli FR-005 — Reactive output display reference implementation
- ix-local-cli NFR-001 — CLI output style consistency

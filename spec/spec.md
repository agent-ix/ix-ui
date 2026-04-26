---
artifact_type: master-requirements
name: ix-ui
org: agent-ix
component_type: node-lib
tags:
  - design-system
  - terminal
  - clack
  - listr2
  - ansi
implementation_language: typescript
depends_on: []
relationships:
  - target: "ix://agent-ix/ix-themes"
    type: "requires"
    cardinality: "1:1"
standards_alignment:
  - iso-iec-ieee-29148
  - ieee-828
---
# Master Requirements Specification
## IX UI — Agent IX CLI Design System

---

## 1. Purpose

This document defines the **scope, intent, and governing requirements framework** for ix-ui.

ix-ui is the **terminal design system** for Agent IX. It provides the shared state vocabulary and CLI output components used by all Agent IX CLI tools.

Web/React theming is owned by `ix-themes` (`@agent-ix/ix-themes`). ix-ui and ix-themes share a conceptual design language but have no runtime dependency on each other. The `semantic` package provides the shared TypeScript contract that both sides can reference.

---

## 2. Scope

### 2.1 In Scope

This specification governs:
- The `semantic` package: platform-agnostic state types, glyph vocabulary, phase model — no runtime deps
- The `cli` package: terminal UI components (phase-table, task-list, prompts, spinners) using ANSI/cursor control
- Non-TTY / CI mode output contracts for all terminal components
- Component consumption API for first-party and third-party CLI packages

### 2.2 Out of Scope

This specification does not govern:
- React components or CSS tokens — owned by `ix-themes`
- Application-specific business logic in consuming CLIs
- The `ix-cli` command tree or plugin system
- Branding and naming conventions (deferred)

---

## 3. System Overview

### 3.1 System Description

ix-ui is a **two-package TypeScript monorepo** providing terminal output components and the shared state vocabulary for the Agent IX CLI ecosystem.

| Package | Name | Purpose |
|---------|------|---------|
| `packages/semantic` | `@agent-ix/ix-ui-semantic` | Platform-agnostic state types, glyph vocabulary, phase model |
| `packages/cli` | `@agent-ix/ix-ui-cli` | Terminal components: phase-table, task-list, clack wrappers |

`semantic` has no runtime dependencies. `cli` depends on `semantic`.

`ix-themes` owns the web/React side and mirrors the same design language independently.

### 3.2 Intended Users

- **First-party CLI package authors** — `ix-cli` packages import `@agent-ix/ix-ui-cli` for all terminal output
- **Third-party plugin authors** — teams building CLI plugins for the Agent IX ecosystem

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
Authoritative needs from CLI authors and plugin authors.

### 5.2 User Stories (`US-XXX`)
Usage scenarios describing developer intent when consuming the design system.

### 5.3 Functional Requirements (`FR-XXX`)
Testable behavioral contracts for each package and component.

### 5.4 Non-Functional Requirements (`NFR-XXX`)
Quality constraints: consistency, API stability, TTY/non-TTY correctness.

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

The canonical phase state vocabulary is defined in `@agent-ix/ix-ui-semantic`. All CLI components MUST use these types exclusively — no local state enumerations are permitted in consuming packages.

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

### 8.3 Platform Boundary

ix-ui is terminal-only. Web rendering (CSS tokens, React components) is owned by `ix-themes`. The design language is kept in sync through shared conceptual vocabulary, not a shared runtime dependency.

---

## 9. Component Model

### 9.1 CLI Components (`@agent-ix/ix-ui-cli`)

| Component | Description | Reference |
|-----------|-------------|-----------|
| `PhaseTable` | Concurrent multi-item progress with phase columns, live cursor-up redraws, and frozen final state | ix-local-cli FR-022 |
| `TaskList` | Listr2-based reactive task spinner with `@clack/prompts` intro/outro framing | ix-local-cli FR-005 |
| `intro` / `outro` | `@clack/prompts` wrappers for consistent command framing | ix-local-cli NFR-001 |

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

---

## 13. References

- ISO/IEC/IEEE 29148 — Requirements Engineering
- IEEE 828 — Configuration Management
- ix-local-cli FR-022 — Phase-column table reference implementation
- ix-local-cli FR-005 — Reactive output display reference implementation
- ix-local-cli NFR-001 — CLI output style consistency
- ix-themes — web/React design token system

---
artifact_type: master-requirements
name: ix-ui
org: agent-ix
component_type: node-lib
tags:
  - design-system
  - terminal
  - ink
  - react
  - jsx
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

ix-ui is the **terminal design system** for Agent IX. It provides the shared state vocabulary and CLI output components used by all Agent IX CLI tools. The `cli` package is implemented on **Ink** (React for terminals); components are JSX, layout is yoga flexbox, and the framework owns all stdout writes and cursor positioning.

Web/React DOM theming is owned by `ix-themes` (`@agent-ix/ix-themes`). ix-ui and ix-themes share a conceptual design language but have no runtime dependency on each other. The `semantic` package provides the shared TypeScript contract that both sides can reference.

---

## 2. Scope

### 2.1 In Scope

- The `semantic` package: platform-agnostic state types, glyph vocabulary, phase model — no runtime deps.
- The `cli` package: terminal Ink components (`<Frame>`, `<Listing>`, `<PhaseTable>`, `<TaskList>`, prompts).
- Async hooks (`useInterval`, `useExecaPhase`, `useKubectlRollout`, `useHelmHookWatcher`) for wiring child-process and Kubernetes work into components.
- The `render(element, opts?)` mounting entry point.
- Non-TTY / CI mode output contracts via Ink's plain-mode rendering.
- Component consumption API for first-party and third-party CLI packages.

### 2.2 Out of Scope

- React DOM components or CSS tokens — owned by `ix-themes`.
- Application-specific business logic in consuming CLIs.
- The `ix-cli` command tree or plugin system.
- Branding and naming conventions (deferred).

---

## 3. System Overview

### 3.1 System Description

ix-ui is a **two-package TypeScript monorepo**:

| Package | Name | Purpose |
|---------|------|---------|
| `packages/semantic` | `@agent-ix/ix-ui-semantic` | Platform-agnostic state types, glyph vocabulary, phase model. Zero runtime deps. |
| `packages/cli` | `@agent-ix/ix-ui-cli` | Terminal Ink components: Frame, Listing, PhaseTable, TaskList, prompts, hooks, render entry. |

Runtime dependencies of `packages/cli`:

- `react`, `ink` — reconciler + renderer.
- `ink-spinner`, `ink-text-input`, `ink-select-input` — primitive components used by `<HeaderSpinner>` and prompt components.
- `picocolors` — ANSI color helpers used inside `<Text>` children.
- `execa` — used internally by async hooks (FR-007) for child-process work.
- `@agent-ix/ix-ui-semantic` (workspace).

`ix-themes` owns the web/React DOM side and mirrors the same design language independently.

### 3.2 Intended Users

- **First-party CLI package authors** — `ix-cli` packages import `@agent-ix/ix-ui-cli` for all terminal output.
- **Third-party plugin authors** — teams building CLI plugins for the Agent IX ecosystem.

---

## 4. Requirements Architecture

FRs and NFRs are organized by package within each artifact directory:

```
spec/
├── spec.md                     # This document
├── stakeholder/                # StR-XXX  (cross-cutting)
├── usecase/                    # US-XXX   (cross-cutting)
├── functional/
│   ├── semantic/               # FR-XXX   (@agent-ix/ix-ui-semantic)
│   └── cli/                    # FR-XXX   (@agent-ix/ix-ui-cli)
├── non-functional/
│   └── cli/                    # NFR-XXX  (@agent-ix/ix-ui-cli)
├── tests.md                    # Bidirectional requirements ↔ tests mapping
└── assets/                     # Diagrams, mockups
```

---

## 5. Requirement Classes

| Class | Format | Purpose |
|---|---|---|
| Stakeholder Requirement | `StR-XXX` | Authoritative needs from CLI authors and plugin authors. |
| User Story | `US-XXX` | Usage scenarios describing developer intent. |
| Functional Requirement | `FR-XXX` | Testable behavioral contracts. |
| Non-Functional Requirement | `NFR-XXX` | Quality constraints: consistency, API stability, TTY/non-TTY correctness. |
| Acceptance Criteria | `{FR}-AC-N` | Verifiable bullet within an FR. |
| Test Case | `TC-XXX` | Tracked in `tests.md`. |

Identifiers are immutable once assigned.

---

## 6. Requirement Quality Policy

All functional requirements SHALL:
- Define observable behavior.
- Be unambiguous and atomic.
- Be testable through explicit criteria.

---

## 7. State and Execution Model

### 7.1 Phase State Model (`semantic`)

The canonical phase state vocabulary is defined in `@agent-ix/ix-ui-semantic`. All CLI components MUST use these types exclusively.

```
PhaseState: pending | queued | running | done | failed
```

### 7.2 Glyph Vocabulary

The canonical glyph mapping is defined in `@agent-ix/ix-ui-semantic` and re-exported with rendering helpers from `@agent-ix/ix-ui-cli` (FR-016).

| State | TTY glyph | Non-TTY text | Animated | Token |
|-------|-----------|--------------|----------|-------|
| `pending` | `·` | `pending` | No | (literal) |
| `queued` | braille spinner frame | `queued` | Yes | `BRAILLE_SPINNER` |
| `running` | braille spinner frame | `running` | Yes | `BRAILLE_SPINNER` |
| `done` | `•` | `done` | No | `GLYPH_DONE` |
| `failed` | `○` | `failed` | No | `GLYPH_FAIL` |
| header (running) | orbit frame | `⊕` | Yes (240ms) | `ORBIT_SPINNER` / `<HeaderSpinner>` |
| header (passed) | `⊙` | `⊕` | No | `PHASE_PASS` |
| header (failed) | `⊗` | `⊕` | No | `PHASE_FAIL` / `GLYPH_FAIL_MARK` |

### 7.3 Platform Boundary

ix-ui is terminal-only. Web rendering is owned by `ix-themes`. The `cli` package depends on `react` because Ink uses it as a reconciler runtime — this does not make ix-ui a web library; Ink reconciles React elements to ANSI output, not to DOM.

---

## 8. Component Model

### 8.1 CLI Components (`@agent-ix/ix-ui-cli`)

| Component / API | Description | Spec |
|---|---|---|
| `<Frame>` | Base layout: animated/frozen orbit header, `└──┐` opener, body, optional `└──•` tail. | FR-002 |
| `<HeaderSpinner>` | Animated orbit glyph (240 ms per frame, NFR-001). Used inside `<Frame>` while running. | FR-002, FR-007 |
| `<Listing>` (with `<Group>` / `<Item>` / `<Note>`) | Frame for static listings, status views, mixed flows. | FR-003 |
| `<PhaseTable>` | Concurrent multi-service progress with phase columns. | FR-004 |
| `<TaskList>` | Sequential or concurrent named-task execution. | FR-005 |
| `<TextPrompt>`, `<PasswordPrompt>`, `<ConfirmPrompt>`, `<SelectPrompt>`, `<MultiSelectPrompt>` | Ink-native interactive prompts. | FR-006 |
| `useInterval`, `useExecaPhase`, `useKubectlRollout`, `useHelmHookWatcher` | Async work hooks with auto-cleanup on unmount. | FR-007 |
| `render(element, opts?)` | Mount entry point. Returns a Promise that resolves on unmount. Handles non-TTY and Ctrl-C. | FR-008 |
| `colors` palette | Semantic color helpers (cyan, green, yellow, red, dim, bold, IX blue). | FR-009, FR-010 |
| `style` module | Visual layout tokens: indents, connectors, glyphs, header rendering. | FR-016 |

---

## 9. Error and Failure Model

- Components SHALL NOT throw on invalid `PhaseState` values — they SHALL render a `failed` glyph and continue.
- `<PhaseTable>` SHALL handle empty `services` lists gracefully (header + summary `0/0 ready` + no rows; no crash).
- The `cli` package detects non-TTY environments via Ink's standard rendering and emits frames per state change with no animation, no in-place updates.
- `render()` resolves rather than rejects when the user cancels (Ctrl-C); rejection is reserved for thrown render errors.

---

## 10. Traceability

Bidirectional traceability SHALL be maintained between:
- Stakeholder Requirements → Functional Requirements.
- Functional Requirements → Acceptance Criteria → Test Cases.

The `tests.md` matrix is the authoritative trace.

---

## 11. Verification Strategy

- `semantic`: unit tests for type contracts and glyph mapping (Vitest).
- `cli`: component tests via `ink-testing-library` — mount component, snapshot `lastFrame()`, assert on resize via mocked `useStdout()`, verify cancel paths in prompts. Hook tests use `@testing-library/react` `renderHook`.

---

## 12. References

- ISO/IEC/IEEE 29148 — Requirements Engineering.
- IEEE 828 — Configuration Management.
- Ink (https://github.com/vadimdemedes/ink) — React renderer for terminal UIs.
- React 18+ — reconciler runtime.
- ix-themes — web/React DOM design token system.

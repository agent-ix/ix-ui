---
id: FR-001
title: "Ink Renderer Foundation"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/stakeholder/StR-001"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/non-functional/cli/NFR-002"
    type: "constrained_by"
    cardinality: "1:1"
---

## Description

The `cli` package SHALL render every terminal UI exclusively via **Ink** (`ink` + `react`). Layout SHALL be expressed declaratively via Ink's `<Box>` / `<Text>` primitives and yoga flexbox; resize behavior SHALL be inherited from Ink's `useStdout` integration. Hand-rolled ANSI cursor control, manual line-count tracking, and direct calls to `process.stdout.write` from component code are PROHIBITED.

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| FR-001-AC-1 | `@agent-ix/ix-ui-cli` declares runtime dependencies on `ink` and `react` | Test |
| FR-001-AC-2 | All visual components in `packages/cli/src/components/` are React function components rendering Ink elements (`<Box>`, `<Text>`, etc.) | Test |
| FR-001-AC-3 | `packages/cli/src/` contains no calls to `process.stdout.write`, `process.stderr.write`, `console.log`, `console.error`, or manual ANSI escape sequences (`\x1b[…`) outside of strings consumed inside `<Text>` children | Test |
| FR-001-AC-4 | Animation timing (header orbit, braille spinners) is driven by React state updates from a `useInterval` hook (FR-007), not by `setInterval` directly inside renderers | Test |
| FR-001-AC-5 | Multi-column layouts (PhaseTable rows, prompt option lists, task lists) SHALL use Ink `<Box flexDirection="row">` with `width`, `flexGrow`, or `flexBasis` props for column sizing — no `padEnd`/`padStart` for column alignment | Test |
| FR-001-AC-6 | When the terminal is resized, all running renderers SHALL re-flow within one render cycle without emitting duplicate frames or stale content | Test |
| FR-001-AC-7 | Components SHALL NOT read `process.stdout.columns` directly | Test |
| FR-001-AC-8 | Visual identity primitives — `<Frame>` (FR-002), `<HeaderSpinner>`, `<Listing>` (FR-003), `<PhaseTable>` (FR-004), `<TaskList>` (FR-005), prompt components (FR-006) — are composable: any component may be embedded as a child of another where layout permits | Test |
| FR-001-AC-9 | All public components accept `children` and pass through standard Ink layout props (`marginTop`, `marginLeft`, `paddingTop`, `paddingLeft`) without overriding caller intent | Test |
| FR-001-AC-10 | When stdout is closed mid-render (EPIPE), `render()` SHALL unmount the tree, swallow the EPIPE, and resolve with `{ cancelled: false, result: undefined }` | Test |
| FR-001-AC-11 | When `process.env.TERM === "dumb"` OR the terminal does not support colors (per Ink's color detection), components SHALL render glyphs and layout but suppress color escapes | Test |
| FR-001-AC-12 | Caller-supplied `header` and label strings SHALL be rendered with embedded newlines stripped (replaced with a single space) | Test |

### Renderer foundation

- **FR-001-AC-1**: `@agent-ix/ix-ui-cli` declares runtime dependencies on `ink` and `react`.
- **FR-001-AC-2**: All visual components in `packages/cli/src/components/` are React function components rendering Ink elements (`<Box>`, `<Text>`, etc.). Class components are PROHIBITED.
- **FR-001-AC-3**: `packages/cli/src/` contains no calls to `process.stdout.write`, `process.stderr.write`, `console.log`, `console.error`, or manual ANSI escape sequences (`\x1b[…`) outside of strings consumed inside `<Text>` children. (Per NFR-002.)
- **FR-001-AC-4**: Animation timing (header orbit, braille spinners) is driven by React state updates from a `useInterval` hook (FR-007), not by `setInterval` directly inside renderers.

### Layout and resize

- **FR-001-AC-5**: Multi-column layouts (PhaseTable rows, prompt option lists, task lists) SHALL use Ink `<Box flexDirection="row">` with `width`, `flexGrow`, or `flexBasis` props for column sizing — no `padEnd`/`padStart` for column alignment.
- **FR-001-AC-6**: When the terminal is resized, all running renderers SHALL re-flow within one render cycle without emitting duplicate frames or stale content. (Verified by ink-testing-library snapshot under `useStdout()` mock.)
- **FR-001-AC-7**: Components SHALL NOT read `process.stdout.columns` directly. Width-aware logic uses Ink's `useStdout()` hook.

### Composition

- **FR-001-AC-8**: Visual identity primitives — `<Frame>` (FR-002), `<HeaderSpinner>`, `<Listing>` (FR-003), `<PhaseTable>` (FR-004), `<TaskList>` (FR-005), prompt components (FR-006) — are composable: any component may be embedded as a child of another where layout permits.
- **FR-001-AC-9**: All public components accept `children` and pass through standard Ink layout props (`marginTop`, `marginLeft`, `paddingTop`, `paddingLeft`) without overriding caller intent.

### Robustness

- **FR-001-AC-10**: When stdout is closed mid-render (EPIPE), `render()` SHALL unmount the tree, swallow the EPIPE, and resolve with `{ cancelled: false, result: undefined }`. The package SHALL NOT propagate EPIPE as an unhandled rejection.
- **FR-001-AC-11**: When `process.env.TERM === "dumb"` OR the terminal does not support colors (per Ink's color detection), components SHALL render glyphs and layout but suppress color escapes. Functional behavior is unchanged.
- **FR-001-AC-12**: Caller-supplied `header` and label strings SHALL be rendered with embedded newlines stripped (replaced with a single space). Callers MUST NOT use newlines to break layout in header text; doing so is silently coerced.

## Constraints

- **FR-001-CON-1**: The package targets Node ≥ 18 (Ink v5+ minimum).
- **FR-001-CON-2**: Non-TTY environments are served by Ink's built-in non-TTY rendering (frame-per-render structured output) plus a `plain` mode flag on `render()` (FR-008).
- **FR-001-CON-3**: `@agent-ix/ix-ui-semantic` (zero-runtime types/glyph tables) is the only sibling-package dependency.
- **FR-001-CON-4**: Type definitions for every exported component, hook, and helper SHALL be generated and shipped in the published package (`dist/index.d.ts`).


## Dependencies

- **Upstream**: StR-001 (derived_from); NFR-002 (constrained_by)

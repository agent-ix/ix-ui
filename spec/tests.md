---
artifact_type: test-matrix
name: ix-ui
---

# Test Matrix

## Overview

This matrix traces every Stakeholder Requirement, User Story, Functional Requirement, and Non-Functional Requirement in the `ix-ui` monorepo to one or more test cases, and records the coverage status of each Acceptance Criterion.

Packages covered:
- `packages/semantic` — `@agent-ix/ix-ui-semantic` (phase state vocabulary, zero runtime deps)
- `packages/cli` — `@agent-ix/ix-ui-cli` (PhaseTable renderer, colours, prompts, task runner)

---

## Requirements Traceability

### Stakeholder Requirement Coverage

| Stakeholder Req | Title | Trace to FR | Coverage Status |
|---|---|---|---|
| StR-001 | Consistent Terminal Design Language | semantic/FR-001, semantic/FR-003, cli/FR-010, cli/FR-012 | ✅ Complete |
| StR-002 | Platform-Agnostic Semantic Vocabulary With Zero Runtime Deps | semantic/FR-001, semantic/FR-007 | ✅ Complete |

---

### User Story Coverage

| User Story | Title | Trace to FR | Coverage Status |
|---|---|---|---|
| US-001 | Consume Phase State Types in a CLI Package | semantic/FR-001, FR-002, FR-003 | ✅ Complete |
| US-002 | Display Concurrent Multi-Service Progress With Phase Columns | cli/FR-001 – FR-008 | ✅ Complete |
| US-003 | Frame a CLI Command With Consistent Intro and Outro | cli/FR-011, FR-012 | ✅ Complete |

---

### Functional Requirement Coverage

#### packages/semantic

| Functional Req | Acceptance Criteria | Test Cases | Coverage Status |
|---|---|---|---|
| semantic/FR-001 | AC-1: `PhaseState` exported from package root | TC-001 | ✅ Complete |
| semantic/FR-001 | AC-2: Exactly 5 members: pending, queued, running, done, failed | TC-002 | ✅ Complete |
| semantic/FR-001 | AC-3: TS strict rejects invalid assignment | (static — compiler enforcement) | Review |
| semantic/FR-002 | AC-1: `PhaseGlyph` interface exported | TC-001 (import check) | ✅ Complete |
| semantic/FR-003 | AC-1: PHASE_GLYPHS has entry for every PhaseState | TC-003 | ✅ Complete |
| semantic/FR-003 | AC-2: PHASE_GLYPHS has exactly 5 entries | TC-004 | ✅ Complete |
| semantic/FR-003 | AC-3: Each glyph has non-empty tty and nonTty strings | TC-005 | ✅ Complete |
| semantic/FR-003 | AC-4: queued/running animated=true, others animated=false | TC-006, TC-007 | ✅ Complete |
| semantic/FR-004 | AC-1: STATUS_DOTS.done === "●" | TC-008 | ✅ Complete |
| semantic/FR-004 | AC-2: STATUS_DOTS.failed === "○", .pending === "·" | TC-008 | ✅ Complete |
| semantic/FR-005 | AC-1: BRAILLE_SPINNER is an array | TC-009 | ✅ Complete |
| semantic/FR-005 | AC-2: BRAILLE_SPINNER has 10 frames | TC-009 | ✅ Complete |
| semantic/FR-005 | AC-3: BRAILLE_SPINNER frames are non-empty strings | TC-011 | ✅ Complete |
| semantic/FR-006 | AC-1: HEADER_SPINNER is an array | TC-010 | ✅ Complete |
| semantic/FR-006 | AC-2: HEADER_SPINNER has 4 frames | TC-010 | ✅ Complete |
| semantic/FR-006 | AC-3: HEADER_SPINNER frames are non-empty strings | TC-011 | ✅ Complete |
| semantic/FR-007 | AC-1: package.json has no runtime `dependencies` | TC-012 | ✅ Complete |
| semantic/FR-007 | AC-2: dist/index.js has no external imports | (static — build artifact check) | Review |
| semantic/FR-007 | AC-3: Node import completes without error | (implied by all test runs) | Review |

#### packages/cli

| Functional Req | Acceptance Criteria | Test Cases | Coverage Status |
|---|---|---|---|
| cli/FR-001 | AC-1: All phases initialised to "pending" | TC-013 | ✅ Complete |
| cli/FR-001 | AC-2: `isTTY=false` forces non-TTY mode | TC-014 (existing) | ✅ Complete |
| cli/FR-001 | AC-3: `isPlain=true` forces non-TTY mode | TC-015 | ✅ Complete |
| cli/FR-002 | AC-1: `start()` writes initial state immediately | TC-016 | ✅ Complete |
| cli/FR-002 | AC-2: setInterval called with 80 ms delay | TC-017 | ✅ Complete |
| cli/FR-002 | AC-3: Frame output contains synchronized output markers | TC-018 | ✅ Complete |
| cli/FR-002 | AC-4: No further stdout writes after `finish()` | TC-019 | ✅ Complete |
| cli/FR-003 | AC-1: `transition()` in non-TTY writes one `[T+Ns] svc: phase state` line | TC-014 (existing) | ✅ Complete |
| cli/FR-003 | AC-2: No setInterval in non-TTY mode | TC-020 | ✅ Complete |
| cli/FR-003 | AC-3: `start()` with header in non-TTY writes `⊕  <header>` | TC-021 | ✅ Complete |
| cli/FR-004 | AC-1: `transition()` updates row state | (implied by non-TTY output test) | ✅ Complete |
| cli/FR-004 | AC-2: First-phase "running" transition records startMs | (internal timing, observable via elapsed in output) | Review |
| cli/FR-004 | AC-3: Last-phase "done" transition records endMs | (internal timing, observable via elapsed in output) | Review |
| cli/FR-004 | AC-4: "failed" transition records endMs | (internal timing) | Review |
| cli/FR-004 | AC-5: Non-TTY `transition()` writes exactly one line per call | TC-022 | ✅ Complete |
| cli/FR-005 | AC-1: No output after `finish()` | TC-023 | ✅ Complete |
| cli/FR-005 | AC-2: Non-TTY success summary contains service names and "ready in" | TC-024 (existing) | ✅ Complete |
| cli/FR-005 | AC-3: Non-TTY failure summary contains "failed" and error message | TC-025 (existing) | ✅ Complete |
| cli/FR-005 | AC-4: `entry` + `baseDomain` renders URL in summary | TC-026 (existing) | ✅ Complete |
| cli/FR-005 | AC-5: No `baseDomain` → no URL in summary | TC-027 | ✅ Complete |
| cli/FR-006 | AC-1: Non-TTY `preflight()` writes `🔑 label\n` immediately | TC-028 (existing) | ✅ Complete |
| cli/FR-006 | AC-2: TTY mode pre-flight labels appear above service rows | (TTY render, smoke-checked via header test) | Review |
| cli/FR-006 | AC-3: Multiple `preflight()` calls accumulate in order | TC-029 | ✅ Complete |
| cli/FR-007 | AC-1: `transition()` unknown service does not throw | TC-030 (existing) | ✅ Complete |
| cli/FR-007 | AC-2: `setPodStatus()` unknown service does not throw | TC-030 (existing) | ✅ Complete |
| cli/FR-007 | AC-3: `setError()` unknown service does not throw | TC-030 (existing) | ✅ Complete |
| cli/FR-007 | AC-4: No output written for unknown-service calls | TC-031 | ✅ Complete |
| cli/FR-008 | AC-1: Empty service list — `start()` does not throw | TC-032 (existing) | ✅ Complete |
| cli/FR-008 | AC-2: Empty service list — `finish()` does not throw | TC-032 (existing) | ✅ Complete |
| cli/FR-008 | AC-3: Empty service list — no transitions to crash on | TC-032 (existing) | ✅ Complete |
| cli/FR-009 | AC-1: `colors.red()` contains ANSI 167 opening sequence `\x1b[38;5;167m` | TC-033 (existing) | ✅ Complete |
| cli/FR-009 | AC-2: `colors.red()` ends with reset `\x1b[0m` | TC-034 | ✅ Complete |
| cli/FR-009 | AC-3: `colors.red()` contains the input string between escape sequences | TC-035 | ✅ Complete |
| cli/FR-010 | AC-1: `colors` is exported from `colors.ts` | (import test) | ✅ Complete |
| cli/FR-010 | AC-2: `colors` has all required keys: cyan, green, yellow, red, dim, bold, underline, bgCyan, black | TC-036 | ✅ Complete |
| cli/FR-010 | AC-3: `blue` is a function | TC-037 (existing) | ✅ Complete |
| cli/FR-010 | AC-4: Every `colors` value is a `(string) => string` function | TC-038 | ✅ Complete |
| cli/FR-011 | AC-1: Successful `runTaskList` — intro + tasks + green outro | TC-039 | ✅ Complete |
| cli/FR-011 | AC-2: Failing task — red outro + re-throw | TC-040 | ✅ Complete |
| cli/FR-011 | AC-3: Outro always rendered before throw | TC-041 | ✅ Complete |
| cli/FR-012 | AC-1: `introCommand("ix up")` output contains "ix up" and ANSI codes | TC-042 | ✅ Complete |
| cli/FR-012 | AC-2: `outroSuccess("Done.")` output contains "Done." and green codes | TC-043 | ✅ Complete |
| cli/FR-012 | AC-3: `outroError("Failed.")` output contains "Failed." and red codes | TC-044 | ✅ Complete |

---

### Non-Functional Requirement Coverage

| NFR | Acceptance Criteria | Test Cases | Coverage Status |
|---|---|---|---|
| NFR-001 | AC-1: `setInterval` delay is exactly 80 ms | TC-017 | ✅ Complete |
| NFR-001 | AC-2: No alternative redraw path exists | (static review — no `setTimeout` loop in phase-table.ts) | Review |
| NFR-002 | AC-1: No `console.log/error/warn` or `process.stderr.write` in `packages/cli/src/` | TC-045 | ✅ Complete |
| NFR-002 | AC-2: PhaseTable writes exclusively to `process.stdout.write` | (implied by spy-based tests capturing all output) | ✅ Complete |
| NFR-002 | AC-3: `introCommand`/`outroSuccess`/`outroError` delegate to clack, not `console.*` | TC-045 (grep) | ✅ Complete |

---

## Test Case Summary

| Test ID | Title | Type | Priority | Traces To | Status |
|---|---|---|---|---|---|
| TC-001 | PhaseState and PHASE_GLYPHS are exported from package root | Unit | P1 | semantic/FR-001-AC-1, FR-002-AC-1 | ✅ Complete |
| TC-002 | PhaseState union has exactly 5 members, no more | Unit | P1 | semantic/FR-001-AC-2 | ✅ Complete |
| TC-003 | PHASE_GLYPHS has entry for every PhaseState | Unit | P1 | semantic/FR-003-AC-1 | ✅ Complete |
| TC-004 | PHASE_GLYPHS has exactly 5 entries | Unit | P1 | semantic/FR-003-AC-2 | ✅ Complete |
| TC-005 | Each glyph has non-empty tty and nonTty strings | Unit | P2 | semantic/FR-003-AC-3 | ✅ Complete |
| TC-006 | pending/done/failed glyphs are not animated | Unit | P2 | semantic/FR-003-AC-4 | ✅ Complete |
| TC-007 | queued/running glyphs are animated | Unit | P2 | semantic/FR-003-AC-4 | ✅ Complete |
| TC-008 | STATUS_DOTS values are correct | Unit | P1 | semantic/FR-004-AC-1, AC-2 | ✅ Complete |
| TC-009 | BRAILLE_SPINNER has 10 frames | Unit | P2 | semantic/FR-005-AC-1, AC-2 | ✅ Complete |
| TC-010 | HEADER_SPINNER has 4 frames | Unit | P2 | semantic/FR-006-AC-1, AC-2 | ✅ Complete |
| TC-011 | All spinner frames are non-empty strings | Unit | P2 | semantic/FR-005-AC-3, FR-006-AC-3 | ✅ Complete |
| TC-012 | semantic package.json has no runtime dependencies | Unit | P1 | semantic/FR-007-AC-1 | ✅ Complete |
| TC-013 | PhaseTable initialises all phases to "pending" | Unit | P1 | cli/FR-001-AC-1 | ✅ Complete |
| TC-014 | PhaseTable non-TTY emits structured transition lines | Unit | P1 | cli/FR-001-AC-2, FR-003-AC-1 | ✅ Complete |
| TC-015 | isPlain:true forces non-TTY mode | Unit | P1 | cli/FR-001-AC-3 | ✅ Complete |
| TC-016 | TTY start() writes initial table to stdout immediately | Unit | P1 | cli/FR-002-AC-1 | ✅ Complete |
| TC-017 | setInterval is called with 80 ms delay | Unit | P1 | cli/FR-002-AC-2, NFR-001-AC-1 | ✅ Complete |
| TC-018 | Frame output contains synchronized output markers | Unit | P1 | cli/FR-002-AC-3 | ✅ Complete |
| TC-019 | No further stdout writes after finish() in TTY | Unit | P1 | cli/FR-002-AC-4 | ✅ Complete |
| TC-020 | No setInterval in non-TTY mode | Unit | P1 | cli/FR-003-AC-2 | ✅ Complete |
| TC-021 | Non-TTY start() with header writes ⊕ header line | Unit | P2 | cli/FR-003-AC-3 | ✅ Complete |
| TC-022 | Non-TTY transition() writes exactly one line per call | Unit | P2 | cli/FR-004-AC-5 | ✅ Complete |
| TC-023 | No output after finish() in non-TTY | Unit | P1 | cli/FR-005-AC-1 | ✅ Complete |
| TC-024 | Non-TTY success summary contains service names and "ready in" | Unit | P1 | cli/FR-005-AC-2 | ✅ Complete |
| TC-025 | Non-TTY failure summary contains "failed" and error message | Unit | P1 | cli/FR-005-AC-3 | ✅ Complete |
| TC-026 | finish() with entry+baseDomain renders URL | Unit | P1 | cli/FR-005-AC-4 | ✅ Complete |
| TC-027 | finish() without baseDomain renders no URL | Unit | P2 | cli/FR-005-AC-5 | ✅ Complete |
| TC-028 | Non-TTY preflight() writes 🔑 label immediately | Unit | P2 | cli/FR-006-AC-1 | ✅ Complete |
| TC-029 | Multiple preflight() calls accumulate in order | Unit | P2 | cli/FR-006-AC-3 | ✅ Complete |
| TC-030 | Unknown-service mutations do not throw | Unit | P1 | cli/FR-007-AC-1, AC-2, AC-3 | ✅ Complete |
| TC-031 | No stdout output written for unknown-service transition | Unit | P1 | cli/FR-007-AC-4 | ✅ Complete |
| TC-032 | Empty service list — start/finish do not throw | Unit | P2 | cli/FR-008-AC-1, AC-2, AC-3 | ✅ Complete |
| TC-033 | colors.red contains ANSI 167 opening sequence | Unit | P1 | cli/FR-009-AC-1 | ✅ Complete |
| TC-034 | colors.red ends with reset sequence \x1b[0m | Unit | P1 | cli/FR-009-AC-2 | ✅ Complete |
| TC-035 | colors.red contains the input string | Unit | P1 | cli/FR-009-AC-3 | ✅ Complete |
| TC-036 | colors exports all required keys | Unit | P1 | cli/FR-010-AC-2 | ✅ Complete |
| TC-037 | blue is exported and wraps strings | Unit | P2 | cli/FR-010-AC-3 | ✅ Complete |
| TC-038 | Every colors value is a (string) => string function | Unit | P1 | cli/FR-010-AC-4 | ✅ Complete |
| TC-039 | runTaskList success: intro + tasks + green outro | Unit | P1 | cli/FR-011-AC-1 | ✅ Complete |
| TC-040 | runTaskList failure: red outro + re-throw | Unit | P1 | cli/FR-011-AC-2 | ✅ Complete |
| TC-041 | runTaskList outro always rendered before throw | Unit | P1 | cli/FR-011-AC-3 | ✅ Complete |
| TC-042 | introCommand output contains command name and ANSI codes | Unit | P2 | cli/FR-012-AC-1 | ✅ Complete |
| TC-043 | outroSuccess output contains message and green codes | Unit | P2 | cli/FR-012-AC-2 | ✅ Complete |
| TC-044 | outroError output contains message and red codes | Unit | P2 | cli/FR-012-AC-3 | ✅ Complete |
| TC-045 | No console.log/error/warn in packages/cli/src/ | Static | P1 | NFR-002-AC-1, AC-3 | ✅ Complete |

---

## Edge Cases

| Scenario | Relevant FR | Test | Notes |
|---|---|---|---|
| Empty service list | cli/FR-008 | TC-032 | `finish()` must not crash on `Math.max(...[])` call |
| Unknown service name passed to all mutators | cli/FR-007 | TC-030, TC-031 | Silent no-op, no stdout emission |
| `isPlain=true` on a real TTY | cli/FR-001 | TC-015 | Overrides `process.stdout.isTTY` |
| `finish()` called twice (ticker already null) | cli/FR-005-CON-1 | (idempotency — no dedicated TC, covered structurally) | Review |
| `baseDomain` supplied without `entry` | cli/FR-005 | TC-027 | Per-row URLs still render; no `app:` line |
| `preflight()` called before `start()` | cli/FR-006-CON-1 | TC-029 | Accumulates and appears in first draw |
| `setInterval` leak after `finish()` | cli/FR-002-CON-2 | TC-019 | Verified by no-output-after-finish assertion |
| Spinner frame wrapping (modulo) | semantic/FR-005, FR-006 | TC-009, TC-010 | Frame count enables safe `% length` in renderer |

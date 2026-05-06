---
artifact_type: test-matrix
name: ix-ui
---

# Test Matrix

## Overview

This matrix traces every Stakeholder Requirement, User Story, Functional Requirement, and Non-Functional Requirement in the `ix-ui` monorepo to one or more test cases, and records the planned coverage status of each Acceptance Criterion.

Packages covered:
- `packages/semantic` — `@agent-ix/ix-ui-semantic` (phase state vocabulary, zero runtime deps).
- `packages/cli` — `@agent-ix/ix-ui-cli` (Ink components: Frame, Listing, PhaseTable, TaskList, prompts; async hooks; render entry).

Test framework:
- semantic: Vitest unit tests for type contracts and constants.
- cli: Vitest + `ink-testing-library` for component snapshot tests; `@testing-library/react` `renderHook` for hook tests; static-grep tests for NFR-002 and NFR-003.

TC ID conventions:
- TC-001 — TC-099: reserved for `semantic` test cases.
- TC-100 — TC-299: `cli` test cases.
- TC-300 — TC-399: style / NFR test cases.

---

## 1. Stakeholder Requirement Coverage

| StR | Title | Trace to FR / NFR | Planned TCs |
|---|---|---|---|
| StR-001 | Consistent Terminal Design Language | semantic/FR-001, semantic/FR-003, cli/FR-001, cli/FR-002, cli/FR-003, cli/FR-016 | TC-001 – TC-016, TC-100 – TC-131, TC-300 – TC-313 |
| StR-002 | Platform-Agnostic Semantic Vocabulary With Zero Runtime Deps | semantic/FR-001, semantic/FR-007 | TC-001 – TC-016 |

---

## 2. User Story Coverage

| US | Title | Trace to FR | Planned TCs |
|---|---|---|---|
| US-001 | Consume Phase State Types in a CLI Package | semantic/FR-001, FR-002, FR-003 | TC-001 – TC-008 |
| US-002 | Display Concurrent Multi-Service Progress With Phase Columns | cli/FR-004, FR-007, FR-008 | TC-132 – TC-147, TC-184 – TC-198, TC-199 – TC-210 |
| US-003 | Frame a CLI Command With a Listing | cli/FR-002, FR-003, FR-005, FR-006, FR-008 | TC-112 – TC-131, TC-148 – TC-163, TC-164 – TC-183, TC-199 – TC-210 |
| US-004 | Retheme the Entire CLI From One Module | cli/FR-016, NFR-003 | TC-300 – TC-313, TC-330 – TC-333 |

---

## 3. Functional Requirement Coverage

### packages/semantic (unchanged from baseline)

| FR | AC count | Planned TCs |
|---|---|---|
| FR-001 (PhaseState type) | 3 | TC-001, TC-002 |
| FR-002 (PhaseGlyph interface) | 1 | TC-001 |
| FR-003 (PHASE_GLYPHS map) | 4 | TC-003, TC-005, TC-006, TC-007 |
| FR-004 (STATUS_DOTS) | 2 | TC-008 |
| FR-005 (BRAILLE_SPINNER) | 3 | TC-009, TC-011 |
| FR-006 (HEADER_SPINNER) | 2 | TC-010 |
| FR-007 (Zero runtime deps) | 1 | TC-012 |

### packages/cli — Ink component set

| FR | Title | AC count | Planned TCs |
|---|---|---|---|
| FR-001 | Ink renderer foundation | 12 | TC-100 – TC-111 |
| FR-002 | Frame component | 12 | TC-112 – TC-122, TC-122a |
| FR-003 | Listing component | 9 | TC-123 – TC-131 |
| FR-004 | PhaseTable component | 16 | TC-132 – TC-147 |
| FR-005 | TaskList component | 18 | TC-148 – TC-163, TC-163a – TC-163b |
| FR-006 | Prompt components | 23 | TC-164 – TC-183, TC-183a – TC-183c |
| FR-007 | Async work hooks | 16 | TC-184 – TC-198, TC-198a |
| FR-008 | render() entry point | 12 | TC-199 – TC-210 |
| FR-009 | colors.red | 3 | TC-211 – TC-213 |
| FR-010 | colors palette object | 4 | TC-214 – TC-217 |
| FR-016 | Shared style tokens | 14 | TC-300 – TC-313 |

---

## 4. Non-Functional Requirement Coverage

| NFR | Title | AC count | Planned TCs |
|---|---|---|---|
| NFR-001 | Animation tick interval — 80 ms | 5 | TC-320 – TC-324 |
| NFR-002 | No imperative stdout / ANSI control | 5 | TC-325 – TC-329 (static greps) |
| NFR-003 | Single source of style | 4 | TC-330 – TC-333 (static greps) |

---

## 5. Test Case Directory (cli)

### FR-001 — Ink renderer foundation

| TC | AC | Description |
|---|---|---|
| TC-100 | AC-1 | `package.json` declares ink + react in runtime deps. |
| TC-101 | AC-2 | All component files use function components. |
| TC-102 | AC-3 | Static grep: no `process.stdout.write` / ANSI literals in `src/`. |
| TC-103 | AC-4 | `useInterval(80)` is the source of all animated frames. |
| TC-104 | AC-5 | Layout uses Ink flexbox; no `padEnd`/`padStart` for column alignment. |
| TC-105 | AC-6 | Resize re-flow within one render cycle. |
| TC-106 | AC-7 | No `process.stdout.columns` reads. |
| TC-107 | AC-8 | `<Frame>` accepts arbitrary Ink-renderable React nodes (incl. nested framed components) without crash. |
| TC-108 | AC-9 | Layout props pass through to outer `<Box>`. |
| TC-109 | AC-10 | EPIPE on stdout close → render() resolves cleanly. |
| TC-110 | AC-11 | TERM=dumb suppresses color but preserves layout. |
| TC-111 | AC-12 | Newlines in `header` strings coerced to spaces. |

### FR-002 — Frame component

| TC | AC | Description |
|---|---|---|
| TC-112 | AC-1 | `<Frame status="running">` animates header at 240 ms cadence. |
| TC-113 | AC-2 | `<Frame status="passed">` shows PHASE_PASS, no animation. |
| TC-114 | AC-3 | `<Frame status="failed">` shows PHASE_FAIL. |
| TC-115 | AC-4 | Header indicator width = PHASE_WIDTH across all states. |
| TC-116 | AC-5 | `└──┐` opener appears when children present; tail-only frames have no opener. |
| TC-117 | AC-6 | Header-only collapse when children empty AND tail unset. |
| TC-118 | AC-7 | Body rendered inside flexbox column. |
| TC-119 | AC-8 | Success/warn tail = `└──•` connector; error tail = ` ⊗` at planet column. |
| TC-120 | AC-9 | Blank line above tail. |
| TC-121 | AC-10 | Frame composes into Frame. |
| TC-122 | AC-11 | Frame forwards layout props. |
| TC-122a | AC-12 | Empty header renders bracketed `[  ]` without crash. |

### FR-003 — Listing component

| TC | AC | Description |
|---|---|---|
| TC-123 | AC-1 | `<Listing>` wraps `<Frame>` with prop pass-through. |
| TC-124 | AC-2 | `<Group>` renders blank line + bold cyan name. |
| TC-125 | AC-3 | `<Item>` renders glyph + name + dim description. |
| TC-126 | AC-4 | `<Note>` renders dim at NOTE_INDENT. |
| TC-127 | AC-5 | Animation while running. |
| TC-128 | AC-6 | Status transitions via prop change. |
| TC-129 | AC-7 | Final frame flushed before render() resolves. |
| TC-130 | AC-8 | Prompt embedded in Listing receives input. |
| TC-131 | AC-9 | No out-of-tree handoff API. |

### FR-004 — PhaseTable component

| TC | AC | Description |
|---|---|---|
| TC-132 | AC-1 | Body layout: preflight + rows + summary. |
| TC-133 | AC-2 | Row is 3-cell flexbox. |
| TC-134 | AC-3 | Resize narrower truncates status cell, no wrap. |
| TC-135 | AC-4 | `hidePending` hides all-pending rows. |
| TC-136 | AC-5 | Row glyphs reflect phase state. |
| TC-137 | AC-6 | Aggregate status defaults computed correctly. |
| TC-138 | AC-7 | Header animates only while running. |
| TC-139 | AC-8 | Pod-status pattern colored via colorPods. |
| TC-140 | AC-9 | tailEntry renders entry URL on passed. |
| TC-141 | AC-10 | Failure tail. |
| TC-142 | AC-11 | Preflight content above row block. |
| TC-143 | AC-12 | Empty services renders 0/0. |
| TC-144 | AC-13 | Unknown phase ignored. |
| TC-145 | AC-14 | displayName fallback to name. |
| TC-146 | AC-15 | Empty phases renders summary only. |
| TC-147 | AC-16 | Duplicate names render as separate rows. |

### FR-005 — TaskList component

| TC | AC | Description |
|---|---|---|
| TC-148 | AC-1 | Frame wrap when header non-null; aggregate status. |
| TC-149 | AC-2 | Row layout per state with glyph and elapsed. |
| TC-150 | AC-3 | helpers.log sub-lines at NOTE_INDENT. |
| TC-151 | AC-4 | Failure error renders at ERROR_INDENT. |
| TC-152 | AC-5 | Sequential exitOnError halts subsequent. |
| TC-153 | AC-6 | Concurrent runs all in parallel. |
| TC-154 | AC-7 | enabled=false skips with reason. |
| TC-155 | AC-8 | task returns `{skip}` skips with reason. |
| TC-156 | AC-9 | Re-render with same array doesn't restart; new array does. |
| TC-157 | AC-10 | Unmount aborts via signal. |
| TC-158 | AC-11 | onComplete fires once. |
| TC-159 | AC-12 | Default success tail. |
| TC-160 | AC-13 | Default failure tail. |
| TC-161 | AC-14 | Empty tasks array. |
| TC-162 | AC-15 | helpers post-settle no-op. |
| TC-163 | AC-16 | onError concurrent: first error only. |
| TC-163a | AC-17 | Tasks identified by array position; reorder without ref change swaps state. |
| TC-163b | AC-18 | Throwing onComplete / onError propagates; schedule doesn't retry. |

### FR-006 — Prompt components

| TC | AC | Description |
|---|---|---|
| TC-164 | AC-1 | Common header layout: `?` glyph + message + hint. |
| TC-165 | AC-2 | Ctrl-C / Esc → cancelled. |
| TC-166 | AC-3 | Enter validates and submits; thrown validators caught. |
| TC-167 | AC-4 | Frozen summary after submit. |
| TC-168 | AC-5 | TextPrompt editable + placeholder. |
| TC-169 | AC-6 | TextPrompt summary value or «empty». |
| TC-170 | AC-7 | PasswordPrompt masks input with •. |
| TC-171 | AC-8 | PasswordPrompt summary 8 bullets fixed. |
| TC-172 | AC-9 | ConfirmPrompt Y/n N/y default-aware. |
| TC-173 | AC-10 | ConfirmPrompt summary Yes/No. |
| TC-174 | AC-11 | SelectPrompt up/down navigation, Enter selects. |
| TC-175 | AC-12 | SelectPrompt option hint dim right. |
| TC-176 | AC-13 | MultiSelect checkboxes, Space toggles. |
| TC-177 | AC-14 | MultiSelect required validation. |
| TC-178 | AC-15 | Composes inside Listing. |
| TC-179 | AC-16 | Multiple prompts: only newest receives input. |
| TC-180 | AC-17 | Resize preserves in-progress value. |
| TC-181 | AC-18 | Unmount before submit fires nothing. |
| TC-182 | AC-19 | Multiple Enter within tick fires once. |
| TC-183 | AC-20 | Non-TTY stdin → graceful cancel summary. |
| TC-183a | AC-21 | Throwing onSubmit propagates; prompt still renders summary. |
| TC-183b | AC-22 | Validate purity is documented (review-only — no automated test). |
| TC-183c | AC-23 | Duplicate option values render as separate rows; first match wins. |

### FR-007 — Async work hooks

| TC | AC | Description |
|---|---|---|
| TC-184 | AC-1 | useInterval fires every delay ms; null pauses. |
| TC-185 | AC-1 | (paired) verify pause behavior. |
| TC-186 | AC-2 | Callback ref stable on re-render. |
| TC-187 | AC-3 | Cleanup on unmount. |
| TC-188 | AC-4 | Components consume useInterval(80). |
| TC-189 | AC-5 | useExecaPhase state transitions. |
| TC-190 | AC-6 | command/args change does not restart. |
| TC-191 | AC-7 | Unmount sends SIGTERM, then SIGKILL after 1s. |
| TC-192 | AC-8 | useKubectlRollout polls and parses. |
| TC-193 | AC-9 | Cancel on unmount / disable. |
| TC-194 | AC-10 | Poll errors do not throw, retain previous. |
| TC-195 | AC-11 | useHelmHookWatcher polls jobs. |
| TC-196 | AC-12 | Failed hook keeps reporting. |
| TC-197 | AC-13 | Multiple hooks compose. |
| TC-198 | AC-15 | useExecaPhase: missing binary → failed state. |
| TC-198a | AC-16 | useKubectlRollout / useHelmHookWatcher: missing kubectl → silent retry, no failed state. |

### FR-008 — render() entry point

| TC | AC | Description |
|---|---|---|
| TC-199 | AC-1 | render mounts Ink tree, resolves on unmount; final frame flushed. |
| TC-200 | AC-2 | useRenderResult().setResult attaches value. |
| TC-201 | AC-3 | Unmount without setResult → result undefined. |
| TC-202 | AC-4 | Ctrl-C → cancelled true. |
| TC-203 | AC-5 | Caller inspects cancelled. |
| TC-204 | AC-6 | Non-TTY → frame-per-render, no in-place. |
| TC-205 | AC-7 | Plain mode static UI emits one final frame. |
| TC-206 | AC-8 | Synchronous render error rejects + restores cursor. |
| TC-207 | AC-9 | Hook async error stays in hook state. |
| TC-208 | AC-10 | Cursor visible on every exit path. |
| TC-209 | AC-11 | Concurrent render() rejects with active-error. |
| TC-210 | AC-12 | SIGTERM unmounts and resolves cancelled. |

### FR-009 / FR-010 — Colors

| TC | AC | Description |
|---|---|---|
| TC-211 | FR-009-AC-1 | colors.red wraps in ANSI 256/167. |
| TC-212 | FR-009-AC-2 | colors.red leaves empty string unchanged. |
| TC-213 | FR-009-AC-3 | colors.red round-trips through stripAnsi. |
| TC-214 | FR-010-AC-1 | colors object exports all expected keys. |
| TC-215 | FR-010-AC-2 | colors.cyan delegates to picocolors. |
| TC-216 | FR-010-AC-3 | blue alias === colors.cyan. |
| TC-217 | FR-010-AC-4 | All color helpers preserve content. |

### FR-016 — Style tokens

| TC | AC | Description |
|---|---|---|
| TC-300 | AC-1 | Module exports listed token set. |
| TC-301 | AC-2 | PLANET_COL = 1. |
| TC-302 | AC-3 | ROW_INDENT = 4 spaces. |
| TC-303 | AC-4 | NOTE_INDENT = 6 spaces. |
| TC-304 | AC-5 | ERROR_INDENT = 8 spaces. |
| TC-305 | AC-6 | PHASE_WIDTH = 4. |
| TC-306 | AC-7 | ROUTE_INDENT dim ` └──┐`. |
| TC-307 | AC-8 | ROUTE_OUT === ROW_INDENT. |
| TC-308 | AC-9 | renderHeader bracket grayscale. |
| TC-309 | AC-10 | PHASE_PASS / PHASE_FAIL definitions. |
| TC-310 | AC-11 | colorOrbitFrame per-glyph coloring. |
| TC-311 | AC-12 | HEADER_TICK_DIV = 3. |
| TC-312 | AC-13 | Static grep: no inline indents/glyphs in src outside style.ts. |
| TC-313 | AC-14 | All components import tokens from style.ts. |

### NFRs

| TC | AC | Description |
|---|---|---|
| TC-320 | NFR-001-AC-1 | useInterval(80) is the only animation interval. |
| TC-321 | NFR-001-AC-2 | Header advances every 240 ms. |
| TC-322 | NFR-001-AC-3 | Braille spinners advance every 80 ms. |
| TC-323 | NFR-001-AC-4 | No alternative animation paths. |
| TC-324 | NFR-001-AC-5 | Non-TTY: no animation tick fires. |
| TC-325 | NFR-002-AC-1 | Static grep: no console / stdout writes. |
| TC-326 | NFR-002-AC-2 | Static grep: no `\\x1b[` literals. |
| TC-327 | NFR-002-AC-3 | Static grep: no `\\r` literals. |
| TC-328 | NFR-002-AC-4 | Static grep: no process.stdout.columns reads. |
| TC-329 | NFR-002-AC-5 | Hooks may shell out via execa (informational; no grep). |
| TC-330 | NFR-003-AC-1 | Static grep: no canonical indent literals outside style.ts. |
| TC-331 | NFR-003-AC-2 | Static grep: no connector substrings outside style.ts. |
| TC-332 | NFR-003-AC-3 | Static grep: no head-row glyphs outside style.ts. |
| TC-333 | NFR-003-AC-4 | Components import every token from style.ts. |

---

## 6. Option Permutation Matrix

Each row is a distinct render scenario verified against snapshot output. `🔘` = planned.

### Frame status × tail variant × body presence

| Test | status | tailVariant | children | tail | Expected |
|---|---|---|---|---|---|
| TC-OP-01 | running | — | yes | — | Animated header, opener, body, no tail. |
| TC-OP-02 | running | success | yes | yes | Animated header, opener, body, `└──•` success tail. |
| TC-OP-03 | passed | success | yes | yes | Frozen `⊙`, opener, body, `└──•` cyan tail. |
| TC-OP-04 | passed | warn | yes | yes | Frozen `⊙`, opener, body, `└──•` yellow tail. |
| TC-OP-05 | failed | error | yes | yes | Frozen `⊗`, opener, body, ` ⊗  text` red tail at planet column (1-space indent). |
| TC-OP-06 | running | — | no | — | Header-only, no opener, no tail. |
| TC-OP-07 | passed | success | no | yes | Header + tail (no opener) — tail-only frame. |
| TC-OP-08 | failed | success → coerced error | yes | yes | Variant auto-coerces to `error` per Frame.tsx logic. |

Trace: TC-OP-01 – TC-OP-08 → FR-002-AC-1..AC-9.

### TaskList scheduling

| Test | concurrent | exitOnError | tasks | Expected |
|---|---|---|---|---|
| TC-OP-10 | false | true (default) | [pass, fail, pass] | First pass, second fail, third skipped. |
| TC-OP-11 | false | false | [pass, fail, pass] | First pass, second fail, third runs anyway. |
| TC-OP-12 | true | true | [pass, fail, pass] | All three run; aggregate fails because of #2. |
| TC-OP-13 | true | false | [pass, fail, pass] | All three run; aggregate fails because of #2. |

Trace: TC-OP-10 – TC-OP-13 → FR-005-AC-5..AC-6, AC-16.

### PhaseTable visibility

| Test | hidePending | rows | Expected |
|---|---|---|---|
| TC-OP-20 | undefined / false | 3 (1 all-pending, 2 running) | All 3 rows visible; 0/3 ready. |
| TC-OP-21 | true | 3 (1 all-pending, 2 running) | 2 rows visible; 0/2 ready. |
| TC-OP-22 | true | 3 (all pending) | No rows; summary shows 0/0 ready. |

Trace: TC-OP-20 – TC-OP-22 → FR-004-AC-4, AC-12, AC-15.

### Prompt: validation × default × required

| Test | Component | validate | defaultValue | required | Expected |
|---|---|---|---|---|---|
| TC-OP-30 | TextPrompt | none | "x" | n/a | submit → ok value="x". |
| TC-OP-31 | TextPrompt | rejects "" | "" | n/a | empty submit → error rendered, re-arms. |
| TC-OP-32 | TextPrompt | throws | any | n/a | thrown error.message rendered as validation error. |
| TC-OP-33 | ConfirmPrompt | n/a | true | n/a | Enter → true. |
| TC-OP-34 | ConfirmPrompt | n/a | false | n/a | Enter → false. |
| TC-OP-35 | MultiSelect | n/a | [] | true | submit with 0 selected → error, re-arms. |
| TC-OP-36 | MultiSelect | n/a | [] | false | submit with 0 selected → ok value=[]. |

Trace: TC-OP-30 – TC-OP-36 → FR-006-AC-3, AC-9..AC-10, AC-13..AC-14.

---

## 7. Constraint Boundary Tests

| Constraint | Boundary | Test value | TC | Expected |
|---|---|---|---|---|
| NFR-001: tick interval = 80 ms | exact | `useInterval(cb, 80)` | TC-CB-01 | Fires every 80 ms. |
| NFR-001: tick interval = 80 ms | below | `useInterval(cb, 79)` | TC-CB-02 | Static check fails (NFR-001-AC-4: only 80 ms is permitted). |
| FR-016-AC-12: HEADER_TICK_DIV = 3 | exact | 240 ms per orbit frame | TC-CB-03 | Orbit advances at 240 ms cadence. |
| FR-016-AC-6: PHASE_WIDTH = 4 | exact | header indicator | TC-CB-04 | All three indicators (run/pass/fail) measure 4 cells. |
| FR-007-AC-7: SIGTERM grace = 1 s | exact | unmount + wait 1.0 s | TC-CB-05 | SIGKILL fires after 1 s if process still alive. |
| FR-007-AC-7: SIGTERM grace boundary | below | unmount + wait 0.9 s, kill self via SIGTERM | TC-CB-06 | No SIGKILL needed. |
| FR-007-AC-8: poll interval default | unspecified | omit `intervalMs` | TC-CB-07 | Hook polls every 1000 ms. |
| FR-006-AC-8: password summary = 8 bullets | exact | submit "x" / "xxxxxxxxxx" | TC-CB-08 | Summary renders `••••••••` regardless of input length. |
| FR-002-AC-4: header indicator width | constant across states | render running/passed/failed | TC-CB-09 | All 3 frames have same width. |
| Terminal width — resize narrowing | mock useStdout to columns=40 | TC-CB-10 | PhaseTable status cell truncates, no wrap. |
| Terminal width — resize widening | mock useStdout to columns=200 | TC-CB-11 | Frame re-flows; status cell expands. |

---

## 8. Edge Cases

| ID | Description | Trace | TC | Risk if untested |
|---|---|---|---|---|
| EC-01 | PhaseTable: services=[]; phases=[] | FR-004-AC-12, AC-15 | TC-143, TC-146 | Crash on `Math.max(...[])`. |
| EC-02 | PhaseTable: 100 services, all running | FR-004-AC-2 | TC-EC-02 | Render lag; ensure scrolls correctly. |
| EC-03 | TaskList: tasks=[] | FR-005-AC-14 | TC-161 | Schedule doesn't fire onComplete. |
| EC-04 | TaskList: synchronous task throws (no await) | FR-005-AC-4 | TC-EC-04 | Error must still render, not crash. |
| EC-05 | TaskList: setStatus called from completed task | FR-005-AC-15 | TC-162 | Stale-state warning or crash. |
| EC-06 | Prompt: stdin not TTY | FR-006-AC-20 | TC-183 | "Raw mode not supported" thrown. |
| EC-07 | Prompt: option list empty (SelectPrompt) | FR-006-AC-11 | TC-EC-07 | No items to render — should show empty list, accept Enter as cancel. |
| EC-08 | Frame: header is empty string | FR-002-AC-12 | TC-122a | `[ ]` collapses or layout breaks. |
| EC-09 | render(): tree throws synchronously on first render | FR-008-AC-8 | TC-206 | Cursor left hidden; promise hangs. |
| EC-10 | render(): called twice concurrently | FR-008-AC-11 | TC-209 | Two trees fight for stdout. |
| EC-11 | render(): SIGTERM during pending hook | FR-008-AC-12 | TC-210 | Hook's subprocess leaks. |
| EC-12 | useExecaPhase: enabled flips false → true twice | FR-007-AC-6 | TC-EC-12 | Re-spawn behavior verified. |
| EC-13 | Polling hooks: kubectl absent for 30 s, then appears | FR-007-AC-10, AC-16 | TC-EC-13 | Recovery: hook starts succeeding. |
| EC-14 | Listing children include null/false (React idiom) | FR-001-AC-9 | TC-EC-14 | Crash on null map. |
| EC-15 | Long status string in PhaseTable: 200 chars | FR-004-AC-3 | TC-134 | Truncation works at narrow widths. |
| EC-16 | Terminal closed mid-render (stdout.destroyed) | FR-001-AC-10 | TC-109 | EPIPE handled, render() resolves. |
| EC-17 | TERM=dumb / no-color terminal | FR-001-AC-11 | TC-110 | Colors suppressed, layout intact. |
| EC-18 | Header contains newline `\n` | FR-001-AC-12 | TC-111 | Newline coerced to space. |

---

## 9. Coverage Status Legend

- ✅ Complete: TC implemented and passing.
- 🟡 In progress: TC implemented; assertions partial.
- 🔘 Planned: TC defined in this matrix; not yet implemented.

All cli TCs (TC-100 – TC-333, TC-OP-*, TC-CB-*, TC-EC-*) are 🔘 Planned at spec-authoring time. Phase 3 implements them.

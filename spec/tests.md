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
| FR-002 | Frame component | 11 | TC-112 – TC-122 |
| FR-003 | Listing component | 9 | TC-123 – TC-131 |
| FR-004 | PhaseTable component | 16 | TC-132 – TC-147 |
| FR-005 | TaskList component | 16 | TC-148 – TC-163 |
| FR-006 | Prompt components | 20 | TC-164 – TC-183 |
| FR-007 | Async work hooks | 15 | TC-184 – TC-198 |
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
| TC-107 | AC-8 | `<Frame>` accepts `<PhaseTable>` as child without crash. |
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
| TC-116 | AC-5 | `└──┐` opener appears when children OR tail set. |
| TC-117 | AC-6 | Header-only collapse when both empty. |
| TC-118 | AC-7 | Body rendered inside flexbox column. |
| TC-119 | AC-8 | Tail variants render correct glyph + color. |
| TC-120 | AC-9 | Blank line above tail. |
| TC-121 | AC-10 | Frame composes into Frame. |
| TC-122 | AC-11 | Frame forwards layout props. |

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
| TC-198 | AC-15 | Missing binary → failed state. |

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

## 6. Coverage Status Legend

- ✅ Complete: TC implemented and passing.
- 🟡 In progress: TC implemented; assertions partial.
- 🔘 Planned: TC defined in this matrix; not yet implemented.

All cli TCs (TC-100 – TC-333) are 🔘 Planned at spec-authoring time. Phase 3 implements them.

---
id: NFR-002
title: "No Imperative stdout / ANSI Control in Component Code"
artifact_type: NFR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-004"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-005"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-006"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-007"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-008"
    type: "constrains"
    cardinality: "1:1"
---

## Statement

`@agent-ix/ix-ui-cli` source modules SHALL NOT call `process.stdout.write`, `process.stderr.write`, `console.log`, `console.error`, `console.warn`, or any function that emits ANSI escape sequences directly to a stream. ANSI escape sequences (e.g. `\x1b[…`, `\r`, `\x1b[?25l`) SHALL NOT appear as string literals in component or hook code. All terminal output flows through Ink's reconciler.

## Rationale

Centralizing all terminal output through Ink eliminates the entire class of cursor-math bugs caused by hand-tracked line counts diverging from physical terminal rows. It also makes the source easier to reason about: a reader knows exactly one path emits anything to the user's terminal, and that path is yoga-aware and resize-aware.

## Acceptance Criteria

- **NFR-002-AC-1**: A static grep across `packages/cli/src/` for `process\.stdout\.write\|process\.stderr\.write\|console\.(log|error|warn)\|process\.stdout\.(cursorTo|moveCursor|clearLine|columns)` SHALL return zero matches.
- **NFR-002-AC-2**: A static grep across `packages/cli/src/` (excluding `colors.ts`) for `\\x1b\[` SHALL return zero matches. The single permitted source of an SGR escape literal is `colors.ts` (FR-009-AC-1's terracotta-red 256-color helper); cursor-control escapes (`\\x1b[?…`, `\\x1b[<n>A`, `\\x1b[K`) are forbidden everywhere.
- **NFR-002-AC-3**: A static grep across `packages/cli/src/` for `\\r` appearing **outside a regex literal** SHALL return zero matches. Regex literals that match `\r\n` line endings in input strings (e.g. `text.replace(/\\s*\\r?\\n\\s*/g, " ")` to normalize embedded newlines per FR-001-AC-12) are permitted — they consume `\r`, they do not emit it.
- **NFR-002-AC-4**: Width-aware code uses Ink's `useStdout()` hook. A grep for `process\.stdout\.columns` SHALL return zero matches.
- **NFR-002-AC-5**: Hook implementations (FR-007) MAY shell out to subprocesses via `execa` and capture their stdout/stderr — that does not violate this NFR. The output is parsed and exposed as state, never re-emitted to the user's terminal directly.

## Scope

This NFR applies to `packages/cli/src/`. Tests under `packages/cli/tests/` MAY mock or assert on `process.stdout` for verification purposes.

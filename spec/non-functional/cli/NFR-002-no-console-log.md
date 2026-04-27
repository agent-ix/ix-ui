---
id: NFR-002
title: "No Direct Console or stderr Writes in Component Code"
artifact_type: NFR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "constrains"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "constrains"
    cardinality: "1:1"
---

## Statement

`@agent-ix/ix-ui-cli` source modules SHALL NOT call `console.log`, `console.error`, `console.warn`, or `process.stderr.write` directly. All terminal output SHALL flow through `process.stdout.write` (for raw ANSI sequences) or `@clack/prompts` (for interactive prompt primitives invoked via `Listing.pause()`).

## Rationale

`console.*` prefixes output with newlines and cannot be suppressed in non-TTY test environments without monkey-patching. Callers who capture or redirect stdout must be able to reason about all output without intercepting console streams.

## Acceptance Criteria

- **NFR-002-AC-1**: A static grep for `console\.log\|console\.error\|console\.warn\|process\.stderr\.write` across `packages/cli/src/` returns zero matches.
- **NFR-002-AC-2**: PhaseTable TTY and non-TTY output paths write exclusively to `process.stdout.write`.
- **NFR-002-AC-3**: Listing TTY and non-TTY output paths (header draw, body helpers, finalizers, pause/resume) write exclusively to `process.stdout.write`.

---
id: FR-008
title: "PhaseTable — Graceful Empty Service List"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-005"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

Constructing a `PhaseTable` with an empty `serviceNames` array and subsequently calling `start()`, `finish()`, or any mutating method SHALL NOT throw.

## Behavior

- `new PhaseTable([], opts)` creates a table with zero rows.
- `start()` renders an empty table body (header only if set, footer only).
- `finish()` renders an empty summary (no rows, no failure count).

## Acceptance Criteria

- **FR-008-AC-1**: `new PhaseTable([], { phases: ["build"] })` constructs without error.
- **FR-008-AC-2**: `table.start(); table.finish()` on an empty table does not throw.
- **FR-008-AC-3**: Non-TTY `finish()` on an empty table writes output (at minimum a summary line) without throwing.

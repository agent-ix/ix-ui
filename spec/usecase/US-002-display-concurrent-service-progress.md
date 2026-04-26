---
id: US-002
title: "Display Concurrent Multi-Service Progress With Phase Columns"
artifact_type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-004"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-005"
    type: "derives_into"
    cardinality: "1:N"
---

## Story

As a **CLI command author** running concurrent operations across multiple services,
I want a `PhaseTable` that tracks each service through configurable phase columns and renders live progress in TTY or plain text in CI,
so that operators get real-time visibility without me writing any rendering logic.

## Acceptance Criteria

- **US-002-AC-1**: I instantiate `new PhaseTable(serviceNames, { phases: ["build","deploy","ready"] })` and call `table.start()` — a live table appears immediately on TTY.
- **US-002-AC-2**: I call `table.transition(svc, "build", "running")` and the row updates in place within one redraw tick (≤80ms on TTY).
- **US-002-AC-3**: In a CI environment (non-TTY), calling `transition()` emits one structured line: `[T+0.3s] svc-a: build running`.
- **US-002-AC-4**: I call `table.finish()` and the table freezes — no more redraws, ticker cleared, final state printed once.
- **US-002-AC-5**: If I pass `entry: "my-app"` and `baseDomain: "ix.internal"` to `finish()`, the frozen summary includes the entry URL.

## Context

This is the primary use case for `PhaseTable`. The phase column names are caller-defined so `PhaseTable` can serve any multi-step concurrent workflow, not just the specific secrets/pull/install/ready pipeline in ix-local-cli.

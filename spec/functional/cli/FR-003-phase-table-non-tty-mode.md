---
id: FR-003
title: "PhaseTable Non-TTY Rendering Mode"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

In non-TTY mode (CI pipelines, piped output), `PhaseTable` emits one structured line per state transition instead of in-place redraws.

## Behavior

- `start()` in non-TTY mode:
  - If `header` is set: writes `⊕  <header>\n` once.
  - Does NOT start a ticker.
- On each `transition(service, phase, state)` call: writes `[T+<elapsed>s] <service>: <phase> <state>\n` to stdout.
- `preflight(label)` in non-TTY mode: writes `🔑 <label>\n` immediately.
- `finish()` in non-TTY mode: writes a structured summary — success count and per-service elapsed, or failure count and per-service status.

## Constraints

- **FR-003-CON-1**: No ANSI escape sequences (cursor control, colour codes) SHALL be emitted in non-TTY mode output lines. Note: colour codes are acceptable in finish() summary since they degrade to plain text when stripped.

## Acceptance Criteria

- **FR-003-AC-1**: `transition("svc-a", "build", "running")` in non-TTY mode writes exactly one line matching `[T+<N>s] svc-a: build running`.
- **FR-003-AC-2**: No `setInterval` is created in non-TTY mode.
- **FR-003-AC-3**: `start()` with a header in non-TTY mode writes `⊕  <header>` before the first transition line.

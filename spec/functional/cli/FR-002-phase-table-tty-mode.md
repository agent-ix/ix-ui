---
id: FR-002
title: "PhaseTable TTY Rendering Mode"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-005"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-006"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

In TTY mode, `PhaseTable` renders the service rows in-place using cursor-up sequences, updating at a fixed 80 ms tick interval. Each redraw is wrapped in synchronized output mode to prevent flicker.

## Behavior

- `start()` draws the initial table and starts a `setInterval` at 80 ms.
- Each tick increments `spinnerFrame` and redraws.
- Redraw sequence per frame:
  1. Emit `\x1b[?2026h` (synchronized output begin) + `\x1b[?25l` (hide cursor).
  2. Move cursor up `lineCount` lines: `\x1b[${lineCount}A\r`.
  3. For each line: emit line text + `\x1b[K` (erase to end of line) + `\n`.
  4. If previous frame had more lines, emit blank `\x1b[K\n` rows then move cursor back up.
  5. Emit `\x1b[?25h` (show cursor) + `\x1b[?2026l` (synchronized output end).
- The header line (if set) shows an animated `HEADER_SPINNER` glyph cycling every 4 ticks.
- On failure in any row, the header glyph freezes at `⊗` (red).
- The footer line shows: `elapsed Xs · N/M ready` in dim text.

## Constraints

- **FR-002-CON-1**: Cursor-up only (`\x1b[NA`). Full clear (`\x1b[2J`) SHALL NOT be used — it causes visible flicker.
- **FR-002-CON-2**: The ticker MUST be cleared by `finish()`. Leaking the ticker after finish is a defect.

## Acceptance Criteria

- **FR-002-AC-1**: `start()` writes initial table state to stdout immediately (before first tick fires).
- **FR-002-AC-2**: The interval is exactly 80 ms (as passed to `setInterval`).
- **FR-002-AC-3**: The frame output contains `\x1b[?2026h` and `\x1b[?2026l` (synchronized output markers).
- **FR-002-AC-4**: After `finish()`, no further writes are emitted to stdout by the ticker.

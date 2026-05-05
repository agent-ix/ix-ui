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

## Pod Status Column

When a row is in the last phase and `setPodStatus` has been called, the phase
label column is replaced with the pod status string. The string format and
colouring rules are:

| Format | Example | Colour rule |
|--------|---------|-------------|
| `ready/total` (all ready) | `1/1` | cyan — whole count |
| `ready/total` (partial) | `1/3` | yellow — whole count, dim trailing spaces |
| `0/total·label` (not ready, with label) | `0/1·init` | yellow `0`, dim `/1·label…` |
| `0/total` (not ready, no label) | `0/1` | yellow `0`, dim `/1…` |

`colors.red` is NOT used for the pod count. Red is reserved for failed rows
(the `○` glyph and `phase failed` label). `0/N` during normal startup is
yellow to signal "in progress, not alarming".

When `ready === total` the row glyph also switches from the braille spinner to
`blue("•")` — the transition is instantaneous without waiting for the phase
to be explicitly set to `done`.

### Example — ready phase mid-startup

```
 ⊚  [ ix local up · auth · ghcr.io ]
 └──┐
    ⠦ auth-service        0/1·init       2.1s
    ⠦ identity            0/1·start      2.4s
    ⠦ permission-service  1/3            3.0s
    • vault               1/1            4.2s
  elapsed 4.2s · 1/4 ready
```

Labels emitted in the `0/N·label` suffix:

| Label | Meaning |
|-------|---------|
| `sched` | No pod scheduled yet |
| `init` | Init containers running, or `PodInitializing` waiting reason |
| `start` | `ContainerCreating` waiting reason |

## Constraints

- **FR-002-CON-1**: Cursor-up only (`\x1b[NA`). Full clear (`\x1b[2J`) SHALL NOT be used — it causes visible flicker.
- **FR-002-CON-2**: The ticker MUST be cleared by `finish()`. Leaking the ticker after finish is a defect.
- **FR-002-CON-3**: `colors.red` SHALL NOT be applied to `0/N` pod counts in any row state. Red is reserved for the failed glyph (`○`) and `phase failed` label.

## Acceptance Criteria

- **FR-002-AC-1**: `start()` writes initial table state to stdout immediately (before first tick fires).
- **FR-002-AC-2**: The interval is exactly 80 ms (as passed to `setInterval`).
- **FR-002-AC-3**: The frame output contains `\x1b[?2026h` and `\x1b[?2026l` (synchronized output markers).
- **FR-002-AC-4**: After `finish()`, no further writes are emitted to stdout by the ticker.
- **FR-002-AC-5**: `colorPods("0/1")` contains yellow escape, does not contain `\x1b[38;5;167m` (muted red).
- **FR-002-AC-6**: `colorPods("1/1")` contains cyan escape for the count.
- **FR-002-AC-7**: `colorPods("1/3")` contains yellow escape for the count.
- **FR-002-AC-8**: `colorPods("0/1·init")` formats `0` in yellow and the `·init` suffix in dim.
- **FR-002-AC-9**: `colorPods("1/1".padEnd(width))` treats the count as
  settled ready; column padding is not a state label.
- **FR-002-AC-10**: A final-phase row with `status = "1/1·settle"` remains
  active and keeps its spinner/timer until the row transitions to done with
  a plain ready count.

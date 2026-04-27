---
id: FR-016
title: "Shared Visual Style Tokens — Single Source of Truth"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-004"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/non-functional/cli/NFR-003"
    type: "constrained_by"
    cardinality: "N:1"
---

## Statement

The `cli` package SHALL expose a single style module containing every visual layout token used by terminal renderers in the design system: column positions, indents, connectors, glyphs, header rendering helpers, and TTY control sequences. All renderers in the package (`PhaseTable`, `Listing`, future helpers) SHALL import from this module exclusively — no inline string literals for indents, glyphs, or escape sequences.

## Acceptance Criteria

### Module surface

- **FR-016-AC-1**: A module at `packages/cli/src/style.ts` exports the following named tokens, all re-exported from the package root (`@agent-ix/ix-ui-cli`):

| Category | Names |
|---|---|
| Layout | `PLANET_COL`, `ROW_INDENT`, `ERROR_INDENT`, `PHASE_WIDTH`, `HEADER_TICK_DIV` |
| Connectors | `ROUTE_INDENT`, `ROUTE_OUT` |
| Glyphs | `GLYPH_DONE`, `GLYPH_FAIL`, `GLYPH_FAIL_MARK` |
| Header rendering | `PHASE_PASS`, `PHASE_FAIL`, `phaseRun(frame)`, `colorOrbitFrame(frame)`, `renderHeader(text)`, `ORBIT_SPINNER` |
| TTY control | `HIDE_CURSOR`, `SHOW_CURSOR`, `SYNC_BEGIN`, `SYNC_END`, `CLEAR_EOL`, `moveUp(n)` |

### Standard layout invariants

- **FR-016-AC-2**: `PLANET_COL = 1` — the orbit/marker glyph sits at column 1 of every header line.
- **FR-016-AC-3**: `ROW_INDENT = "    "` (4 spaces) — body row glyphs (`•`, `○`) sit at column 4.
- **FR-016-AC-4**: `ERROR_INDENT = "        "` (8 spaces) — error messages sit under the row name (past glyph + space).
- **FR-016-AC-5**: `PHASE_WIDTH = 4` — every header indicator (animated spinner, frozen pass, frozen fail) is exactly 4 columns wide so the bracketed `[ … ]` text starts at the same column in every state.
- **FR-016-AC-6**: `ROUTE_INDENT` is `dim(" └──┐")` — the opener under the header. The `└` aligns with the planet (column 1).
- **FR-016-AC-7**: `ROUTE_OUT` is `dim(ROW_INDENT + "   └──")` — the tail prefix. The `└` sits 3 columns past `ROW_INDENT` so the tail glyph (`•` or `⊗`) lands fully under body content.

### Header rendering

- **FR-016-AC-8**: `renderHeader(text)` wraps `text` in gray brackets with gray `·` separators: `{gray("[")} {text-with-·-grayed} {gray("]")}`.
- **FR-016-AC-9**: `PHASE_PASS` is the orbit at rest (frame index 5, colored). `PHASE_FAIL` is `" " + red("⊗") + "  "` (4 chars, padded so `[ … ]` aligns).
- **FR-016-AC-10**: `phaseRun(spinnerFrame)` returns the colored orbit frame for the current tick: `colorOrbitFrame(ORBIT_SPINNER[Math.floor(spinnerFrame / HEADER_TICK_DIV) % ORBIT_SPINNER.length])`.
- **FR-016-AC-11**: `HEADER_TICK_DIV = 3` — the orbit advances every 3 ticks (3 × 80 ms = 240 ms per frame at the standard redraw interval, NFR-001).

### TTY control sequences

- **FR-016-AC-12**: `HIDE_CURSOR = "\x1b[?25l"`, `SHOW_CURSOR = "\x1b[?25h"`, `SYNC_BEGIN = "\x1b[?2026h"`, `SYNC_END = "\x1b[?2026l"`, `CLEAR_EOL = "\x1b[K"`.
- **FR-016-AC-13**: `moveUp(n)` returns `\x1b[<n>A\r` for `n > 0`, else `\r`.

### Renderer compliance

- **FR-016-AC-14**: A static check across `packages/cli/src/` SHALL find no inline literals for the standardized indents (`"    "`, `"        "`), connectors (`"└──┐"`, `"└──"`), or TTY escape codes (`"\x1b[K"`, `"\x1b[?25l"`, etc.) outside `style.ts`.
- **FR-016-AC-15**: `PhaseTable` and `Listing` import every glyph, indent, connector, and control sequence from the style module. Bumping a value in `style.ts` changes all consumers with no other source edits.

## Rendered Example — Layout Invariants

The following diagram shows where each token lands on screen. Caret positions are 1-indexed columns.

```
Column:  1234567890123456789
         ↓
         ⊙  [ ix elements list ]      ← PLANET_COL = 1, PHASE_WIDTH = 4 → "[ " starts at col 5
          └──┐                        ← ROUTE_INDENT (col 2 = " "  + "└──┐" at col 2)
             ↑
             opener ┐ at col 5
             ↓
             group header sits at ROW_INDENT (col 5)
             • item                   ← GLYPH_DONE at col 5
                error detail          ← ERROR_INDENT at col 9 (under item name)
                ↓
                ↓
                └──•  Done.           ← ROUTE_OUT (col 8 = ROW_INDENT + 3) + GLYPH_DONE
                ↑
                tail • at col 11
```

## Constraints

- **FR-016-CON-1**: Editing `ROUTE_OUT` (e.g. shifting tail right by 3 cols → adjusting the `+ "   "`) SHALL change the rendering of every consumer. The `Listing` and `PhaseTable` tests verify this by snapshotting their tail outputs.
- **FR-016-CON-2**: Glyphs MAY be Unicode (e.g. `•`, `○`, `⊗`, `⊙`) but MUST be exactly 1 visual cell wide where used in column-aligned positions.
- **FR-016-CON-3**: This module has no runtime dependencies beyond `picocolors` and `@agent-ix/ix-ui-semantic` (for `ORBIT_SPINNER`).

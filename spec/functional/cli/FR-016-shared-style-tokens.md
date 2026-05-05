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
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Statement

The `cli` package SHALL expose a single style module containing every visual layout token used by Ink components in the design system: column positions, indents, connectors, glyphs, header text rendering, and color helpers. All components in the package (`<Frame>`, `<HeaderSpinner>`, `<Listing>`, `<PhaseTable>`, `<TaskList>`, prompts) SHALL import from this module exclusively — no inline string literals for indents, glyphs, or colors.

## Acceptance Criteria

### Module surface

- **FR-016-AC-1**: A module at `packages/cli/src/style.ts` exports the following named tokens, all re-exported from the package root (`@agent-ix/ix-ui-cli`):

| Category | Names |
|---|---|
| Layout | `PLANET_COL`, `ROW_INDENT`, `NOTE_INDENT`, `ERROR_INDENT`, `PHASE_WIDTH`, `HEADER_TICK_DIV` |
| Connectors | `ROUTE_INDENT`, `ROUTE_OUT` |
| Glyphs | `GLYPH_DONE`, `GLYPH_RESULT`, `GLYPH_FAIL`, `GLYPH_FAIL_MARK`, `GLYPH_WAITING`, `GLYPH_CANCELLED` |
| Header | `PHASE_PASS`, `PHASE_FAIL`, `colorOrbitFrame(frame)`, `renderHeader(text)`, `ORBIT_SPINNER` |
| Colors | `colors.{cyan,green,yellow,red,dim,bold,underline,bgCyan,black}`, `blue` |
| Pod-status helper | `colorPods(status)` |

### Standard layout invariants

- **FR-016-AC-2**: `PLANET_COL = 1` — the orbit/marker glyph sits at column 1 of every header line. Exported as a numeric constant for documentation; layout enforcement is the responsibility of `<Frame>` (FR-002).
- **FR-016-AC-3**: `ROW_INDENT = "    "` (4 spaces) — body row glyphs (`•`, `○`) sit at column 5 (one past `PLANET_COL`). Used as `marginLeft={4}` in body `<Box>`s or as a string prefix inside `<Text>`.
- **FR-016-AC-4**: `NOTE_INDENT = "      "` (6 spaces) — sub-line notes sit under body content past the glyph + space.
- **FR-016-AC-5**: `ERROR_INDENT = "        "` (8 spaces) — error messages sit under the row name (past glyph + space).
- **FR-016-AC-6**: `PHASE_WIDTH = 4` — every header indicator (animated spinner, frozen pass, frozen fail) is exactly 4 columns wide so the bracketed `[ … ]` text starts at the same column in every state.
- **FR-016-AC-7**: `ROUTE_INDENT` is `dim(" └──┐")` — the opener under the header. The `└` aligns with the planet (column 1).
- **FR-016-AC-8**: `ROUTE_OUT` is `ROW_INDENT` — the tail prefix uses the standard body indent. The tail glyph (`✧`, `⊗`) is appended by the renderer.

### Header rendering

- **FR-016-AC-9**: `renderHeader(text)` wraps `text` in gray brackets with gray `·` separators: `{gray("[")} {text-with-·-grayed} {gray("]")}`. Returns a string suitable for use inside an Ink `<Text>` child.
- **FR-016-AC-10**: `PHASE_PASS` is the orbit at rest (frame index 5, colored). `PHASE_FAIL` is `" " + red("⊗") + "  "` (4 chars, padded so `[ … ]` aligns).
- **FR-016-AC-11**: `colorOrbitFrame(frame)` per-glyph colors a 4-char orbit frame string. `ORBIT_SPINNER` is re-exported from `@agent-ix/ix-ui-semantic`.
- **FR-016-AC-12**: `HEADER_TICK_DIV = 3` — the orbit advances every 3 ticks (3 × 80 ms = 240 ms per frame at the standard animation interval, NFR-001). The advance is implemented by the `<HeaderSpinner>` component (FR-002), which consumes `useInterval(tick, 80)` and computes its current frame as `Math.floor(spinnerFrame / HEADER_TICK_DIV) % ORBIT_SPINNER.length`.

### Renderer compliance

- **FR-016-AC-13**: A static check across `packages/cli/src/` (excluding `style.ts`) SHALL find no inline literals for the standardized indents (`"    "`, `"      "`, `"        "`), connectors (`"└──┐"`), or glyphs (`"•"`, `"○"`, `"⊗"`, `"✧"`, `"⊙"`, `"⊕"`).
- **FR-016-AC-14**: All components import every glyph, indent, connector, and color from the style module. Bumping a value in `style.ts` changes all consumers with no other source edits.

## Constraints

- **FR-016-CON-1**: Editing `ROUTE_OUT` SHALL change the rendering of every consumer. The `<Listing>` and `<PhaseTable>` snapshot tests verify this.
- **FR-016-CON-2**: Glyphs MAY be Unicode (e.g. `•`, `○`, `⊗`, `⊙`) but MUST be exactly 1 visual cell wide where used in column-aligned positions.
- **FR-016-CON-3**: This module has no runtime dependencies beyond `picocolors` and `@agent-ix/ix-ui-semantic` (for `ORBIT_SPINNER`, `BRAILLE_SPINNER`, `PHASE_GLYPHS`).
- **FR-016-CON-4**: ANSI escape sequences (e.g. `\x1b[?25l`) SHALL NOT appear in the style module or anywhere in `packages/cli/src/` (per NFR-002). Cursor visibility is managed by Ink.

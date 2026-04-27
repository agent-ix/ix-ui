---
id: US-004
title: "Retheme the Entire CLI From One Module"
artifact_type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/non-functional/cli/NFR-003"
    type: "derives_into"
    cardinality: "1:1"
---

## Story

As a **design system maintainer**,
I want every glyph, indent, connector, and header convention used by `PhaseTable`, `Listing`, and any future renderer to live in a single style module,
so that I can adjust the orbit glyphs, the row indent, the brackets, or the tail connector once and have every CLI command — across `ix-cli` and any third-party plugin — pick up the change.

## Acceptance Criteria

- **US-004-AC-1**: A single module (`@agent-ix/ix-ui-cli/style`) exports every shared visual token: `PLANET_COL`, `ROW_INDENT`, `ERROR_INDENT`, `ROUTE_INDENT`, `ROUTE_OUT`, `PHASE_PASS`, `PHASE_FAIL`, `PHASE_WIDTH`, `HEADER_TICK_DIV`, `GLYPH_DONE`, `GLYPH_FAIL`, `GLYPH_FAIL_MARK`, `phaseRun`, `colorOrbitFrame`, `renderHeader`, `ORBIT_SPINNER`, plus the standard TTY control sequences (`HIDE_CURSOR`, `SHOW_CURSOR`, `SYNC_BEGIN`, `SYNC_END`, `CLEAR_EOL`, `moveUp`).
- **US-004-AC-2**: `PhaseTable` and `Listing` reference the style module exclusively for these tokens — no inline string literals for indents, glyphs, or escape sequences.
- **US-004-AC-3**: Editing `ROUTE_OUT` (e.g. shifting the tail right by 3 columns) changes the rendering of every consumer with no other source edits.
- **US-004-AC-4**: Tokens are re-exported from the package root (`@agent-ix/ix-ui-cli`) so consumers needing to author a new renderer can import them directly without depending on a sub-path.

## Context

Before this story, `PhaseTable` defined its own copies of every layout constant. A new renderer (e.g. `Listing`) would either duplicate them or import from `phase-table.ts`, neither of which is a clean boundary. Centralizing in `style.ts` gives the design system a real "tweak once, retheme everywhere" contract.

This story is enabling work for any future ix-ui renderer (status panels, progress meters, prompt frames). The first beneficiary is the `Listing` helper introduced in US-003.

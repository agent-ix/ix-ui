---
id: US-004
title: "Retheme the Entire CLI From One Module"
type: US
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
I want every glyph, indent, connector, and header convention used by `<Frame>`, `<Listing>`, `<PhaseTable>`, `<TaskList>`, prompts, and any future component to live in a single style module,
so that I can adjust the orbit glyphs, the row indent, the brackets, or the tail connector once and have every CLI command — across `ix-cli` and any third-party plugin — pick up the change.

## Acceptance Criteria

- **US-004-AC-1**: A single module (`@agent-ix/ix-ui-cli/style`) exports every shared visual token: layout constants (`PLANET_COL`, `ROW_INDENT`, `NOTE_INDENT`, `ERROR_INDENT`, `PHASE_WIDTH`, `HEADER_TICK_DIV`), connectors (`ROUTE_INDENT`, `ROUTE_OUT`), glyphs (`GLYPH_DONE`, `GLYPH_RESULT`, `GLYPH_FAIL`, `GLYPH_FAIL_MARK`, `GLYPH_WAITING`, `GLYPH_CANCELLED`), header helpers (`PHASE_PASS`, `PHASE_FAIL`, `colorOrbitFrame`, `renderHeader`, `ORBIT_SPINNER`), color palette (`colors`, `blue`), and the pod-status helper (`colorPods`).
- **US-004-AC-2**: All Ink components reference the style module exclusively for these tokens — no inline string literals for indents, glyphs, or colors.
- **US-004-AC-3**: Editing `ROUTE_OUT` (e.g. shifting the tail right by 3 columns) changes the rendering of every consumer with no other source edits.
- **US-004-AC-4**: Tokens are re-exported from the package root (`@agent-ix/ix-ui-cli`) so consumers authoring a new component can import them directly without depending on a sub-path.

## Context

Centralizing all visual tokens in `style.ts` gives the design system a real "tweak once, retheme everywhere" contract. New components (status panels, progress meters, prompt frames, future visualization shapes) consume the same module and immediately participate in any retheme.

ANSI cursor-control sequences are NOT part of this module — Ink owns cursor management (NFR-002).

---
id: NFR-003
title: "All Visual Style Lives in One Module — No Inline Literals in Renderers"
artifact_type: NFR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-013"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-014"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-015"
    type: "constrains"
    cardinality: "1:1"
---

## Statement

All visual layout tokens (indents, connectors, glyphs, header rendering, TTY control sequences) used by `@agent-ix/ix-ui-cli` renderers SHALL be defined in `packages/cli/src/style.ts` and SHALL NOT be duplicated, hand-rolled, or inline-literalled in any other module of the package.

## Rationale

The design system's "tweak once, retheme everywhere" guarantee depends on every renderer reading the same tokens. Inline literals (e.g. `"└──┐"` in one file, `"    "` indent in another) silently fork the visual language and defeat centralized control. This NFR makes the centralization auditable by static check and prevents regressions as new renderers are added.

## Acceptance Criteria

- **NFR-003-AC-1**: A static grep across `packages/cli/src/` (excluding `style.ts`) for the canonical indent strings (`"    "`, `"        "`) used as ASCII whitespace literals SHALL return zero matches outside template-literal interpolations of the corresponding token.
- **NFR-003-AC-2**: A static grep across `packages/cli/src/` (excluding `style.ts`) for connector substrings (`"└──┐"`, `"└──•"`, `"└──"`) SHALL return zero matches.
- **NFR-003-AC-3**: A static grep across `packages/cli/src/` (excluding `style.ts`) for TTY control sequences (`"\x1b[?25l"`, `"\x1b[?25h"`, `"\x1b[?2026h"`, `"\x1b[?2026l"`, `"\x1b[K"`) SHALL return zero matches.
- **NFR-003-AC-4**: A static grep across `packages/cli/src/` (excluding `style.ts`) for the standard glyphs used in headers/rows (`"⊙"`, `"⊗"`, `"⊕"`, `"●"`, `"○"`, `"·"` used as a row glyph) SHALL return zero matches outside re-export statements.
- **NFR-003-AC-5**: `PhaseTable` and `Listing` import every layout token they use from `style.ts` (or via the package root re-export). The respective source files contain no `const ROW_INDENT = ...`, `const ROUTE_INDENT = ...`, etc. — only imports.

## Verification

A single test case (TC-NFR-003) iterates the source tree and runs the four greps above with `style.ts` excluded. Failure on any grep is treated as a hard fail.

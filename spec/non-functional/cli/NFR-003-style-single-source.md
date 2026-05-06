---
id: NFR-003
title: "All Visual Style Lives in One Module — No Inline Literals in Components"
artifact_type: NFR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-004"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-005"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-006"
    type: "constrains"
    cardinality: "1:1"
---

## Statement

All visual layout tokens (indents, connectors, glyphs, header rendering, color helpers) used by `@agent-ix/ix-ui-cli` components SHALL be defined in `packages/cli/src/style.ts` and SHALL NOT be duplicated, hand-rolled, or inline-literalled in any other module of the package.

## Rationale

The design system's "tweak once, retheme everywhere" guarantee depends on every component reading the same tokens. Inline literals (e.g. `"└──┐"` in one file, `"    "` indent in another) silently fork the visual language and defeat centralized control. This NFR makes the centralization auditable by static check and prevents regressions as new components are added.

## Acceptance Criteria

- **NFR-003-AC-1**: A static grep across `packages/cli/src/` (excluding `style.ts`) for the canonical indent strings (`"    "`, `"      "`, `"        "`) used as ASCII whitespace literals SHALL return zero matches outside template-literal interpolations of the corresponding token.
- **NFR-003-AC-2**: A static grep across `packages/cli/src/` (excluding `style.ts`) for connector substrings (`"└──┐"`, `"└──•"`, `"└──"`) SHALL return zero matches.
- **NFR-003-AC-3**: A static grep across `packages/cli/src/` (excluding `style.ts`) for the standard glyphs used in headers/rows (`"⊙"`, `"⊗"`, `"⊕"`, `"●"`, `"○"`, `"·"` used as a row glyph) SHALL return zero matches outside re-export statements.
- **NFR-003-AC-4**: Each component file imports every layout token it uses from `style.ts` (or via the package root re-export). The component source files contain no `const ROW_INDENT = ...`, `const ROUTE_INDENT = ...`, etc. — only imports.

## Verification

A single test case iterates the source tree and runs the three greps above with `style.ts` excluded. Failure on any grep is treated as a hard fail.

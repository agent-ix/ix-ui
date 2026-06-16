---
id: FR-004
title: "STATUS_DOTS Constants"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`STATUS_DOTS` is a set of named Unicode characters used as per-row status indicators in phase-column tables and summary displays. They are distinct from the per-cell phase glyphs in `PHASE_GLYPHS` and represent the overall row outcome.

## Definition

```ts
export const STATUS_DOTS = {
  done:    "●",
  failed:  "○",
  pending: "·",
} as const;
```

## Semantics

| Key | Character | Usage |
|-----|-----------|-------|
| `done` | `●` (filled circle) | Row completed successfully; rendered in accent colour (cyan). |
| `failed` | `○` (open circle) | Row failed; rendered in error colour (ANSI 167 red). |
| `pending` | `·` (middle dot) | Row not yet started or in progress. |

## Constraints

- **FR-004-CON-1**: These three characters are normative. Renderers SHALL use these exact code points.

## Acceptance Criteria

- **FR-004-AC-1**: `STATUS_DOTS` is exported from `@agent-ix/ix-ui-semantic`.
- **FR-004-AC-2**: `STATUS_DOTS.done === "●"`, `STATUS_DOTS.failed === "○"`, `STATUS_DOTS.pending === "·"`.

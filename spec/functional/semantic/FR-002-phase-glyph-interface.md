---
id: FR-002
title: "PhaseGlyph Interface"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`PhaseGlyph` defines the shape of a single glyph entry in the canonical glyph map. It carries the rendered string for TTY environments, the plain-text fallback for non-TTY environments, and a flag indicating whether the glyph should be animated.

## Definition

```ts
export interface PhaseGlyph {
  tty: string;
  nonTty: string;
  animated: boolean;
}
```

## Field Semantics

| Field | Type | Meaning |
|-------|------|---------|
| `tty` | `string` | Rendered character for full-colour TTY output. |
| `nonTty` | `string` | Plain-text label for CI/non-TTY environments. |
| `animated` | `boolean` | Whether a rendering component should cycle through spinner frames for this state. |

## Constraints

- **FR-002-CON-1**: Both `tty` and `nonTty` SHALL be non-empty strings.
- **FR-002-CON-2**: `animated: true` implies the renderer SHOULD replace `tty` with a spinner frame from `BRAILLE_SPINNER`; the `tty` value on the glyph entry serves as a static fallback only.

## Acceptance Criteria

- **FR-002-AC-1**: `PhaseGlyph` is exported from `@agent-ix/ix-ui-semantic`.
- **FR-002-AC-2**: All three fields (`tty`, `nonTty`, `animated`) are present and typed as specified.

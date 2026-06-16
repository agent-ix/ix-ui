---
id: FR-006
title: "HEADER_SPINNER Frame Array"
type: FR
relationships: []
---

## Description

`HEADER_SPINNER` is the canonical animation frame array used in the `PhaseTable` header glyph to indicate that an operation is in progress at the table level. It advances at a slower rate than `BRAILLE_SPINNER` (one frame per 4 display ticks = 320 ms at 80 ms tick interval).

## Definition

```ts
export const HEADER_SPINNER = ["⊕", "⊘", "⊗", "⊖"];
```

## Constraints

- **FR-006-CON-1**: The array SHALL contain exactly 4 frames in the canonical order above.
- **FR-006-CON-2**: Frame selection: `HEADER_SPINNER[Math.floor(spinnerFrame / 4) % HEADER_SPINNER.length]`.
- **FR-006-CON-3**: On failure, the header glyph SHALL be replaced with `⊗` (static, no animation).

## Acceptance Criteria

- **FR-006-AC-1**: `HEADER_SPINNER` is exported from `@agent-ix/ix-ui-semantic`.
- **FR-006-AC-2**: `HEADER_SPINNER.length === 4`.
- **FR-006-AC-3**: Every element is a non-empty string.

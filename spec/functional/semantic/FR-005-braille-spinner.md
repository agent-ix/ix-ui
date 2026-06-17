---
id: FR-005
title: "BRAILLE_SPINNER Frame Array"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-003"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`BRAILLE_SPINNER` is the canonical animation frame array for rendering `queued` and `running` phase states in TTY mode. Renderers cycle through these frames at the display redraw interval.

## Definition

```ts
export const BRAILLE_SPINNER = [
  "⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"
];
```

## Constraints

- **FR-005-CON-1**: The array SHALL contain exactly 10 frames in the canonical order above.
- **FR-005-CON-2**: Frame selection: `BRAILLE_SPINNER[spinnerFrame % BRAILLE_SPINNER.length]`.
- **FR-005-CON-3**: `queued` frames SHALL be rendered in yellow; `running` frames in cyan.

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| FR-005-AC-1 | `BRAILLE_SPINNER` is exported from `@agent-ix/ix-ui-semantic` | Test |
| FR-005-AC-2 | `BRAILLE_SPINNER.length === 10` | Test |
| FR-005-AC-3 | Every element is a non-empty string | Test |

- **FR-005-AC-1**: `BRAILLE_SPINNER` is exported from `@agent-ix/ix-ui-semantic`.
- **FR-005-AC-2**: `BRAILLE_SPINNER.length === 10`.
- **FR-005-AC-3**: Every element is a non-empty string.


## Dependencies

- **Upstream**: FR-003 (depends_on)

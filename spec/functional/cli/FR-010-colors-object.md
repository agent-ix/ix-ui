---
id: FR-010
title: "colors — Canonical Colour Palette Object"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/stakeholder/StR-001"
    type: "implements"
    cardinality: "1:1"
---

## Description

`colors` is the exported colour palette object from `@agent-ix/ix-ui-cli`. It wraps `picocolors` functions and adds the custom `red` (FR-009). All Agent IX CLI components that apply colour SHALL use this object rather than importing `picocolors` directly, ensuring a single point of override if the palette changes.

## Definition

```ts
export const colors = {
  cyan,
  green,
  yellow,
  red,          // ANSI 256 colour 167 — see FR-009
  dim,
  bold,
  underline,
  bgCyan,
  black,
};
export const blue = pc.cyan;   // "IX blue" alias
```

## Constraints

- **FR-010-CON-1**: Every key SHALL be a `(s: string) => string` function (a string wrapper).
- **FR-010-CON-2**: `blue` SHALL be an alias for `cyan` — the "IX blue" accent colour maps to terminal cyan.

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| FR-010-AC-1 | `colors` is exported from `@agent-ix/ix-ui-cli` | Test |
| FR-010-AC-2 | `colors` has keys `cyan`, `green`, `yellow`, `red`, `dim`, `bold`, `underline`, `bgCyan`, `black` | Test |
| FR-010-AC-3 | `blue` is exported separately and equals `colors.cyan` | Test |
| FR-010-AC-4 | Every value is a function with signature `(s: string) => string` | Test |

## Dependencies

- **Upstream**: StR-001 consistent terminal design language; FR-009 `colors.red` terracotta red
- **Downstream**: FR-016 shared style tokens

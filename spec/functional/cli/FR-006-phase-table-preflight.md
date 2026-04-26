---
id: FR-006
title: "PhaseTable.preflight() — Pre-Flight Label"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`preflight(label)` records a pre-flight label (e.g., credential resolution, manifest fetch) that is displayed above the service table rows.

## Signature

```ts
preflight(label: string): void
```

## Behavior

- **TTY mode**: Appends `  🔑 <label>` to an internal `preflightLines` array. The lines are rendered above the service rows on every draw tick and in the frozen finish summary.
- **Non-TTY mode**: Immediately writes `🔑 <label>\n` to stdout.

## Constraints

- **FR-006-CON-1**: `preflight()` MAY be called before `start()`. Pre-flight lines accumulate until `start()` incorporates them into the first draw.
- **FR-006-CON-2**: Pre-flight lines SHALL appear before the service rows in both live TTY and frozen finish output.

## Acceptance Criteria

- **FR-006-AC-1**: In non-TTY mode, `preflight("logged in as bot")` writes `🔑 logged in as bot\n` to stdout immediately.
- **FR-006-AC-2**: In TTY mode, pre-flight labels appear above the service rows in the rendered output.
- **FR-006-AC-3**: Multiple `preflight()` calls accumulate; all labels appear in order.

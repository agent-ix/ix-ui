---
id: FR-005
title: "PhaseTable.finish() — Freeze and Final Summary"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`finish()` stops the ticker and renders a frozen final summary of all rows — either a success summary with elapsed times and optional URLs, or a failure summary with per-service error details.

## Signature

```ts
finish(entry?: string | null, baseDomain?: string): void
```

## Behavior

1. Clears the `setInterval` ticker (no-op if non-TTY).
2. Computes `failed` rows: any row with at least one phase in `"failed"` state.
3. **TTY success** (no failed rows):
   - Prints frozen header with `●` glyph (blue/cyan).
   - Per row: `●  <name>  <pods>  <elapsed>  →  https://<name>.<baseDomain>` (URL omitted if `baseDomain` not provided).
   - If `entry` and `baseDomain` provided: appends `app:  https://<entry>.<baseDomain>` (underlined, cyan).
4. **TTY failure** (any failed rows):
   - Prints frozen header with `⊗` glyph (red).
   - Per failed row: `○  <name>  <pods>  <elapsed>` + optional dimmed error line.
   - Per success row: `●  <name>  <pods>  <elapsed>`.
   - Appends `⊗ N service(s) failed` summary line.
5. **Non-TTY**: equivalent structured text without cursor control; colour codes acceptable.
6. Sets `lineCount = 0` after rendering.

## Constraints

- **FR-005-CON-1**: `finish()` SHALL be idempotent with respect to the ticker: calling it twice SHALL NOT throw (second call is a no-op on a null ticker).
- **FR-005-CON-2**: The frozen output is written with the same synchronized-output + cursor-up pattern as a live frame (TTY mode), ensuring no blank gap between the live table and the frozen summary.

## Acceptance Criteria

- **FR-005-AC-1**: After `finish()`, no further output is written to stdout by the `PhaseTable` instance.
- **FR-005-AC-2**: Non-TTY success summary contains each service name and the string `ready in`.
- **FR-005-AC-3**: Non-TTY failure summary contains `failed` and the error message set via `setError()`.
- **FR-005-AC-4**: When `entry = "my-app"` and `baseDomain = "ix.internal"`, the frozen output contains `my-app.ix.internal`.
- **FR-005-AC-5**: When `baseDomain` is omitted, no URL is rendered in the summary.

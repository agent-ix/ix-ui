---
id: FR-012
title: "Prompt Helpers — introCommand / outroSuccess / outroError"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "implements"
    cardinality: "1:1"
---

## Description

`introCommand`, `outroSuccess`, and `outroError` are thin wrappers over `@clack/prompts` that enforce the Agent IX command framing convention. All CLI command handlers SHALL use these rather than calling clack directly.

## Definitions

```ts
function introCommand(name: string): void
  // → p.intro(pc.bgCyan(pc.black(` ${name} `)))

function outroSuccess(msg: string): void
  // → p.outro(pc.green(msg))

function outroError(msg: string): void
  // → p.outro(pc.red(msg))
```

## Constraints

- **FR-012-CON-1**: `introCommand` SHALL pad `name` with a single space on each side inside the bgCyan background, matching the ix-local-cli pattern: `` ` ${name} ` ``.

## Acceptance Criteria

- **FR-012-AC-1**: `introCommand("ix up")` writes output that contains the string `ix up` wrapped in ANSI bgCyan and black foreground codes.
- **FR-012-AC-2**: `outroSuccess("Done.")` writes output containing the string `Done.` wrapped in green colour codes.
- **FR-012-AC-3**: `outroError("Failed.")` writes output containing the string `Failed.` wrapped in red colour codes.

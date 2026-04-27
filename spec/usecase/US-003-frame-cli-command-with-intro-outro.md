---
id: US-003
title: "Frame a CLI Command With a Listing"
artifact_type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-013"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-014"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-015"
    type: "derives_into"
    cardinality: "1:N"
---

## Story

As a **CLI command author**,
I want a single `startListing(header)` helper that renders the standard ix orbit-framed header, body content, and pass/warn/fail tail,
so that every command in the ecosystem has the same opening, body, and closing visual structure without me hand-rolling ANSI sequences or remembering glyph conventions.

## Acceptance Criteria

- **US-003-AC-1**: `startListing("ix elements list")` returns a handle that, on TTY, immediately animates the orbit header `⊙  [ ix elements list ]` in place using `\r`-based redraws (no scrollback noise).
- **US-003-AC-2**: Calling body helpers (`group`, `item`, `note`, `raw`) commits the animated header to scrollback (a `└──┐` opener appears) and writes the row beneath it. Subsequent body writes append normally.
- **US-003-AC-3**: Calling `success(msg)` freezes the header to the pass glyph and emits a `└──•  <green msg>` tail. `warn(msg)` does the same in yellow. `error(msg)` freezes to the fail glyph (`⊗`) and emits the tail in red.
- **US-003-AC-4**: `commit()` lets the author hand the cursor off to listr/clack mid-command — the header line is committed, the opener appears, and any external output lands as body content. The terminal call (`success`/`warn`/`error`) still emits the tail.
- **US-003-AC-5**: In a non-TTY environment, the same handle emits a plain `⊕  <header>` line on construction, plain `•`/`✓`/`!`/`⊗` glyphs in the body, and a single trailing summary line. No animation, no cursor control sequences.
- **US-003-AC-6**: Every body row, opener, and tail uses indents and connectors imported from the shared style module (FR-016) — the helper does not hand-roll spacing.

## Context

This story replaces the prior intro/outro framing helpers (`introCommand`/`outroSuccess`/`outroError`/`outroWarning`/`outroInfo`/`runTaskList`). Those helpers wrapped `@clack/prompts` with a `┌`/`│`/`└` frame that did not match the orbit-framed `PhaseTable` rendering used by long-running task pipelines. `startListing` produces the same visual vocabulary as `PhaseTable` — same orbit header, same `└──┐` opener, same `└──•` tail — so a one-shot listing command and a multi-service progress run read as the same family of output.

Body helpers are deliberately small (`group`, `item`, `note`, `raw`) and assume static content. Long-running task work continues to belong in `PhaseTable` (US-002).

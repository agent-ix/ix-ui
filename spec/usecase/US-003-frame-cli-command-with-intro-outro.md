---
id: US-003
title: "Frame a CLI Command With a Listing"
type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-005"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-006"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-008"
    type: "derives_into"
    cardinality: "1:N"
---

## Story

As a **CLI command author**,
I want a `<Listing>` JSX component that renders the standard ix orbit-framed header, body content, and pass/warn/fail tail,
so that every command in the ecosystem has the same opening, body, and closing visual structure without me hand-rolling ANSI sequences or remembering glyph conventions.

## Acceptance Criteria

- **US-003-AC-1**: Rendering `<Listing header="ix elements list" status="running" />` via `render()` immediately animates the orbit header `⊙  [ ix elements list ]` in place — Ink reconciles frame diffs and the user sees a single line update.
- **US-003-AC-2**: Adding `<Item />` / `<Group />` / `<Note />` children to the listing produces the standard body layout: a `└──┐` opener appears under the header, body rows render at `ROW_INDENT`, notes at `NOTE_INDENT`.
- **US-003-AC-3**: Re-rendering with `status="passed"` and `tail="<msg>"` (or `tailVariant="warn"` / `"error"`) freezes the header to the corresponding glyph and emits a `└──•` tail (or red `⊗` tail for errors).
- **US-003-AC-4**: A command that needs interactive input embeds prompt components (FR-006) as children of `<Listing>` — input is delegated automatically; the orbit continues animating.
- **US-003-AC-5**: A command that needs to run task work embeds `<TaskList>` (FR-005) as a child or sibling — both share the same visual vocabulary.
- **US-003-AC-6**: In a non-TTY environment, the same component tree emits plain frames (one per state change) with no animation and no cursor control sequences (FR-008-AC-6, AC-7).
- **US-003-AC-7**: Every body row, opener, and tail uses indents and connectors imported from the shared style module (FR-016).

## Context

This story produces the visual frame used by every non-task command in the Agent IX CLI ecosystem. `<Listing>` shares its visual vocabulary (orbit header, `└──┐` opener, `└──•` tail) with `<PhaseTable>` (US-002) and `<TaskList>` so a one-shot listing command and a multi-service progress run read as the same family of output.

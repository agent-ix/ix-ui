---
id: FR-014
title: "Listing Body Helpers — group, item, note, raw"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-013"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "depends_on"
    cardinality: "1:1"
---

## Statement

A `Listing` handle SHALL provide four body writers — `group(name)`, `item(name, description?)`, `note(text)`, `raw(text)` — that emit consistently indented rows beneath the `└──┐` opener. All four SHALL invoke `commit()` first so the opener appears before any body content.

## Acceptance Criteria

### group(name)

- **FR-014-AC-1**: `group(name)` writes a blank line, then `{ROW_INDENT}{bold(cyan(name))}\n` (TTY) or `{ROW_INDENT}{name}\n` (plain) — used to introduce a section in a listing.
- **FR-014-AC-2**: `group()` calls `commit()` before writing.

### item(name, description?)

- **FR-014-AC-3**: `item(name)` writes `{ROW_INDENT}{GLYPH_DONE} {name}\n`.
- **FR-014-AC-4**: `item(name, description)` writes `{ROW_INDENT}{GLYPH_DONE} {name}{dim("  — " + description)}\n` (TTY) or `{ROW_INDENT}• {name}  — {description}\n` (plain).
- **FR-014-AC-5**: `item()` calls `commit()` before writing.

### note(text)

- **FR-014-AC-6**: `note(text)` writes `{ROW_INDENT}{dim(text)}\n` (TTY) or `{ROW_INDENT}{text}\n` (plain). Used for un-bulleted contextual lines (e.g. instructions, key/value details).
- **FR-014-AC-7**: `note()` calls `commit()` before writing.

### raw(text)

- **FR-014-AC-8**: `raw(text)` writes `{text}\n` un-indented and un-styled. Escape hatch for content that ships its own ANSI sequences (e.g. `cli-table3` output).
- **FR-014-AC-9**: `raw()` calls `commit()` before writing.

## Rendered Examples

### `group` + `item`

Input:
```ts
const list = startListing("ix elements list");
list.group("github.com/agent-ix");
list.item("typescript-react-lib", "Cookiecutter template for TypeScript React libraries");
list.item("pg-data-service", "Cookiecutter template for PostgreSQL data services");
list.item("typescript-monorepo");
list.success("3 element type(s) available.");
```

TTY output:
```
 ⊙  [ ix elements list ]
 └──┐

    github.com/agent-ix
    • typescript-react-lib  — Cookiecutter template for TypeScript React libraries
    • pg-data-service  — Cookiecutter template for PostgreSQL data services
    • typescript-monorepo

       └──•  3 element type(s) available.
```

### `note` (multi-line context)

Input:
```ts
const list = startListing("ix local auth reset-admin");
list.note("User:          admin@example.com");
list.note("Temp password: abc123  (expires 2026-04-28T18:42Z)");
list.note("Log in at:     https://app.dev.ix/login");
list.success("Admin password reset.");
```

TTY output:
```
 ⊙  [ ix local auth reset-admin ]
 └──┐
    User:          admin@example.com
    Temp password: abc123  (expires 2026-04-28T18:42Z)
    Log in at:     https://app.dev.ix/login

       └──•  Admin password reset.
```

### `raw` (third-party content with own formatting)

Input:
```ts
const list = startListing("ix local cluster status");
list.commit();
process.stdout.write(table.toString() + "\n");   // cli-table3 ASCII art
list.success("All pods healthy.");
```

TTY output:
```
 ⊙  [ ix local cluster status ]
 └──┐
┌──────────────────┬───────────────┬────────┬─────┐
│ NAME             │ ROLE          │ STATUS │ AGE │
├──────────────────┼───────────────┼────────┼─────┤
│ ix-control-plane │ control-plane │ Ready  │ 2d  │
└──────────────────┴───────────────┴────────┴─────┘

       └──•  All pods healthy.
```

## Constraints

- **FR-014-CON-1**: All indents, glyphs, and color helpers come from FR-016 — no inline literals.
- **FR-014-CON-2**: Body helpers MAY NOT freeze the header or write a tail — only finalizers (FR-015) close the frame.
- **FR-014-CON-3**: Body helpers MAY be called multiple times in any order. The handle does not enforce a content schema.

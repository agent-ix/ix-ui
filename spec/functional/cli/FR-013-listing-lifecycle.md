---
id: FR-013
title: "Listing Lifecycle — startListing, commit, pause"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/non-functional/cli/NFR-002"
    type: "constrained_by"
    cardinality: "N:1"
---

## Statement

The `cli` package SHALL expose `startListing(header: string, opts?): Listing` returning a stateful handle that frames a single command's output with the standard ix orbit header, opener, and tail. The handle SHALL support deferred commit (animated header until first body write or explicit `commit()`) and a `pause` method that yields the cursor to interactive prompts.

## Acceptance Criteria

### Constructor

- **FR-013-AC-1**: `startListing(header)` returns an object implementing the `Listing` interface (body methods `group`/`item`/`note`/`raw`, lifecycle methods `commit`/`pause`, finalizers `success`/`warn`/`error`).
- **FR-013-AC-2**: On TTY, the constructor immediately writes `HIDE_CURSOR` and draws the header in place using `\r{phaseRun(0)}{renderHeader(header)}{CLEAR_EOL}` — no newline, no scrollback noise.
- **FR-013-AC-3**: On TTY, the constructor starts a `setInterval` ticker at the standard redraw interval (NFR-001) that advances the orbit frame and rewrites the header in place.
- **FR-013-AC-4**: On non-TTY (or `opts.isPlain === true`, or `opts.isTTY === false`), the constructor writes a single `⊕  <header>\n` line and starts no ticker.

### commit()

- **FR-013-AC-5**: On TTY, `commit()` is idempotent — only the first call has an effect.
- **FR-013-AC-6**: On TTY, the first `commit()` call: stops the ticker, writes the current frame followed by `\n`, then writes `{ROUTE_INDENT}{CLEAR_EOL}\n`. The header is now in scrollback with a `└──┐` opener line beneath it.
- **FR-013-AC-7**: Body writers (`group`, `item`, `note`, `raw`) call `commit()` before writing, so the opener always appears before any body row.
- **FR-013-AC-8**: On non-TTY, `commit()` is a no-op (the header was already written eagerly at construction).

### pause()

- **FR-013-AC-9**: `pause(fn)` invokes `fn()` and returns its return value (or resolved value if a Promise).
- **FR-013-AC-10**: On TTY before `commit()`: `pause()` stops the ticker, clears the in-place header (`\r{CLEAR_EOL}{SHOW_CURSOR}`), runs `fn()`, then re-draws the header in place and restarts the ticker.
- **FR-013-AC-11**: On TTY after `commit()`: `pause()` writes `SHOW_CURSOR`, runs `fn()`, then writes `HIDE_CURSOR` again. No header redraw is attempted (body content sits between header and cursor — re-animating would require tracking external writes).
- **FR-013-AC-12**: If a finalizer (`success`/`warn`/`error`) was already called, `pause()` does NOT re-arm the ticker after `fn()` returns.

## Rendered Examples

### Pure listing (no commit, terminal `success`)

Input:
```ts
const list = startListing("ix elements list");
await new Promise(r => setTimeout(r, 600));   // header animates
list.success("Done.");
```

TTY output (final frozen state):
```
 ⊙  [ ix elements list ]
 └──┐

       └──•  Done.
```

### Body before terminal call

Input:
```ts
const list = startListing("ix elements list");
list.item("typescript-react-lib", "TypeScript React libraries");
list.success("1 element type(s) available.");
```

TTY output:
```
 ⊙  [ ix elements list ]
 └──┐
    • typescript-react-lib  — TypeScript React libraries

       └──•  1 element type(s) available.
```

### Hybrid command — `commit()` then external listr/clack writes

Input:
```ts
const list = startListing("ix local init");
list.commit();
await listrTasks.run();   // listr renders its own region as body content
list.success("Admin account created.");
```

TTY output (last frame):
```
 ⊙  [ ix local init ]
 └──┐
    ✔ Connecting to identity service
    ✔ Seeding admin account
    ✔ Writing admin-bootstrap Secret

       └──•  Admin account created.
```

### Interactive prompt mid-flow

Input:
```ts
const list = startListing("ix elements tap add");
const url = await list.pause(() => text({ message: "GitHub URL" }));
await addTap(url);
list.success("Tap registered.");
```

TTY: header animates → ticker pauses → clack `text` prompt renders in place → answer captured → header animation resumes → finalizer freezes header and writes tail.

### Non-TTY (CI / piped)

Input: same as the body-before-terminal-call example.

Output:
```
⊕  ix elements list
    • typescript-react-lib  — TypeScript React libraries
✓ 1 element type(s) available.
```

## Constraints

- **FR-013-CON-1**: Per NFR-002, all output flows through `process.stdout.write` — no `console.*` calls.
- **FR-013-CON-2**: All glyphs, indents, and connectors are imported from FR-016 — no inline string literals.
- **FR-013-CON-3**: Repeated finalizer calls after the first are no-ops (idempotent close).

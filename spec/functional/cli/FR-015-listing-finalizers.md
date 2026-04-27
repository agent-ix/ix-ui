---
id: FR-015
title: "Listing Finalizers — success, warn, error"
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

A `Listing` handle SHALL provide three terminal finalizer methods — `success(msg)`, `warn(msg)`, `error(msg)` — that close the frame by freezing the header glyph and emitting a single `└──•` tail line. Calling any finalizer SHALL stop the orbit ticker; subsequent finalizer calls SHALL be no-ops.

## Acceptance Criteria

### Frame freeze

- **FR-015-AC-1**: On the first finalizer call, if the listing has not yet been committed, the helper SHALL: stop the ticker, write the frozen header glyph (`PHASE_PASS` for success/warn, `PHASE_FAIL` for error) followed by `{renderHeader(header)}{CLEAR_EOL}\n`, then write `{ROUTE_INDENT}{CLEAR_EOL}\n`. The header is now committed in scrollback with a frozen glyph.
- **FR-015-AC-2**: If the listing was already committed (via `commit()` or a body write), the finalizer SHALL NOT attempt to walk the cursor up to rewrite the header glyph. The header keeps the last spinner frame from the moment of commit (an arbitrary orbit position; visually acceptable as a frozen glyph).
- **FR-015-AC-3**: After freezing, the finalizer SHALL write a tail line: `\n{ROUTE_OUT}{tail}\n{SHOW_CURSOR}` where `tail` is determined by the variant (below).

### Variant tails (TTY)

- **FR-015-AC-4**: `success(msg)` produces tail `{GLYPH_DONE}  {green(msg)}`.
- **FR-015-AC-5**: `warn(msg)` produces tail `{GLYPH_DONE}  {yellow(msg)}`.
- **FR-015-AC-6**: `error(msg)` produces tail `{GLYPH_FAIL_MARK}  {red(msg)}`.

### Non-TTY equivalents

- **FR-015-AC-7**: On non-TTY, `success(msg)` writes `✓ {msg}\n`. `warn(msg)` writes `! {msg}\n`. `error(msg)` writes `⊗ {msg}\n`. No frame freeze, no `└──•` connector.

### Idempotency

- **FR-015-AC-8**: After any finalizer has been called once, subsequent calls to any finalizer (`success`/`warn`/`error`) SHALL be no-ops — no additional output, no state change.

## Rendered Examples

### success (committed body)

Input:
```ts
const list = startListing("ix elements tap list");
list.item("github.com/agent-ix", "(root)");
list.success("1 tap(s) configured.");
```

TTY output (final frozen state):
```
 ⊙  [ ix elements tap list ]
 └──┐
    • github.com/agent-ix  — (root)

       └──•  1 tap(s) configured.
```

### warn (multiple unhealthy items)

Input:
```ts
const list = startListing("ix local cluster status");
list.commit();
process.stdout.write(podTable.toString() + "\n");
list.warn("3 unhealthy pod(s).");
```

TTY tail:
```
       └──•  3 unhealthy pod(s).      ← yellow
```

### error (early failure, no commit)

Input:
```ts
const list = startListing("ix local auth reset-user");
if (ttlHours < 1 || ttlHours > 24) {
  list.error("--ttl must be between 1 and 24 hours");
  throw new Error("--ttl must be between 1 and 24 hours");
}
```

TTY output:
```
  ⊗  [ ix local auth reset-user ]
 └──┐

       └──•  ⊗  --ttl must be between 1 and 24 hours
```

(Header glyph is the frozen `PHASE_FAIL` red `⊗`; tail uses red.)

### Idempotency

Input:
```ts
const list = startListing("ix elements list");
list.success("first");
list.success("second");   // no-op
list.error("third");      // no-op
```

TTY output: only the `first` tail is emitted. The frame is closed exactly once.

## Constraints

- **FR-015-CON-1**: Per NFR-002, finalizer output flows exclusively through `process.stdout.write`.
- **FR-015-CON-2**: Finalizers MAY NOT throw based on input. An empty `msg` is rendered as an empty tail string (`└──•  ` with no message) — diagnostic, not fatal.
- **FR-015-CON-3**: All glyphs and connectors come from FR-016.

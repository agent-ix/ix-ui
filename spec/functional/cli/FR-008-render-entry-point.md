---
id: FR-008
title: "render() Entry Point — Mount Ink Tree, Resolve on Unmount"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

The `cli` package SHALL expose a single `render(element, opts?)` function as the canonical entry point for command implementations. `render()` mounts an Ink tree, returns a Promise that resolves once the tree unmounts, and handles non-TTY fallback, error capture, and cursor restoration.

## Signature

```tsx
interface RenderOptions {
  plain?: boolean;                // force structured one-line-per-render output
  exitOnCtrlC?: boolean;          // default true — Ctrl-C unmounts and resolves with cancelled
  stdout?: NodeJS.WriteStream;    // default process.stdout (test injection)
  stdin?: NodeJS.ReadStream;      // default process.stdin (test injection)
}

interface RenderResult<T> {
  cancelled: boolean;
  result?: T;                     // set by useRenderResult inside the tree
}

function render<T = void>(
  element: ReactElement,
  opts?: RenderOptions
): Promise<RenderResult<T>>;

// Hook used inside the tree to set the resolution value:
function useRenderResult<T>(): {
  setResult: (value: T) => void;
  exit: () => void;
};
```

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| FR-008-AC-1 | `render(element)` SHALL call Ink's `render()` to mount `element` | Test |
| FR-008-AC-2 | A child component MAY call `useRenderResult().setResult(value)` to attach a value to the eventual resolution | Test |
| FR-008-AC-3 | When the tree unmounts without `setResult` being called, the Promise resolves with `{ cancelled: false, result: undefined }` | Test |
| FR-008-AC-4 | When `exitOnCtrlC !== false` (default), Ctrl-C SHALL unmount the tree and resolve with `{ cancelled: true, result: undefined }` | Test |
| FR-008-AC-5 | Subsequent CLI logic SHALL inspect `result.cancelled` and exit the process appropriately | Test |
| FR-008-AC-6 | When `process.stdout.isTTY === false` OR `opts.plain === true`, Ink SHALL render in non-interactive mode: each render commits a frame to stdout via `\n` and no in-place updates occur | Test |
| FR-008-AC-7 | In plain mode, the final state SHALL be the only frame committed for static UIs (`<Listing>` with `status="passed"` and a tail) — there is no frame-per-tick log spam | Test |
| FR-008-AC-8 | If a component throws during render (synchronously) AND no React error boundary catches it, `render()` SHALL unmount the tree and the Promise SHALL reject with the original error | Test |
| FR-008-AC-9 | If a hook's async work throws (e.g | Test |
| FR-008-AC-10 | On unmount (success, cancel, or error path), the cursor SHALL be visible | Test |
| FR-008-AC-11 | At most one `render()` invocation MAY be active at a time within a process | Test |
| FR-008-AC-12 | When `process.on("SIGTERM")` fires, `render()` SHALL unmount the tree and resolve with `{ cancelled: true }` | Test |

### Mounting and resolution

- **FR-008-AC-1**: `render(element)` SHALL call Ink's `render()` to mount `element`. The returned Promise SHALL resolve when the tree unmounts (either via Ink's `unmount()` or via a child component calling `useRenderResult().exit()`). Before the Promise resolves, the most recently reconciled frame SHALL be flushed to stdout (no buffered final state is dropped).
- **FR-008-AC-2**: A child component MAY call `useRenderResult().setResult(value)` to attach a value to the eventual resolution. The Promise resolves with `{ cancelled: false, result: value }`.
- **FR-008-AC-3**: When the tree unmounts without `setResult` being called, the Promise resolves with `{ cancelled: false, result: undefined }`.

### Cancellation

- **FR-008-AC-4**: When `exitOnCtrlC !== false` (default), Ctrl-C SHALL unmount the tree and resolve with `{ cancelled: true, result: undefined }`. The `render()` Promise still resolves (does not reject).
- **FR-008-AC-5**: Subsequent CLI logic SHALL inspect `result.cancelled` and exit the process appropriately.

### Non-TTY behavior

- **FR-008-AC-6**: When `process.stdout.isTTY === false` OR `opts.plain === true`, Ink SHALL render in non-interactive mode: each render commits a frame to stdout via `\n` and no in-place updates occur. Animations (orbit, braille spinners) SHALL render their static (frozen) frame instead of advancing.
- **FR-008-AC-7**: In plain mode, the final state SHALL be the only frame committed for static UIs (`<Listing>` with `status="passed"` and a tail) — there is no frame-per-tick log spam.

### Error handling

- **FR-008-AC-8**: If a component throws during render (synchronously) AND no React error boundary catches it, `render()` SHALL unmount the tree and the Promise SHALL reject with the original error. Cursor visibility SHALL be restored before rejection.
- **FR-008-AC-9**: If a hook's async work throws (e.g. `useExecaPhase` rejects), the failure SHALL be exposed via the hook's state (e.g. `{ state: "failed", error }`). It SHALL NOT cause `render()` to reject.

### Cursor and terminal hygiene

- **FR-008-AC-10**: On unmount (success, cancel, or error path), the cursor SHALL be visible. Ink's standard cursor management is sufficient; no additional code in `render()` is required to satisfy this AC.

### Concurrency

- **FR-008-AC-11**: At most one `render()` invocation MAY be active at a time within a process. Calling `render()` while a previous tree is still mounted SHALL reject the new call's Promise with `Error("ix-ui-cli render() is already active")`. (Sequential commands re-render after the previous tree resolves; concurrent UIs compose by mounting siblings within a single tree.)
- **FR-008-AC-12**: When `process.on("SIGTERM")` fires, `render()` SHALL unmount the tree and resolve with `{ cancelled: true }`. Hooks performing async work receive abort via the standard Ink `useApp().exit()` propagation.

## Rendered Examples

```tsx
async function runListCommand(): Promise<void> {
  const elements = await loadElements();
  const r = await render(
    <Listing
      header="ix elements list"
      status="passed"
      tail={`${elements.length} element type(s) available.`}
    >
      {elements.map((e) => <Item key={e.name} name={e.name} description={e.description} />)}
    </Listing>
  );
  if (r.cancelled) process.exit(130);
}
```

```tsx
async function runInviteCommand(): Promise<string | null> {
  const r = await render<string>(<InviteFlow />);
  return r.cancelled ? null : (r.result ?? null);
}

const InviteFlow: FC = () => {
  const { setResult, exit } = useRenderResult<string>();
  const [email, setEmail] = useState<string | null>(null);
  return email == null
    ? <TextPrompt message="Email" onSubmit={(r) => r.ok ? setEmail(r.value) : exit()} />
    : <TaskList header="ix local auth invite" tasks={inviteTasks(email, setResult, exit)} />;
};
```

## Constraints

- **FR-008-CON-1**: `render()` is the ONLY public mounting API. Consumers SHALL NOT call Ink's `render()` directly.
- **FR-008-CON-2**: `render()` does NOT call `process.exit`. Exit-code mapping is the consumer's responsibility.
- **FR-008-CON-3**: Per FR-001-AC-3, no direct stdout writes inside `render()` other than what Ink itself produces.


## Dependencies

- **Upstream**: FR-001 (depends_on)

# @agent-ix/ix-ui-cli

> Terminal UI components for the Agent IX CLI ecosystem.

## What this is

`@agent-ix/ix-ui-cli` is a terminal/CLI UI component library for the
[Agent IX](https://github.com/agent-ix) ecosystem. It is built on
[Ink](https://github.com/vadimdemedes/ink) (React for the terminal) and ships a
set of opinionated components — framed listings, animated progress tables, task
runners, and interactive prompts — plus the design tokens (glyphs, colors,
indents) and async hooks used to build them.

It is paired with
[`@agent-ix/ix-ui-semantic`](https://github.com/agent-ix/ix-ui) for shared
state types (`PhaseState`, `OrbitFrame`, `OrbitTone`) and glyph/spinner data,
keeping presentation-agnostic semantics in one place and the Ink rendering layer
here.

## Install

This package is published to **GitHub Packages** under the `@agent-ix` scope
(not the public npm registry). Point the `@agent-ix` scope at GitHub Packages
and provide a token with `read:packages`.

Create an `.npmrc` (in your project or `~/.npmrc`):

```ini
@agent-ix:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```bash
npm install @agent-ix/ix-ui-cli
```

`react` and `ink` are runtime dependencies and are installed automatically.

## Usage

The `render()` helper mounts an Ink tree and returns a promise that resolves
when the tree unmounts, handling `SIGTERM`, Ctrl-C, and `EPIPE` for you.

### Rendering a component

```tsx
import { render, Listing, Item, Note } from "@agent-ix/ix-ui-cli";

await render(
  <Listing header="Deploying · cluster" status="passed">
    <Item>api-gateway</Item>
    <Item>worker-pool</Item>
    <Note>3 services reconciled</Note>
  </Listing>,
);
```

For a static, non-interactive final-state view that paints once and exits, use
`renderStatic()`:

```tsx
import { renderStatic, Listing, Item } from "@agent-ix/ix-ui-cli";

await renderStatic(
  <Listing header="Status" status="passed">
    <Item>everything is up</Item>
  </Listing>,
);
```

### Running tasks with progress

```tsx
import { render, TaskList } from "@agent-ix/ix-ui-cli";

await render(
  <TaskList
    header="Building"
    tasks={[
      {
        title: "compile",
        task: async ({ setStatus }) => {
          setStatus("running tsc…");
          await build();
        },
      },
      { title: "bundle", task: async () => bundle() },
    ]}
    onComplete={(r) => console.log(`${r.passed} passed in ${r.durationMs}ms`)}
  />,
);
```

### Interactive prompts

Prompts report their answer through `onSubmit`. Combine with `render()` and
`useRenderResult()` to resolve a value from the mounted tree:

```tsx
import { render, ConfirmPrompt, useRenderResult } from "@agent-ix/ix-ui-cli";

function Confirm() {
  const { setResult, exit } = useRenderResult<boolean>();
  return (
    <ConfirmPrompt
      message="Apply changes?"
      onSubmit={(r) => {
        if (!r.cancelled) setResult(r.value);
        exit();
      }}
    />
  );
}

const { result, cancelled } = await render<boolean>(<Confirm />);
```

### Style tokens

Glyphs, color helpers, and layout constants are exported for building custom
views consistent with the IX design system:

```ts
import { colors, blue, GLYPH_DONE, renderHeader } from "@agent-ix/ix-ui-cli";

console.log(renderHeader("build · ok"));
console.log(`${GLYPH_DONE} ${colors.green("done")}`);
```

## Exports

### Components

| Export | Description |
| --- | --- |
| `Frame` | Base header/body/tail frame with `running` / `passed` / `failed` status. |
| `HeaderSpinner` | Animated orbit-glyph spinner used as a running-frame indicator. |
| `Listing` | Frame for static listings, status views, and mixed flows. |
| `FlowLine`, `Group`, `Item`, `Info`, `Note` | Row/section primitives for composing `Listing` bodies. |
| `PhaseTable` | Multi-phase service progress table with per-row state and elapsed time. |
| `TaskList` | Sequential or concurrent task runner with live status, logs, and a result summary. |
| `TextPrompt` | Single-line text input prompt with optional validation. |
| `PasswordPrompt` | Masked text input prompt. |
| `ConfirmPrompt` | Yes/no confirmation prompt. |
| `SelectPrompt` | Single-choice selection prompt. |
| `MultiSelectPrompt` | Multiple-choice selection prompt. |

### Hooks

| Export | Description |
| --- | --- |
| `useInterval` | Fire a callback every `delay` ms while mounted; pass `null` to pause. |
| `useExecaPhase` | Run a command via `execa` and report its phase state; SIGTERM/SIGKILL on unmount. |
| `useKubectlRollout` | Poll a kubectl rollout and report ready/total pod counts. |
| `useHelmHookWatcher` | Watch Helm hook jobs and report per-job phase. |
| `useRenderResult` | Set the resolved value and exit from inside a `render()`-mounted tree. |

### Render & utilities

| Export | Description |
| --- | --- |
| `render` | Mount an Ink tree; resolves `{ cancelled, result }` on unmount. |
| `renderStatic` | Render a final-state tree once and exit after the first paint. |
| `colors`, `blue` | Picocolors-based color helpers and the IX accent color. |
| `renderHeader`, `colorOrbitFrame`, `colorPods` | Header/orbit/pod-status string colorizers. |
| `GLYPH_*`, `PHASE_PASS`, `PHASE_FAIL`, `ORBIT_SPINNER`, `orbitFrameGlyphs` | Glyph and spinner tokens. |
| `PLANET_COL`, `ROW_INDENT`, `NOTE_INDENT`, `ERROR_INDENT`, `FLOW_INDENT`, `ROUTE_INDENT`, `ROUTE_URL`, `PHASE_WIDTH`, `HEADER_TICK_DIV` | Layout / indent constants. |

Ink's `Box` and `Text`, and React's `useState` / `useEffect`, are re-exported
for convenience so consumers can do ad-hoc layout without adding `ink` or
`react` as direct dependencies.

## Development

This package lives in the [`ix-ui`](https://github.com/agent-ix/ix-ui) pnpm
workspace monorepo and is built with [Vite](https://vitejs.dev/). From the repo
root:

```bash
make build   # build all packages
make test    # run tests (vitest)
make lint    # eslint + prettier check
```

## License

MIT — see [LICENSE](./LICENSE).

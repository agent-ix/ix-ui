# @agent-ix/ix-ui-semantic

Platform-agnostic state types and glyph vocabulary for the Agent IX design system.

## What this is

`@agent-ix/ix-ui-semantic` is the shared, render-agnostic vocabulary for the
Agent IX design system. It defines the semantic state types (phase states),
the glyph map those states resolve to, and the spinner/animation definitions —
but it does **not** render anything itself.

Both the terminal renderer
([`@agent-ix/ix-ui-cli`](https://github.com/agent-ix/ix-ui)) and web renderers
consume this package so they share one semantic model: a `running` phase means
the same thing everywhere, and each renderer maps the abstract glyph to a
concrete symbol/color for its target. This is a dependency-free leaf package
with **zero runtime dependencies**.

## Install

Published to GitHub Packages under the `@agent-ix` scope. Point the `@agent-ix`
scope at the GitHub Packages registry in an `.npmrc`:

```ini
@agent-ix:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```bash
npm install @agent-ix/ix-ui-semantic
```

## Usage

Import a state type and look up its glyph:

```ts
import {
  PHASE_GLYPHS,
  type PhaseState,
  type PhaseGlyph,
} from "@agent-ix/ix-ui-semantic";

const state: PhaseState = "running";
const glyph: PhaseGlyph = PHASE_GLYPHS[state];

// Pick the right symbol for your renderer:
const symbol = supportsTty ? glyph.tty : glyph.nonTty; // "⟳" or "running"
if (glyph.animated) {
  // drive a spinner while this phase is active
}
```

Compact status dots:

```ts
import { STATUS_DOTS } from "@agent-ix/ix-ui-semantic";

STATUS_DOTS.done; // "•"
STATUS_DOTS.failed; // "○"
STATUS_DOTS.pending; // "·"
```

Spinners — cycle frames at your own interval:

```ts
import { BRAILLE_SPINNER, HEADER_SPINNER } from "@agent-ix/ix-ui-semantic";

const frame = BRAILLE_SPINNER[tick % BRAILLE_SPINNER.length];
```

The orbit spinner carries per-cell tone information so renderers can color each
glyph by depth. Use `orbitFrameGlyphs` to flatten a frame to a plain string for
logs and tests:

```ts
import {
  ORBIT_SPINNER,
  orbitFrameGlyphs,
  type OrbitFrame,
  type OrbitCell,
  type OrbitTone,
} from "@agent-ix/ix-ui-semantic";

const frame: OrbitFrame = ORBIT_SPINNER[tick % ORBIT_SPINNER.length];
orbitFrameGlyphs(frame); // e.g. "⋅⊙∘"
```

## Exports

### Types

| Export | Description |
| --- | --- |
| `PhaseState` | Union of phase states: `"pending" \| "queued" \| "running" \| "done" \| "failed"`. |
| `PhaseGlyph` | Glyph descriptor: `{ tty: string; nonTty: string; animated: boolean }`. |
| `OrbitTone` | Depth/brightness tone for an orbit cell: `"gray" \| "dim" \| "medDim" \| "med" \| "bright"`. |
| `OrbitCell` | A single orbit-spinner cell: `" "` (blank) or `{ glyph: string; tone: OrbitTone }`. |
| `OrbitFrame` | One frame of the orbit spinner: an array of `OrbitCell`. |

### Glyphs

| Export | Description |
| --- | --- |
| `PHASE_GLYPHS` | `Record<PhaseState, PhaseGlyph>` mapping each phase state to its tty/non-tty glyph and animated flag. |
| `STATUS_DOTS` | Compact status dot symbols for `done` (`•`), `failed` (`○`), and `pending` (`·`). |

### Spinners

| Export | Description |
| --- | --- |
| `BRAILLE_SPINNER` | 10-frame braille spinner (`string[]`). |
| `HEADER_SPINNER` | 4-frame header spinner (`string[]`). |
| `ORBIT_SPINNER` | 10-frame orbit spinner (`OrbitFrame[]`), each cell carrying glyph + tone. |
| `orbitFrameGlyphs` | Flattens an `OrbitFrame` to a plain glyph string — useful for tests and logs. |

## Development

Part of the [`ix-ui`](https://github.com/agent-ix/ix-ui) pnpm monorepo. From the
repository root:

```bash
make build   # build all packages
make test    # test all packages
make lint    # eslint + prettier check
```

## License

MIT — see [LICENSE](./LICENSE).

# @agent-ix/ix-ui

> Design system for Agent IX — terminal-first UI components plus the shared, render-agnostic semantic vocabulary behind them.

`ix-ui` is a pnpm-workspace monorepo that ships the **terminal** side of the Agent IX
design system. It is split so that the *meaning* of UI state lives in one
dependency-free package and the *terminal rendering* of that state lives in another:

| Package | What it is |
|---------|------------|
| [`@agent-ix/ix-ui-semantic`](./packages/semantic) | Platform-agnostic state types, glyph vocabulary, and spinner definitions. Zero runtime dependencies. The shared model that terminal **and** web renderers map to concrete symbols/colors. |
| [`@agent-ix/ix-ui-cli`](./packages/cli) | Terminal UI components (built on Ink/React) for the Agent IX CLI ecosystem — frames, listings, phase tables, prompts, and status hooks. Consumes `ix-ui-semantic`. |

For the web/React design system (oklch tokens, shadcn, Storybook), see
[`ix-themes`](https://github.com/agent-ix/ix-themes) — `ix-ui` is terminal-only.

## Install

Both packages publish to GitHub Packages under the `@agent-ix` scope. Point the
scope at GitHub Packages in `.npmrc`:

```
@agent-ix:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @agent-ix/ix-ui-cli @agent-ix/ix-ui-semantic
```

See each package's README for usage and the full export list.

## Development

pnpm workspace monorepo — commands run recursively across packages from the repo root:

```bash
make install        # install all workspace dependencies
make build          # build all packages (Vite)
make test           # test all packages
make lint           # eslint + prettier check
make format         # prettier format
```

```
packages/    # publishable libraries (semantic, cli)
scripts/     # build tooling
```

## License

MIT — see [LICENSE](./LICENSE).

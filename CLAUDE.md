# ix-ui

pnpm workspace monorepo. All commands run recursively across packages unless noted.

## Commands

```bash
make build                      # build all packages
make test                       # test all packages
make lint                       # eslint + prettier check all packages
make format                     # prettier format all packages
make install                    # install all workspace dependencies
make update-lock                # update pnpm-lock.yaml
make version                    # show computed version
make info                       # show git info
make use-local p=<pkg>          # switch dep to local npm.ix
make use-upstream p=<pkg>       # switch dep back to upstream
```

## Structure

```
packages/    # publishable libraries
apps/        # executable apps (e.g. CLI binaries)
scripts/     # build tooling (build-tools.js, help.js)
```

Each package under `packages/` and `apps/` has its own `package.json`, `tsconfig.json`, and `vite.config.ts`.
Extend the root `tsconfig.json` in each package: `"extends": "../../tsconfig.json"`.

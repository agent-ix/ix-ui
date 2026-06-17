---
id: FR-007
title: "Zero Runtime Dependencies"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/stakeholder/StR-002"
    type: "implements"
    cardinality: "1:1"
---

## Description

`@agent-ix/ix-ui-semantic` SHALL have no runtime dependencies. The package MUST be importable in any JavaScript/TypeScript environment — Node.js CLI, Deno, browser, Next.js server component — without bundler warnings, polyfill requirements, or transitive package installation.

## Constraints

- **FR-007-CON-1**: The `dependencies` field in `package.json` SHALL be absent or an empty object. `devDependencies` are not constrained by this requirement.
- **FR-007-CON-2**: The package SHALL NOT import from `node:*`, `process`, `Buffer`, or any browser global at module load time.

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| FR-007-AC-1 | `@agent-ix/ix-ui-semantic/package.json` has no `dependencies` key, or `dependencies` is `{}` | Test |
| FR-007-AC-2 | The built `dist/index.js` contains no `require()` calls and no `import` of any external module identifier | Test |
| FR-007-AC-3 | Running `node -e "import('@agent-ix/ix-ui-semantic')"` in a clean Node environment completes without error | Test |

- **FR-007-AC-1**: `@agent-ix/ix-ui-semantic/package.json` has no `dependencies` key, or `dependencies` is `{}`.
- **FR-007-AC-2**: The built `dist/index.js` contains no `require()` calls and no `import` of any external module identifier.
- **FR-007-AC-3**: Running `node -e "import('@agent-ix/ix-ui-semantic')"` in a clean Node environment completes without error.


## Dependencies

- **Upstream**: [StR-002](../../stakeholder/StR-002-zero-dep-semantic-vocabulary.md) (implements)

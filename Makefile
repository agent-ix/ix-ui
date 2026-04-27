# =============================================================================
# ix-ui Makefile
# =============================================================================

# =============================================================================
# Core Development
# =============================================================================

.PHONY: build
build:
	pnpm run build

.PHONY: test
test:
	pnpm run test

.PHONY: test-json
test-json:
	pnpm run test:json

.PHONY: lint
lint:
	pnpm run lint

.PHONY: format
format:
	pnpm run format

.PHONY: format-check
format-check:
	pnpm run format:check

.PHONY: clean
clean:
	pnpm run clean

# =============================================================================
# Package Management
# =============================================================================

.PHONY: install
install:
	pnpm install

.PHONY: update-lock
update-lock:
	pnpm install --lockfile-only

.PHONY: use-local
use-local:
	@echo "Switching $(p) to local..."
	pnpm run pkg:use-local $(p)

.PHONY: use-upstream
use-upstream:
	@echo "Switching $(p) to upstream..."
	pnpm run pkg:use-upstream $(p)

.PHONY: refresh-local
refresh-local:
	pnpm run pkg:refresh-local

# =============================================================================
# Publish (local npm.ix)
# =============================================================================
# `make publish` publishes every workspace package to the local npm.ix registry
# configured in .npmrc. Version is derived from git (tag + commit + dirty hash)
# via scripts/build-tools.js so dev cycles don't require tag pushes. Original
# package.json versions are restored after publish.

.PHONY: publish
publish: build
	@VERSION=$$(node scripts/build-tools.js version | sed 's/^v//'); \
	echo "Publishing @ $$VERSION to npm.ix"; \
	for pkg in packages/*/package.json; do \
	  ORIG=$$(node -p "require('./$$pkg').version"); \
	  echo "$$pkg: $$ORIG -> $$VERSION"; \
	  (cd $$(dirname $$pkg) && npm pkg set version=$$VERSION); \
	done; \
	pnpm -r --filter './packages/*' publish --no-git-checks --registry http://npm.ix/ --tag local; \
	for pkg in packages/*/package.json; do \
	  (cd $$(dirname $$pkg) && git checkout -- package.json); \
	done

# =============================================================================
# Versioning & Info
# =============================================================================

.PHONY: version
version:
	@pnpm run version

.PHONY: info
info:
	@pnpm run info

# =============================================================================
# Help
# =============================================================================

.PHONY: help
help:
	@echo "ix-ui — pnpm workspace monorepo"
	@echo ""
	@echo "  make build       build all packages (pnpm -r)"
	@echo "  make test        test all packages (pnpm -r)"
	@echo "  make lint        lint all packages (pnpm -r)"
	@echo "  make format      format all packages (pnpm -r)"
	@echo "  make install     install all workspace dependencies"
	@echo "  make version     show computed version"
	@echo "  make info        show git info"
	@echo "  make publish     publish all packages to local npm.ix"

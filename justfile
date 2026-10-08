# Tomet Website development tasks.

default:
    @just --list

# Start Astro dev server.
dev:
    npm run dev

# Build the production site.
build:
    npm run build

# Run Astro check.
check:
    npm run check

# Generate and update all derived documentation across the workspace.
docs:
    tomet export .
    tomet format -i .

# Check that all documents parse, format cleanly, and match export targets.
docs-check:
    tomet check .
    tomet format --check .
    tomet export --check .
    @if [ -f .writ.tmt ] && command -v twrit >/dev/null 2>&1; then \
        twrit check .; \
    fi

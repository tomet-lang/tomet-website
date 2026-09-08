# tomet-website

The Tomet documentation site. Astro renders the pages; every `.tmt` body on
it is produced by the `tomet` CLI at build time.

## How it works

`src/content.config.ts` defines the documentation content collection using
`tometLoader` from `@tomet/astro`. It loads `.tmt` documents and renders
them in-process using `@tomet/tomet-wasm` (backed directly by `tomet-convert-html`).
There is no JavaScript-side `.tmt` parser here on purpose: `tomet-convert-html`
is the source of truth, and a second implementation would drift from it.

Astro 5's Content Layer caching (`digest`) ensures that only modified documents
are re-rendered on incremental builds, easily scaling to tens of thousands of files.

## Running it

```bash
# once, in ../tomet
cargo build --release --bin tomet

# here
npm install
npm run dev      # or: npm run build && npm run preview
```

Or `nix develop` / `direnv allow`, which brings its own `tomet` — see
[Nix](#nix) below for that and for the `TOMET_REPO` / `TOMET_BIN`
overrides.

## What is published

`docs/guide`, `docs/spec`, `docs/examples` and `docs/why`, plus
`docs/README.tmt` as the section landing page.

`docs/design/` is deliberately excluded: per `docs/.writ.tmt` it is internal
design thinking, written in whichever language the thinking happened in, and
it is not addressed to readers of this site. Empty placeholder `.tmt` files
are skipped too — they are a table of contents for writing that has not
happened yet.

A document whose HTML body comes out empty is treated as data rather than
prose: `@meta`, `@config` and `@version` are directives that render nothing
visible, so a document made only of those is valid and interesting but has
no body. Those pages show their `.tmt` source instead, with a note saying
why. `docs/examples/config.tmt` is the example.

## Nix

Same shape as `tomet` and `tomet-writ`: `flake.nix` delegating to `nix/`,
with `dev.nix` and `formatter.nix` beside a flake-parts `default.nix`.

```bash
nix develop          # node + a tomet on PATH (direnv does this)
nix fmt
```

There is no package output. The site is a `dist/` that someone serves, not
something anyone installs, so `npm run build` is the build and Nix only
supplies the tools.

The `tomet` input is here for the two things that do need a binary: the
renderer in the shell, and `tomet format` for the `.tmt` files in this
repo. `src/lib/docs.ts` still prefers a working copy's
`../tomet/target/release/tomet` over the pinned one, so changing the
language and reloading the site stay a single loop. `TOMET_REPO` and
`TOMET_BIN` override both.

One wrinkle worth knowing: the pinned `tomet` will not have `--body` until
that change is committed and pushed, so a fresh clone with no working-copy
build cannot render pages yet. A `cargo build --release --bin tomet` in
`../tomet` is the way through until then.

## Known gaps

Things this site ran into that live in the `tomet` repo, not here.

1. **`tomet html --body` is new.** It was added for this site: the CLI could
   only emit a standalone page via `render_page_with`, which fights any
   layout. The flag routes to the already-existing `render_body_with`.
   `apps/cli/src/cli.rs`, `apps/cli/src/commands/html.rs`.

2. **`DEFAULT_STYLE` is dead.** Every selector in
   `crates/tomet-convert-html/src/lib.rs`'s `DEFAULT_STYLE` uses a `tmt-`
   prefix, but the renderer emits `tm-` (`tm-element`, `tm-callout`,
   `tm-heading-number`, …). So `tomet html` without `--body` produces a page
   whose stylesheet matches nothing it renders. This site writes its own CSS
   against the real `tm-` classes — `src/styles/global.css` could be
   upstreamed as a fixed `DEFAULT_STYLE`.

3. **No document title from the CLI.** `meta_title` is private to the CLI
   crate, so the site takes each page's title from the first rendered `<h1>`
   instead of from `@meta{title}`. A `tomet meta` subcommand, or JSON output
   carrying the document's meta, would fix this properly.

4. **`<T>` angle-sigil elements do not parse.** The root `README.md`
   advertises `<T>(args)[content]{value}` as the unified element syntax and
   `apps/web/frontend/src/presets.ts` uses `<callout>(type: info)[…]`, but
   the current build renders both as literal text; `@callout(type: note)[…]`
   works. This is presumably mid-migration — see the in-flight
   `.agents/tasks/sigil-shape-axis-and-namespaces.md`.

5. **`docs/examples/bookmark.tmt` collapses.** It renders as one long
   paragraph with the `｛…｝` value blocks and `+++` raw areas left as
   literal text, rather than as structured elements.

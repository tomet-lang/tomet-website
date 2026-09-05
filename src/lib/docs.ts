/**
 * Build-time bridge to the `tomet` CLI.
 *
 * Every page body on this site is produced by `tomet html --body`, which
 * runs the same Rust renderer (`tomet-convert-html`) the CLI and the LSP
 * preview use. There is deliberately no second, JavaScript-side rendering
 * of `.tmt` here: the Rust converter is the source of truth, and a
 * reimplementation would drift from it.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * The site checkout. Anchored on the working directory rather than
 * `import.meta.url`: this module is bundled into `dist/chunks/` for the
 * render pass, so a path relative to the module would move out from under
 * us between `getStaticPaths` and rendering.
 */
export const siteRoot = process.cwd();

/** The `tomet` checkout supplying both the CLI and the documents. */
export const repoRoot = process.env.TOMET_REPO
  ? resolve(process.env.TOMET_REPO)
  : resolve(siteRoot, '..', 'tomet');

const docsRoot = join(repoRoot, 'docs');

/**
 * The `tomet` binary, in order of preference:
 *
 *   1. `$TOMET_BIN`, for pointing at a specific build by hand.
 *   2. `$TOMET_REPO/target/release/tomet`, so that working on the language
 *      and working on the site are the same loop -- `cargo build` and
 *      reload.
 *   3. `tomet` on `PATH`, which is what the dev shell puts there.
 */
const tometBin = process.env.TOMET_BIN
  ? resolve(process.env.TOMET_BIN)
  : existsSync(join(repoRoot, 'target', 'release', 'tomet'))
    ? join(repoRoot, 'target', 'release', 'tomet')
    : 'tomet';

/**
 * Which `docs/` subtrees are published, in nav order.
 *
 * `docs/design/` is intentionally absent: per the repo's `docs/.writ.tmt`
 * it is internal design thinking, in whichever language the thinking
 * happened in, and it is not addressed to readers of this site.
 */
export const SECTIONS = [
  { dir: 'guide', label: 'ガイド', blurb: '書き方を順に追う' },
  { dir: 'spec', label: '仕様', blurb: '文法と組み込み要素の定義' },
  { dir: 'examples', label: '実例', blurb: '実際の .tmt 文書' },
  { dir: 'why', label: '設計の理由', blurb: 'なぜこの形なのか' },
] as const;

export interface DocEntry {
  /** Route slug, e.g. `guide/builtins/args`. */
  slug: string;
  /** Absolute path to the `.tmt` source. */
  file: string;
  /** `docs/`-relative path, shown as the "edit this page" target. */
  sourcePath: string;
  section: string;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    // `.writ.tmt` files are the repo's own rules, inherited downward like
    // `.gitignore`. They are addressed to contributors, not readers.
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    // Several `docs/guide/builtins/` entries are still empty placeholder
    // files. They are a table of contents for writing that has not
    // happened yet, not pages, so they stay off the site.
    else if (name.endsWith('.tmt') && stat.size > 0) out.push(full);
  }
  return out;
}

/** Every published document, in nav order. */
export function listDocs(): DocEntry[] {
  const docs: DocEntry[] = [];
  for (const section of SECTIONS) {
    for (const file of walk(join(docsRoot, section.dir))) {
      const rel = file.slice(docsRoot.length + 1).split(/[\\/]/).join('/');
      docs.push({
        // Only the trailing `.tmt` comes off: `image.meta.tmt` is the
        // document `image.meta`, not `image`.
        slug: rel.replace(/\.tmt$/, ''),
        file,
        sourcePath: `docs/${rel}`,
        section: section.dir,
      });
    }
  }
  return docs;
}

export interface RenderOptions {
  /**
   * `tomet html --advanced`: number the headings and give each one a
   * slugged `id`. Documentation pages want both -- the ids are what the
   * on-page table of contents links to -- but a short sample shown as a
   * demo reads better unnumbered.
   */
  advanced?: boolean;
}

/** Render one `.tmt` file to an HTML body fragment. */
export function renderDoc(file: string, options: RenderOptions = {}): string {
  const { advanced = true } = options;
  const args = ['html', '--body', ...(advanced ? ['--advanced'] : []), file];
  try {
    return execFileSync(tometBin, args, {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (cause) {
    // `--body` is newer than the rest of the CLI, so an old binary fails
    // here with an "unexpected argument" rather than anything about the
    // document -- worth saying out loud, since the message is otherwise
    // easy to read as a problem with the `.tmt` file.
    throw new Error(
      `\`tomet html --body\` failed for ${file}.\n` +
        `Using: ${tometBin}\n` +
        `Build it with \`cargo build --release --bin tomet\` in ${repoRoot}, ` +
        `set TOMET_BIN to a binary that has \`--body\`, or enter the dev shell.`,
      { cause },
    );
  }
}

const TAGS = /<[^>]+>/g;
const HEADING_NUMBER = /<span class="tm-heading-number">[^<]*<\/span>/;

/**
 * The document's title.
 *
 * Taken from the first heading in the rendered body. The `@meta{title}`
 * the CLI itself prefers is not reachable from the command line yet --
 * `meta_title` is private to the CLI crate -- so the heading is the best
 * available source. See the README's "Known gaps".
 */
export function docTitle(html: string, fallback: string): string {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  if (!match) return fallback;
  const text = match[1].replace(HEADING_NUMBER, '').replace(TAGS, '').trim();
  return text || fallback;
}

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

/** Second- and third-level headings, for the in-page table of contents. */
export function docToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(HEADING_NUMBER, '').replace(TAGS, '').trim();
    if (text) items.push({ id: m[2], level: Number(m[1]), text });
  }
  return items;
}

/** The raw `.tmt` source, for documents with no rendered prose. */
export function readDocSource(file: string): string {
  return readFileSync(file, 'utf8');
}

/**
 * True when the document is data rather than prose.
 *
 * `@meta`, `@config`, `@version` and friends are directives: they carry
 * structure, and `tomet-convert-html` deliberately renders nothing visible
 * for them. A document made only of those -- `docs/examples/config.tmt`,
 * say -- therefore has an empty HTML body while being a perfectly valid,
 * and interesting, document. Those pages show their source instead.
 */
export function isDataOnly(html: string): boolean {
  return html.trim() === '';
}

// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // The docs live in the sibling `tomet` repo and are rendered by the
  // `tomet` CLI at build time (see `src/lib/docs.ts`). Nothing here is
  // parsed by a JS Markdown pipeline, so there is no markdown config.
  markdown: {},
});

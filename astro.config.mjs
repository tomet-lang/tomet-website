// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // The docs live in the sibling `tomet` repo and are loaded by
  // `@tomet/astro` in `src/content.config.ts`. Nothing here is parsed
  // by a JS Markdown pipeline, so there is no markdown config.
  markdown: {},
});

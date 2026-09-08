import { defineCollection } from 'astro:content';
import { tometLoader } from '@tomet/astro';
import { resolve } from 'node:path';

const repoRoot = process.env.TOMET_REPO
  ? resolve(process.env.TOMET_REPO)
  : resolve(process.cwd(), '..', 'tomet');

const allowedSections = ['guide', 'spec', 'examples', 'why'];

export const collections = {
  docs: defineCollection({
    loader: tometLoader({
      base: resolve(repoRoot, 'docs'),
      advanced: true,
      filter: (relPath) => {
        if (relPath === 'README.tmt' || relPath === 'README.tm') return true;
        const parts = relPath.split('/');
        return allowedSections.includes(parts[0]);
      },
    }),
  }),
  samples: defineCollection({
    loader: tometLoader({
      base: resolve(process.cwd(), 'src', 'samples'),
      advanced: false,
    }),
  }),
};

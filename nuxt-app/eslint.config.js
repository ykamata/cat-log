// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// Replicate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname, // Base directory for resolving relative paths in legacy configs
  resolvePluginsRelativeTo: __dirname, // Resolve plugins relative to this directory
});

export default [
  // Base configurations from @nuxtjs/eslint-config-typescript and prettier (via FlatCompat)
  // These will be applied first.
  ...compat.extends('@nuxtjs/eslint-config-typescript', 'prettier'),

  // Prettier plugin and recommended config (this is already a flat config)
  // This should come after the base configs to ensure its rules take precedence if there are overlaps,
  // especially for any rules that might be turned off by prettier but enabled by the base config.
  eslintPluginPrettierRecommended,

  // Global settings including file scope and specific rules.
  // This object applies to all files matched by the glob.
  // Rules here will override rules from the extended configs if there are conflicts.
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'prettier/prettier': 'error', // Reports Prettier discrepancies as ESLint errors
      // Any other global rule overrides can go here.
    },
  },
];

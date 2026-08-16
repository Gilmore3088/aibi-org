// Flat ESLint config for ESLint 9 and eslint-config-next 15. Next 15 still
// publishes eslintrc-style configs, so FlatCompat bridges those into the flat
// config consumed by the repository's `eslint src` command.

import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const baseDirectory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory });

const eslintConfig = [
  // Build output / generated files ESLint should never scan. Flat config
  // only ignores node_modules + .git by default, so .next et al. are listed
  // explicitly (next lint scoped these for us under the old eslintrc).
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default eslintConfig;

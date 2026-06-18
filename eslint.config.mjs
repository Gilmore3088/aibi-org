// Flat ESLint config (ESLint 9 / eslint-config-next 16).
//
// Replaces the legacy .eslintrc.json. eslint-config-next 16 ships native
// flat-config arrays (one per entry point), so we spread them directly
// rather than bridging eslintrc-style `extends` through FlatCompat — the
// shared configs are now flat and FlatCompat can't serialize them. This
// mirrors the old `extends: [next/core-web-vitals, next/typescript]`. The
// lone custom rule (underscore-prefixed unused vars are intentional) is
// preserved verbatim from the old .eslintrc.json.

import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const eslintConfig = [
  // Build output / generated files ESLint should never scan. Flat config
  // only ignores node_modules + .git by default, so .next et al. are listed
  // explicitly (next lint scoped these for us under the old eslintrc).
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts'],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // react-hooks 7 (pulled in by eslint-config-next 16) ships the new
      // "React Compiler" rule set. eslint-config-next 15 never enforced
      // these, so turning them on here would bundle a ~30-site refactor into
      // a tooling bump. Keep lint policy stable for now and disable them; the
      // classic rules-of-hooks / exhaustive-deps checks stay active. Adopting
      // the React Compiler rules is a deliberate follow-up, not a dep bump.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
];

export default eslintConfig;

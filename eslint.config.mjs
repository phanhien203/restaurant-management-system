// Single flat config for the whole monorepo; each workspace runs `eslint .` against it.
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const WEB = 'apps/web/**';

// eslint-config-next 15 ships eslintrc-style configs. Scope them to apps/web: configs that already have
// `files` get them intersected (nested array = AND) with the web glob.
const nextConfigs = compat.extends('next/core-web-vitals').map((config) => ({
  ...config,
  files: config.files ? config.files.map((f) => [WEB, ...(Array.isArray(f) ? f : [f])]) : [WEB],
}));

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/next-env.d.ts',
    ],
  },
  ...nextConfigs,
  {
    files: [WEB],
    // App Router only: this rule checks links into a pages/ directory, which we do not have.
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // CLAUDE.md: no @ts-ignore / @ts-expect-error without a comment explaining why.
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    // Plain JS config files are not part of any tsconfig project.
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  // Last: turn off stylistic rules that Prettier owns.
  prettier,
);

// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Goals:
 * - Keep essential correctness rules.
 * - Declare browser + node globals so URLSearchParams, document, process, Request, etc. aren't "no-undef".
 * - Turn off noisy style rules (import/order, tailwind classnames order) for now.
 * - Zero warnings policy: anything we keep should be "error" or "off".
 * - Add react-hooks plugin to avoid "rule not found" messages and enforce basic hooks correctness.
 */
export default tseslint.config(
  // ---- Ignores (flat-config replacement for .eslintignore) ----
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'coverage/**',
      // Common additional generated/build artifacts:
      'out/**',
      'build/**',
      'public/**',
      '.vercel/**',
      '.turbo/**',
      // Add any repo-specific generated paths here if needed.
    ],
  },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        URLSearchParams: 'readonly',
        KeyboardEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        Request: 'readonly',
        queueMicrotask: 'readonly',
        console: 'readonly',
        document: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      tailwindcss: tailwind,
      'react-hooks': reactHooks,
    },

    rules: {
      // Base JS recommendations
      ...js.configs.recommended.rules,

      // TypeScript recommendations (non type-checked set)
      ...tseslint.configs.recommended.rules,

      // Tighten correctness; keep these as "error"
      'no-unused-vars': 'off', // use TS variant
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      // Keep exhaustive-deps off for now to avoid churn; enable later if desired.
      'react-hooks/exhaustive-deps': 'off',

      // Temporarily disable noisy style rules
      'import/order': 'off',
      'tailwindcss/classnames-order': 'off',

      // Preference rules deferred for now (Phase 0++ can revisit)
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/array-type': 'off',
      'import/no-duplicates': 'off',
    },
  },
);

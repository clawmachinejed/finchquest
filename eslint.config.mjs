// eslint.config.mjs — Windows-safe tsconfigRootDir
import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import tailwind from "eslint-plugin-tailwindcss";

export default [
  { ignores: ["node_modules/**", ".next/**", "dist/**", "coverage/**", ".vercel/**", "public/**", "tools/**", "**/*.d.ts", "**/*.config.*"] },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        // ✅ Use CWD so ESLint doesn’t build a malformed path like C:\C:\...
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      tailwindcss: tailwind,
    },
    settings: { "import/resolver": { typescript: { project: "./tsconfig.json" } } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "import/order": ["warn", { "newlines-between": "always", groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]], pathGroups: [{ pattern: "@/**", group: "internal", position: "after" }], pathGroupsExcludedImportTypes: ["builtin"], alphabetize: { order: "asc", caseInsensitive: true } }],
      "tailwindcss/classnames-order": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-require-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

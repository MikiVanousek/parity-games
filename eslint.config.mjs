import globals from "globals";
import eslint from '@eslint/js';
import tseslint from "typescript-eslint";
import html from "@html-eslint/eslint-plugin";
import parser from "@html-eslint/parser";

export default tseslint.config(
  html.configs["flat/recommended"],
  { languageOptions: { globals: globals.browser } },
  // ...compat.extends("standard-with-typescript"),
  {
    files: ["**/*.html"],
    plugins: {
      "@html-eslint": html,
    },
    languageOptions: {
      parser,
    },
    rules: {
      "@html-eslint/indent": ["error", 2],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
import globals from "globals";
import tseslint from "typescript-eslint";
import html from "@html-eslint/eslint-plugin";
import parser from "@html-eslint/parser";

import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended});

export default [

  html.configs["flat/recommended"],
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { languageOptions: { globals: globals.browser } },
  // ...compat.extends("standard-with-typescript"),
  ...tseslint.configs.recommended,
  {
    files: ["**/*.html"],
    plugins: {
      "@html-eslint": html,
    },
    languageOptions: {
      parser,
    },
    rules: {
      "@html-eslint/indent": "error",
      "@html-eslint/indent": 2,
    },
  },
];
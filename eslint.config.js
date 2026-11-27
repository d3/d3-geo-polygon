import js from "@eslint/js";
import globals from "globals";
import {defineConfig} from "eslint/config";

export default defineConfig([
  {ignores: ["dist/", "docs/", "observablehq.config.ts"]},
  {files: ["**/*.{js,ts}"], plugins: {js}, extends: ["js/recommended"]},
  {files: ["src/**/*.{js,ts}"], languageOptions: {globals: globals.browser}},
  {files: ["test/**/*.js"], languageOptions: {globals: globals.node}},
  {languageOptions: {ecmaVersion: 2020, sourceType: "module"}},
  {files: ["rollup.config.js"], languageOptions: {ecmaVersion: 2026}}
]);

import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Node globals
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
        module: "readonly",
        require: "readonly",
        // Browser globals
        window: "readonly",
        document: "readonly",
        // Mocha globals
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly"
      }
    }
  }
];




// functions/eslint.config.js
// @ts-check (if you want type checking for this config file itself)

import globals from "globals"; // For Node.js global variables
import tseslint from "typescript-eslint";
import * as importPlugin from "eslint-plugin-import";


export default tseslint.config(
  {
    // Basic JS and TS recommended rules
    extends: [
      ...tseslint.configs.recommended, // Basic TypeScript rules
      // If you want stricter type-aware rules (can be slower):
      // ...tseslint.configs.recommendedTypeChecked,
      // ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020, // Or your target (e.g., 2021 for Node 18/20)
      sourceType: "module", // As Firebase Functions for Node.js use CommonJS by default after compilation
      globals: {
        ...globals.node, // Common Node.js globals
      },
      parser: tseslint.parser, // Use the TypeScript parser
      parserOptions: {
        project: ["./tsconfig.json"], // Points to functions/tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Ensures correct path for tsconfig.json
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import": importPlugin,
    },
    rules: {
      "quotes": ["error", "double", { "avoidEscape": true }],
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "object-curly-spacing": ["error", "always"],
      "require-jsdoc": "off", // Common in Google config, turn off if not writing JSDoc
      "valid-jsdoc": "off",   // Common in Google config, turn off if not writing JSDoc
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "import/no-unresolved": "off", // Can be noisy with Firebase's module structure sometimes
      // Add any other specific rules you like from Google's style or your preference
    },
  },
  {
    // Specific ignores for the functions directory
    ignores: [
      "lib/", // Output directory for compiled JS
      "node_modules/",
      ".firebase/",
      "*.lock",
      "*.log",
      "eslint.config.js" // Often good to ignore the config file itself
    ]
  }
);
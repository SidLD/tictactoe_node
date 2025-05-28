// eslint.config.js
export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": "@typescript-eslint/eslint-plugin",
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],
      // add other rules you want here
    },
  },
];

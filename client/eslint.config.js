// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    files: ["**/*.ts"],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "app",
          style: "kebab-case",
          type: "element",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "app",
          style: "camelCase",
          type: "attribute",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  {
    files: ["src/components/ui/**/*.ts"],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "hlm",
          style: "kebab-case",
          type: "element",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "hlm",
          style: "camelCase",
          type: "attribute",
        },
      ],
      "@angular-eslint/no-input-rename": "off",
    },
  },
  {
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    files: ["**/*.html"],
    rules: {
      "@angular-eslint/template/button-has-type": "error"
    },
  },
]);

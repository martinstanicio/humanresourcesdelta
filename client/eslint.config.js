// @ts-check
const { defineConfig } = require("eslint/config");
const angular = require("angular-eslint");
const eslint = require("@eslint/js");
const ngModuleSort = require("eslint-plugin-ng-module-sort");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const tseslint = require("typescript-eslint");

module.exports = defineConfig([
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    files: ["**/*.ts"],
    plugins: {
      "ng-module-sort": /** @type {any} */ (ngModuleSort),
      "simple-import-sort": simpleImportSort,
    },
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
      "ng-module-sort/decorator-array-items": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
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
      "@angular-eslint/template/attributes-order": "error",
      "@angular-eslint/template/button-has-type": "error",
    },
  },
]);

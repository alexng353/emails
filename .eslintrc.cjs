module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "max-len": "off", // handled by prettier
    "comma-dangle": "off", // handled by prettier
    "@typescript-eslint/comma-dangle": "off", // handled by prettier
    "print-width": "off", // handled by prettier
    "prettier/prettier": [
      "error",
      {
        printWidth: 80,
      },
    ],

    "no-unused-vars": "off",

    // typescript-eslint configurations
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/consistent-generic-constructors": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^(_)",
        varsIgnorePattern: "^(_)",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {},
      },
    ],

    // unicorn configurations
    "unicorn/prevent-abbreviations": [
      "error",
      {
        allowList: {
          env: true,
          src: true,
          props: true,
        },
        checkFilenames: false,
      },
    ],
  },
  overrides: [
    {
      // disable some rules in test files because jest requires casting
      files: ["*.test.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "unicorn/prevent-abbreviations": ["warn"],
      },
    },
  ],
};

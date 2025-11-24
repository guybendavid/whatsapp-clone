import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    ignores: ["build/**"]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "func-names": "error",
      "no-trailing-spaces": "error",
      "no-console": "error",
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "semi": ["warn", "always"],
      "comma-dangle": ["warn", "never"],
      "no-else-return": ["error", { allowElseIf: false }],
      "prefer-const": "error",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "arrow-body-style": ["error", "as-needed"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "IfStatement > .alternate",
          message: "Avoid else - use early return instead"
        },
        {
          selector: "ForStatement",
          message: "Avoid for loops - use forEach, map, filter, etc."
        },
        {
          selector: "WhileStatement",
          message: "Avoid while loops - use functional alternatives"
        },
        {
          selector: "DoWhileStatement",
          message: "Avoid do-while loops - use functional alternatives"
        },
        {
          selector: "ForInStatement",
          message: "Avoid for...in - use Object.keys().forEach() or Object.entries().forEach()"
        },
        {
          selector: "ForOfStatement",
          message: "Avoid for...of - use forEach, map, filter, etc."
        },
        {
          selector: "VariableDeclaration[kind='let']",
          message: "Do not use 'let'. Use 'const' instead."
        }
      ]
    }
  }
];

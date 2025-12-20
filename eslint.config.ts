import { baseLanguageOptions } from "./eslint-base.config";
import { customRuleMap } from "./custom-eslint-rules/index";
import type { Linter } from "eslint";
import eslintImport from "eslint-plugin-import";
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import preferArrow from "eslint-plugin-prefer-arrow";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig: Linter.Config[] = [
  {
    ignores: ["custom-eslint-rules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks
    },
    rules: reactHooks.configs.recommended.rules
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: baseLanguageOptions,
    plugins: {
      "unused-imports": unusedImports,
      eslintImport,
      unicorn,
      "prefer-arrow": preferArrow,
      "jsx-a11y": jsxA11y,
      react,
      "react-refresh": reactRefresh
    },

    settings: {
      react: {
        version: "detect"
      },
      "import/resolver": {
        typescript: {
          project: "./client/tsconfig.json"
        },
        node: {
          paths: ["client/src"]
        }
      }
    },
    rules: {
      // To do: enable and refactor
      "@typescript-eslint/no-magic-numbers": [
        "off",
        {
          ignore: [0, 1, -1],
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          enforceConst: true,
          detectObjects: false
        }
      ],

      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-activedescendant-has-tabindex": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/autocomplete-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/control-has-associated-label": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/lang": "error",
      "jsx-a11y/media-has-caption": "error",
      "jsx-a11y/mouse-events-have-key-events": "error",
      "jsx-a11y/no-access-key": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/no-distracting-elements": "error",
      "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/tabindex-no-positive": "error",

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "styled-jsx/css",
              message: "Please use @emotion/css instead of styled-jsx/css"
            }
          ]
        }
      ],
      "prefer-const": "error",
      "no-var": "error",
      "prefer-arrow/prefer-arrow-functions": "error",
      "react/self-closing-comp": [
        "error",
        {
          component: true,
          html: false
        }
      ],
      "react/jsx-no-useless-fragment": [
        "error",
        {
          allowExpressions: true
        }
      ],
      "react/hook-use-state": "error",
      "react/no-unstable-nested-components": "error",
      "react/no-invalid-html-attribute": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-fragments": "error",
      "react/jsx-boolean-value": ["error", "always"],
      "react/destructuring-assignment": ["error", "always"],
      "react/jsx-curly-brace-presence": "error",
      "react/forbid-dom-props": [
        "error",
        {
          forbid: ["style"]
        }
      ],
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
      "unicorn/no-negation-in-equality-check": "error",
      "unicorn/no-single-promise-in-promise-methods": "error",
      "unicorn/no-await-in-promise-methods": "error",
      "unicorn/consistent-empty-array-spread": "error",
      "unicorn/no-invalid-fetch-options": "error",
      "unicorn/no-magic-array-flat-depth": "error",
      "unicorn/catch-error-name": [
        "error",
        {
          name: "error"
        }
      ],
      "unicorn/consistent-destructuring": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-lonely-if": "error",
      "unicorn/prefer-ternary": "error",
      "unicorn/new-for-builtins": "error",
      "unicorn/consistent-function-scoping": "error",
      "unicorn/no-array-push-push": "error",
      "unicorn/explicit-length-check": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-native-coercion-functions": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-array-index-of": "error",
      "unicorn/prefer-spread": "off",
      "no-duplicate-imports": "error",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "BinaryExpression[operator=/^(==|===|!=|!==)$/][left.raw=/^(true|false)$/], BinaryExpression[operator=/^(==|===|!=|!==)$/][right.raw=/^(true|false)$/]",
          message: "Don't compare for equality against boolean literals"
        },
        {
          selector: "ExportNamedDeclaration[declaration=null][source=null]",
          message: "Use inline exports (export const/function) instead of grouped exports"
        },
        {
          selector: "IfStatement[alternate]",
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
          selector: "CallExpression[callee.object.name='Object'][callee.property.name='assign']",
          message: "Use spread syntax {...obj} instead of Object.assign()"
        },
        {
          selector: "CallExpression[callee.property.name='apply']",
          message: "Use spread syntax instead of .apply()"
        },
        {
          selector: "SequenceExpression",
          message: "Avoid comma operator - use separate statements"
        },
        {
          selector: "WithStatement",
          message: "with statement is not allowed"
        },
        {
          selector: "LabeledStatement",
          message: "Labeled statements are not allowed"
        },
        {
          selector: "ArrayExpression > SpreadElement > NewExpression",
          message: "Use Array.from() instead of spread [...new Set()]"
        },
        {
          selector: "VariableDeclaration[kind='let']",
          message: "Do not use 'let'. Use 'const' instead. If you need to reassign, consider refactoring to avoid mutation."
        },
        {
          selector: "JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > ArrowFunctionExpression > BlockStatement",
          message: "Event handlers must be single-line arrow functions or function references"
        }
      ],
      "eslintImport/no-unresolved": "error",
      "eslintImport/named": "error",
      "eslintImport/no-default-export": "error",
      "eslintImport/no-namespace": "error",
      "eslintImport/newline-after-import": [
        "error",
        {
          count: 1
        }
      ],
      "eslintImport/no-mutable-exports": "error",
      "require-await": "error",
      "no-empty": "error",
      "no-debugger": "error",
      "no-trailing-spaces": "error",
      "no-extra-semi": "error",
      "no-throw-literal": "error",
      "no-implied-eval": "error",
      "no-empty-function": "error",
      "no-extra-boolean-cast": "error",
      "prefer-template": "error",
      "prefer-destructuring": "error",
      "no-useless-return": "error",
      "no-sparse-arrays": "error",
      "no-self-compare": "error",
      "no-self-assign": "error",
      "no-dupe-keys": "error",
      "no-constant-condition": "error",
      "no-constant-binary-expression": "error",
      "no-dupe-else-if": "error",
      "no-new-wrappers": "error",
      "no-new-object": "error",
      "no-new": "error",
      "no-param-reassign": "error",
      "no-unsafe-negation": "error",
      "no-empty-pattern": "error",
      "no-implicit-coercion": "error",
      "no-else-return": [
        "error",
        {
          allowElseIf: false
        }
      ],
      "no-lone-blocks": "error",
      "no-global-assign": "error",
      "no-unneeded-ternary": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-bitwise": "error",
      "valid-typeof": "error",
      "use-isnan": "error",
      "no-import-assign": "error",
      "no-loop-func": "error",
      "no-undef": "off", // TypeScript's compiler handles undefined variables better than ESLint
      "no-unsafe-finally": "error",
      "prefer-arrow-callback": "error",
      eqeqeq: "error",
      yoda: ["error", "never"],
      quotes: ["error", "double"],
      "object-shorthand": ["error", "always"],
      "arrow-body-style": ["error", "as-needed"],
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "never",
          prev: "singleline-const",
          next: "singleline-const"
        },
        {
          blankLine: "always",
          prev: "export",
          next: "*"
        },
        {
          blankLine: "always",
          prev: "*",
          next: "export"
        },
        {
          blankLine: "always",
          prev: "multiline-const",
          next: "*"
        },
        {
          blankLine: "always",
          prev: "*",
          next: "multiline-const"
        },
        {
          blankLine: "always",
          prev: "block-like",
          next: "*"
        },
        {
          blankLine: "always",
          prev: "*",
          next: "block-like"
        }
      ]
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      custom: { rules: customRuleMap }
    },
    rules: {
      "custom/css-style-naming": "error",
      "custom/container-style-naming": "error",
      "custom/css-styles-at-bottom": "error",
      "custom/default-imports-first": "error",
      "custom/blank-line-after-setters": "error",
      "custom/prefer-boolean-is-prefix": "error",
      "custom/prefer-direct-function-reference": "error",
      "custom/prefer-get-prefix": "error",
      "custom/require-object-destructuring": "error",
      "custom/no-get-prefix-for-void": "error",
      "custom/no-hardcoded-strings": [
        // To do: enable and refactor
        "off",
        {
          minLength: 4,
          ignorePatterns: ["^\\s*$", "^[a-z-]+$", "^[A-Z_]+$", "^/.*/$", "^https?://", "^[./]", "^\\d+$"]
        }
      ],
      "custom/no-inline-exports": "error",
      "custom/no-block-event-handlers": "error",
      "custom/padding-around-multiline-statements": "error",
      "custom/blank-line-before-multiline-return": "error"
    }
  },
  {
    files: ["*.config.{ts,js}", "client/**/*.config.ts"],
    rules: {
      "eslintImport/no-default-export": "off"
    }
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "eslintImport/no-default-export": "off"
    }
  },
  {
    files: [
      "**/models/*.ts",
      "**/resolvers/*.ts",
      "custom-eslint-rules.ts",
      "find-unimported-exports.ts",
      "client/src/components/ApolloProvider.tsx",
      "server/graphql/context-middleware.ts"
    ],
    rules: {
      // To do: enable and refactor
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["find-unimported-exports.ts", "tests/**/*.ts"],
    languageOptions: baseLanguageOptions
  },

  {
    files: ["client/**/*.{ts,tsx}", "*.config.ts"],
    languageOptions: baseLanguageOptions
  },
  {
    files: ["server/**/*.ts"],
    languageOptions: baseLanguageOptions
  },
  {
    // Disallow .js and .jsx files in TypeScript project
    files: ["**/*.{js,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message: "JavaScript files (.js/.jsx) are not allowed in this TypeScript project. Please use .ts/.tsx instead."
        }
      ]
    }
  },
  {
    files: ["**/resolvers/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    ignores: ["dist/**", "client/build/**", "**/*.config.js", "server/**/*.js"]
  }
];

export default eslintConfig;

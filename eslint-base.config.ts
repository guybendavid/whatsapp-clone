import globals from "globals";

export const baseLanguageOptions = {
  ecmaVersion: "latest",
  sourceType: "module",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  globals: {
    ...globals.browser,
    ...globals.node
  }
};

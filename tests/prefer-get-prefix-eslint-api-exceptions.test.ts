import { baseLanguageOptions } from "../eslint-base.config.js";
import { customRuleMap } from "../custom-eslint-rules/index.js";
import { RuleTester } from "eslint";

const rule = customRuleMap["prefer-get-prefix"];
const ruleTester = new RuleTester({ languageOptions: baseLanguageOptions });

ruleTester.run("prefer-get-prefix", rule, {
  valid: [
    {
      code: `const rule = {
  meta: {},
  create: () => {
    return {
      fix: () => {
        return 1;
      }
    };
  }
};`
    }
  ],
  invalid: [
    {
      code: "const format = () => { return 1; }",
      errors: [{ message: "Functions that return values should start with 'get' prefix." }]
    }
  ]
});

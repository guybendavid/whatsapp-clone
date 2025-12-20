import { baseLanguageOptions } from "../eslint-base.config.js";
import { customRuleMap } from "../custom-eslint-rules/index.js";
import { RuleTester } from "eslint";

const rule = customRuleMap["css-style-naming"];
const ruleTester = new RuleTester({ languageOptions: baseLanguageOptions });

ruleTester.run("css-style-naming", rule, {
  valid: [
    { code: "const cardStyle = css``" },
    { code: "const getCardStyle = (theme) => css``" },
    { code: "const getButtonStyle = ({ size }) => css``" }
  ],
  invalid: [
    {
      code: "const getCardStyle = () => css``",
      errors: [
        { message: `getCardStyle: ${"CSS styling functions without parameters should be converted to regular css variables."}` }
      ]
    },
    {
      code: "const getCardStyleFn = (temp) => css``",
      errors: [{ message: `getCardStyleFn: ${"CSS styling functions must end with 'Style'."}` }]
    },
    {
      code: "const getcardStyle = (temp) => css``",
      errors: [{ message: `getcardStyle: ${"Letter after 'get' must be capitalized."}` }]
    },
    {
      code: "const cardStyles = css``",
      errors: [{ message: `cardStyles: ${"CSS template literal variables must end with 'Style'."}` }]
    },
    {
      code: "const getButtonStyle = css``",
      errors: [{ message: `getButtonStyle: ${"CSS template literal variables cannot start with 'get'."}` }]
    },
    {
      code: "const CardStyle = css``",
      errors: [{ message: `CardStyle: ${"CSS template literal variables cannot start with capital letter."}` }]
    }
  ]
});

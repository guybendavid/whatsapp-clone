import type { Rule } from "eslint";

import { blankLineAfterSetters } from "./rules/blank-line-after-setters";
import { blankLineBeforeMultilineReturn } from "./rules/blank-line-before-multiline-return";
import { containerStyleNaming } from "./rules/container-style-naming";
import { cssStyleNaming } from "./rules/css-style-naming";
import { cssStylesAtBottom } from "./rules/css-styles-at-bottom";
import { defaultImportsFirst } from "./rules/default-imports-first";
import { noBlockEventHandlers } from "./rules/no-block-event-handlers";
import { noGetPrefixForVoid } from "./rules/no-get-prefix-for-void";
import { noHardcodedStrings } from "./rules/no-hardcoded-strings";
import { noInlineExports } from "./rules/no-inline-exports";
import { paddingAroundMultilineStatements } from "./rules/padding-around-multiline-statements";
import { preferBooleanIsPrefix } from "./rules/prefer-boolean-is-prefix";
import { preferDirectFunctionReference } from "./rules/prefer-direct-function-reference";
import { preferGetPrefix } from "./rules/prefer-get-prefix";
import { requireObjectDestructuring } from "./rules/require-object-destructuring";

export const customRuleMap: Record<string, Rule.RuleModule> = {
  "padding-around-multiline-statements": paddingAroundMultilineStatements,
  "css-style-naming": cssStyleNaming,
  "default-imports-first": defaultImportsFirst,
  "container-style-naming": containerStyleNaming,
  "no-block-event-handlers": noBlockEventHandlers,
  "css-styles-at-bottom": cssStylesAtBottom,
  "blank-line-after-setters": blankLineAfterSetters,
  "prefer-direct-function-reference": preferDirectFunctionReference,
  "prefer-get-prefix": preferGetPrefix,
  "no-inline-exports": noInlineExports,
  "require-object-destructuring": requireObjectDestructuring,
  "no-hardcoded-strings": noHardcodedStrings,
  "prefer-boolean-is-prefix": preferBooleanIsPrefix,
  "no-get-prefix-for-void": noGetPrefixForVoid,
  "blank-line-before-multiline-return": blankLineBeforeMultilineReturn
};

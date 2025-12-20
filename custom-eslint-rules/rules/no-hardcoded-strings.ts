import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const noHardcodedStrings: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded strings (any language) to enforce use of constants or i18n"
    },
    schema: [
      {
        type: "object",
        properties: {
          minLength: {
            type: "number",
            default: 3
          },
          ignorePatterns: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create: (context: Rule.RuleContext) => {
    const options = context.options[0] || {};
    const minLength = options.minLength || 3;
    const ignorePatterns = options.ignorePatterns || [];

    const getIsShouldIgnore = (value: any): boolean => {
      if (typeof value !== "string") return true;
      if (value.length < minLength) return true;

      if (value.trim().length === 0) return true;

      return ignorePatterns.some((pattern: any) => new RegExp(pattern).test(value));
    };

    return {
      Literal: (node: any) => {
        if (getIsShouldIgnore(node.value)) return;

        const { parent } = node;
        if (parent.type === "Property" && parent.key === node) return;
        if ((parent as AnyNode).type === "JSXAttribute") return;

        context.report({
          node,
          message: MessageTypeToText.NO_HARDCODED_STRINGS
        });
      },
      TemplateLiteral: (node: any) => {
        const isExpressions = node.expressions.length > 0;
        const value = node.quasis.map((q: AnyNode) => q.value.raw).join("");

        if (getIsShouldIgnore(value) && !isExpressions) return;

        context.report({
          node,
          message: MessageTypeToText.NO_HARDCODED_STRINGS
        });
      }
    };
  }
};

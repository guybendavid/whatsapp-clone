import type { Rule } from "eslint";
import { getIsBoolean, getIsBooleanFunction } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const preferBooleanIsPrefix: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce 'is' prefix for boolean variables and 'getIs' for boolean-returning functions"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    VariableDeclarator: (node: any) => {
      if (!node.id || node.id.type !== "Identifier") return;
      const variableName = node.id.name;

      // Skip if it's a component (starts with capital letter)
      if (/^[A-Z]/.test(variableName)) return;

      // Skip if it's a constant (all uppercase with underscores)
      if (/^[A-Z_]+$/.test(variableName)) return;

      // Check if it's a boolean variable
      if (node.init && getIsBoolean(node.init) && !variableName.startsWith("is")) {
        context.report({
          node: node.id,
          message: MessageTypeToText.BOOLEAN_VARIABLE_MUST_START_WITH_IS
        });
      }

      // Check if it's a function that returns boolean
      if (
        node.init &&
        (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression") &&
        getIsBooleanFunction(node.init) &&
        !variableName.startsWith("getIs")
      ) {
        context.report({
          node: node.id,
          message: MessageTypeToText.BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS
        });
      }
    },

    FunctionDeclaration: (node: any) => {
      if (!node.id || node.id.type !== "Identifier") return;
      const functionName = node.id.name;

      // Skip if it's a component (starts with capital letter)
      if (/^[A-Z]/.test(functionName)) return;

      // Check if it returns a boolean
      if (getIsBooleanFunction(node) && !functionName.startsWith("getIs")) {
        context.report({
          node: node.id,
          message: MessageTypeToText.BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS
        });
      }
    }
  })
};

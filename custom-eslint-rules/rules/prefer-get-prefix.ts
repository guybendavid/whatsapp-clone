import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { getIsReturn, getIsSchemaOrConfigProperty } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const preferGetPrefix: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce 'get' prefix for functions that return values"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => {
    const checkFunctionForReturn = (functionNode: AnyNode, functionName: string, reportNode: AnyNode) => {
      // Skip if already starts with "get"
      if (functionName.startsWith("get")) return;

      // Skip if it's a component (starts with capital letter)
      if (/^[A-Z]/.test(functionName)) return;

      // Skip if it's a hook (starts with "use")
      if (functionName.startsWith("use")) return;

      // Skip async functions - they return Promises, can't determine resolved type
      if (functionNode.async) return;

      // Check if function has a return statement (including nested scopes)
      if (getIsReturn(functionNode)) {
        context.report({
          node: reportNode,
          message: MessageTypeToText.FUNCTION_MUST_START_WITH_GET_PREFIX
        });
      }
    };

    return {
      // Handle all variable declarations (arrow functions and function expressions)
      VariableDeclarator: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const functionName = node.id.name;

        if (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression") {
          checkFunctionForReturn(node.init, functionName, node.id);
        }
      },

      // Handle all function declarations
      FunctionDeclaration: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const functionName = node.id.name;
        checkFunctionForReturn(node, functionName, node.id);
      },

      // Handle object properties like: { getIsCssStyle: (init) => { } }
      Property: (node: any) => {
        if (!node.key || node.key.type !== "Identifier" || !node.value) return;
        const functionName = node.key.name;
        // Skip ESLint API properties
        if (functionName === "create" || functionName === "fix") return;

        // Skip schema/config object properties
        if (getIsSchemaOrConfigProperty(node)) return;

        if (node.value.type === "ArrowFunctionExpression" || node.value.type === "FunctionExpression") {
          checkFunctionForReturn(node.value, functionName, node.key);
        }
      }
    };
  }
};

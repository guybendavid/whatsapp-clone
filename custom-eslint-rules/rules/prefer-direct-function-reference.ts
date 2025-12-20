import type { Rule } from "eslint";
import { MessageTypeToText } from "../helpers/message-types";

export const preferDirectFunctionReference: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Prefer direct function references over arrow functions in JSX event handlers when no arguments are passed",
      category: "Best Practices"
    },
    fixable: "code",
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    JSXExpressionContainer: (node: any) => {
      const { parent } = node;
      if (parent.type !== "JSXAttribute") return;

      const { name } = parent;
      const attrName = name?.name;

      // Check if this is a JSX event handler (starts with "on" followed by uppercase)
      if (!attrName || !/^on[A-Z]/.test(attrName)) return;

      const { expression } = node;

      // Check if it's an arrow function
      if (expression.type !== "ArrowFunctionExpression") return;

      // Check if the arrow function has no parameters
      if (expression.params.length > 0) return;

      // Check if the body is a single function call without arguments
      const functionCall = (() => {
        if (expression.body.type === "CallExpression") {
          return expression.body;
        }

        if (
          expression.body.type === "BlockStatement" &&
          expression.body.body.length === 1 &&
          expression.body.body[0].type === "ExpressionStatement" &&
          expression.body.body[0].expression.type === "CallExpression"
        ) {
          return expression.body.body[0].expression;
        }

        return null;
      })();

      if (!functionCall) return;

      // Check if the function call has no arguments
      if (functionCall.arguments.length > 0) return;

      // Check if the function being called is a simple identifier (not a member expression)
      if (functionCall.callee.type !== "Identifier") return;

      const functionName = functionCall.callee.name;

      context.report({
        node: expression,
        message: MessageTypeToText.PREFER_DIRECT_FUNCTION_REFERENCE,
        fix: (fixer: any) => fixer.replaceText(expression, functionName)
      });
    }
  })
};

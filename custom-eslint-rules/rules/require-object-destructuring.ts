import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const requireObjectDestructuring: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Functions with 2 or more parameters must use object destructuring"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => {
    const checkFunction = (node: AnyNode) => {
      const { params, parent, id } = node;

      // Skip if less than 2 parameters
      if (params.length < 2) return;

      // Skip if function is a callback (not exported, not a component)
      const { type: parentType } = parent;
      const grandParent = parent.parent;

      const isExported =
        parentType === "ExportNamedDeclaration" ||
        (parentType === "VariableDeclarator" && grandParent?.parent?.type === "ExportNamedDeclaration");

      const isComponent = id && /^[A-Z]/.test(id.name);

      // Skip Next.js route handlers (GET, POST, PUT, DELETE, PATCH) - framework-mandated signature
      const isNextJsRouteHandler =
        parentType === "VariableDeclarator" && parent.id?.name && /^(GET|POST|PUT|DELETE|PATCH)$/.test(parent.id.name);

      // Only enforce for exported functions or components
      if (!isExported && !isComponent) return;
      if (isNextJsRouteHandler) return;

      // Check if all parameters are using object pattern (destructuring)
      const isNonObjectParams = params.some(({ type: paramType }: any) => paramType !== "ObjectPattern");

      if (isNonObjectParams) {
        context.report({
          node,
          message: MessageTypeToText.REQUIRE_OBJECT_DESTRUCTURING
        });
      }
    };

    return {
      ArrowFunctionExpression: checkFunction,
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction
    };
  }
};

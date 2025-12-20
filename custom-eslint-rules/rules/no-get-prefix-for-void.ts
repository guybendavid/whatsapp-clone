import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { getIsSchemaOrConfigProperty } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const noGetPrefixForVoid: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prevent 'get' prefix on void functions (functions that don't return values)"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => {
    const checkFunctionForVoid = (functionNode: AnyNode, functionName: string, reportNode: AnyNode) => {
      // Only check if it starts with "get"
      if (!functionName.startsWith("get")) return;

      // Skip if it's a component (starts with capital letter after "get")
      if (/^get[A-Z]/.test(functionName) && /^get[A-Z][a-z]*[A-Z]/.test(functionName)) return;

      // Check if function has NO return statement or only returns undefined/void
      const getIsNonVoidReturn = (body: any): boolean => {
        if (!body) return false;

        if (body.type === "BlockStatement") {
          if (!Array.isArray(body.body)) return false;

          return body.body.some((statement: AnyNode) => {
            // Check for return statements with actual values
            if (statement.type === "ReturnStatement") {
              // return; or return undefined; are considered void
              if (!statement.argument) return false;
              if (statement.argument.type === "Identifier" && statement.argument.name === "undefined") return false;
              return true; // Has a real return value
            }

            // Check nested structures
            if (statement.type === "IfStatement") {
              const consequentCheck = getIsNonVoidReturn(statement.consequent);
              const alternateCheck = statement.alternate ? getIsNonVoidReturn(statement.alternate) : false;
              return consequentCheck || alternateCheck;
            }

            if (statement.type === "TryStatement") {
              const blockCheck = getIsNonVoidReturn(statement.block);
              const handlerCheck = statement.handler ? getIsNonVoidReturn(statement.handler.body) : false;
              const finalizerCheck = statement.finalizer ? getIsNonVoidReturn(statement.finalizer) : false;
              return blockCheck || handlerCheck || finalizerCheck;
            }

            if (statement.type === "BlockStatement") {
              return getIsNonVoidReturn(statement);
            }

            return false;
          });
        }

        return false;
      };

      const getIsVoidFunction = () => {
        if (functionNode.type === "ArrowFunctionExpression") {
          // Arrow functions without block are implicit returns (not void)
          if (functionNode.body.type !== "BlockStatement") return false;
          // Check if it has no return or only void returns
          return !getIsNonVoidReturn(functionNode.body);
        }

        if (functionNode.type === "FunctionExpression" || functionNode.type === "FunctionDeclaration") {
          return !getIsNonVoidReturn(functionNode.body);
        }

        return false;
      };

      if (getIsVoidFunction()) {
        context.report({
          node: reportNode,
          message: MessageTypeToText.NO_GET_PREFIX_FOR_VOID_FUNCTIONS
        });
      }
    };

    return {
      VariableDeclarator: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const functionName = node.id.name;

        if (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression") {
          checkFunctionForVoid(node.init, functionName, node.id);
        }
      },

      FunctionDeclaration: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const functionName = node.id.name;
        checkFunctionForVoid(node, functionName, node.id);
      },

      // Handle object properties like: { getName: (param) => { } }
      Property: (node: any) => {
        if (!node.key || node.key.type !== "Identifier" || !node.value) return;
        const functionName = node.key.name;
        // Skip ESLint API properties
        if (functionName === "create" || functionName === "fix") return;

        // Skip schema/config object properties
        if (getIsSchemaOrConfigProperty(node)) return;

        if (node.value.type === "ArrowFunctionExpression" || node.value.type === "FunctionExpression") {
          checkFunctionForVoid(node.value, functionName, node.key);
        }
      }
    };
  }
};

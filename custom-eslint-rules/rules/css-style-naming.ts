import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const cssStyleNaming: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Enforce naming convention for css template literals and functions"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    VariableDeclarator: (node: any) => {
      const { id, init } = node;
      if (!id || id.type !== "Identifier") return;
      const variableName = id.name;

      if (init?.type === "ArrowFunctionExpression") {
        const { params } = init;

        const body =
          init.body.type === "BlockStatement"
            ? (init.body.body.find((n: AnyNode) => n.type === "ReturnStatement") as AnyNode)?.argument
            : init.body;

        if (!body || (body.type !== "TaggedTemplateExpression" && body.type !== "CallExpression")) return;

        if (body.type === "TaggedTemplateExpression") {
          const taggedBody = body as AnyNode;
          if (taggedBody.tag?.type === "Identifier" && taggedBody.tag.name !== "css") return;
        }

        if (body.type === "CallExpression") {
          const callBody = body as AnyNode;
          if (callBody.callee?.type !== "Identifier") return;
          if (callBody.callee.name !== "css") return;
        }

        if (params.length === 0) {
          context.report({
            node: id,
            message: `${variableName}: ${MessageTypeToText.FUNCTION_WITHOUT_PARAMETERS}`
          });

          return;
        }

        // Check for Style suffix
        if (!variableName.endsWith("Style")) {
          context.report({
            node: id,
            message: `${variableName}: ${MessageTypeToText.FUNCTION_MUST_END_WITH_STYLE}`
          });

          return;
        }

        // Check for proper capitalization after 'get' if it starts with 'get'
        if (variableName.startsWith("get") && !variableName.match(/^get[A-Z]/)) {
          context.report({
            node: id,
            message: `${variableName}: ${MessageTypeToText.LETTER_AFTER_GET_MUST_BE_CAPITALIZED}`
          });
        }

        return;
      }

      if (init?.type === "TaggedTemplateExpression") {
        const taggedInit = init as AnyNode;
        if (taggedInit.tag?.type !== "Identifier" || taggedInit.tag.name !== "css") return;
        const isCapitalized = variableName[0] === variableName[0].toUpperCase();
        const isInvalidName = !variableName.endsWith("Style") || variableName.startsWith("get") || isCapitalized;

        if (isInvalidName) {
          context.report({
            node: id,
            message: !variableName.endsWith("Style")
              ? `${variableName}: ${MessageTypeToText.TEMPLATE_LITERAL_MUST_END_WITH_STYLE}`
              : variableName.startsWith("get")
                ? `${variableName}: ${MessageTypeToText.TEMPLATE_LITERAL_CANNOT_START_WITH_GET}`
                : `${variableName}: ${MessageTypeToText.TEMPLATE_LITERAL_CANNOT_START_WITH_CAPITAL_LETTER}`
          });
        }
      }
    }
  })
};

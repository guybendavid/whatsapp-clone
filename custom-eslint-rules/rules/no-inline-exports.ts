import type { Rule } from "eslint";
import { MessageTypeToText } from "../helpers/message-types";

export const noInlineExports: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow inline exports - require export keyword before declaration"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    ExportNamedDeclaration: (node: any) => {
      // Check for inline exports: export { foo, bar };
      if (node.specifiers && node.specifiers.length > 0 && !node.declaration) {
        context.report({
          node,
          message: MessageTypeToText.NO_INLINE_EXPORTS
        });
      }
    }
  })
};

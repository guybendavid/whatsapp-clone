import type { Rule } from "eslint";
import { getIsBlankLineBefore, getIsMultiLine } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const blankLineBeforeMultilineReturn: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    docs: {
      description: "Enforce blank line before multi-line return statements"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    ReturnStatement: (node: any) => {
      if (!getIsMultiLine(node)) return;
      if (getIsBlankLineBefore(context, node)) return;

      const { parent } = node;
      if (!parent || parent.type !== "BlockStatement") return;

      const statements = parent.body;
      const currentIndex = statements.indexOf(node);

      if (currentIndex === 0) return;

      const previousStatement = statements[currentIndex - 1];
      const noBlankLineAfter = ["ReturnStatement", "ThrowStatement", "BreakStatement", "ContinueStatement"];

      if (noBlankLineAfter.includes(previousStatement.type)) return;

      context.report({
        node,
        message: MessageTypeToText.BLANK_LINE_BEFORE_MULTILINE_RETURN,
        fix: (fixer: any) => fixer.insertTextBefore(node, "\n")
      });
    }
  })
};

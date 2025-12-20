import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { getIsBlankLineBefore, getIsMultiLineReturn, getIsSetterCall, getIsSpacingRequiredFunctionCall } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const blankLineAfterSetters: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    docs: {
      description: "Enforce blank line before multi-line return statements and function calls after setters"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    ReturnStatement: (node: any) => {
      // Only check multi-line return statements
      if (!getIsMultiLineReturn(node)) return;

      // Check if there's already a blank line before
      if (getIsBlankLineBefore(context, node)) return;

      // Get the previous sibling to check if it's not another return or block statement
      const { parent } = node;
      if (!parent || parent.type !== "BlockStatement") return;

      const statements = parent.body;
      const currentIndex = statements.indexOf(node);

      // If it's the first statement in the block, no blank line needed
      if (currentIndex === 0) return;

      const previousStatement = statements[currentIndex - 1];
      // Don't require blank line after certain statements that naturally flow into return
      const noBlankLineAfter = ["ReturnStatement", "ThrowStatement", "BreakStatement", "ContinueStatement"];

      if (noBlankLineAfter.includes(previousStatement.type)) return;

      context.report({
        node,
        message: MessageTypeToText.BLANK_LINE_BEFORE_MULTILINE_RETURN,
        fix: (fixer: any) => fixer.insertTextBefore(node, "\n")
      });
    },

    ExpressionStatement: (node: any) => {
      // Check if this is a function call that requires spacing
      if (!getIsSpacingRequiredFunctionCall(node)) return;

      // Check if there's already a blank line before
      if (getIsBlankLineBefore(context, node)) return;

      // Get the parent block and current statement index
      const { parent } = node;
      if (!parent || parent.type !== "BlockStatement") return;

      const statements = parent.body;
      const currentIndex = statements.indexOf(node);

      // If it's the first statement in the block, no blank line needed
      if (currentIndex === 0) return;

      const previousStatement = statements[currentIndex - 1];

      // Only require blank line if the previous statement is a setter call
      if (!getIsSetterCall(previousStatement)) return;

      // Get the function name to provide more specific feedback
      const { expression } = node;
      const callExpr = expression as AnyNode;
      const functionName = callExpr.callee?.type === "Identifier" && callExpr.callee.name ? callExpr.callee.name : "function call";

      context.report({
        node,
        message: `Expected blank line before ${functionName}() following setter statements.`,
        fix: (fixer: any) => fixer.insertTextBefore(node, "\n")
      });
    }
  })
};

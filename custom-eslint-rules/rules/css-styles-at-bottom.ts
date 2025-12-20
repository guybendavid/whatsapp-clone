import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { getIsCssStyle } from "../helpers/ast-helpers";

export const cssStylesAtBottom: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Ensure that css template literal styles are placed at the bottom of the file",
      category: "Stylistic Issues"
    },
    fixable: "code",
    schema: []
  },
  create: (context: Rule.RuleContext) => {
    const { sourceCode } = context;
    const cssStyleNodes: any[] = [];
    const componentExportNodes: any[] = [];
    const componentDeclarationNodes: any[] = [];

    const getComponentStartLine = (): number | null => {
      // First, try to use exported components as reference
      if (componentExportNodes.length > 0) {
        const [componentExportNode] = componentExportNodes;

        // If it's a default export, we need to find the actual component declaration
        if (componentExportNode.type === "ExportDefaultDeclaration") {
          // For default exports, use component declarations as reference if available
          return componentDeclarationNodes.length > 0
            ? componentDeclarationNodes[0].loc.start.line
            : componentExportNode.loc.start.line;
        }

        // For named exports, use the export line
        return componentExportNode.loc.start.line;
      }

      // If no exports but we have component declarations, use the first one
      if (componentDeclarationNodes.length > 0) {
        return componentDeclarationNodes[0].loc.start.line;
      }

      // No components found
      return null;
    };

    return {
      // Collect all css style variable declarations
      VariableDeclarator: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;

        // Check if this is a CSS style (css template literal or function returning css)
        if (getIsCssStyle(node.init)) {
          cssStyleNodes.push(node);
        }
      },

      // Collect all potential component declarations (functions/arrow functions that might be React components)
      VariableDeclaration: (node: any) => {
        node.declarations.forEach((declarator: AnyNode) => {
          if (
            declarator.id &&
            declarator.id.type === "Identifier" &&
            (declarator.init?.type === "ArrowFunctionExpression" || declarator.init?.type === "FunctionExpression") &&
            declarator.id.name[0] === declarator.id.name[0].toUpperCase()
          ) {
            componentDeclarationNodes.push(node);
          }
        });
      },

      FunctionDeclaration: (node: any) => {
        // Check if the function name looks like a component (starts with capital letter)
        if (node.id && node.id.name[0] === node.id.name[0].toUpperCase()) {
          componentDeclarationNodes.push(node);
        }
      },

      // Find the main component export (named exports)
      ExportNamedDeclaration: (node: any) => {
        if (node.declaration && (node.declaration.type === "FunctionDeclaration" || node.declaration.type === "VariableDeclaration")) {
          componentExportNodes.push(node);
        }
      },

      // Find default exports
      ExportDefaultDeclaration: (node: any) => {
        componentExportNodes.push(node);
      },

      "Program:exit": () => {
        if (cssStyleNodes.length === 0) return;

        const componentStartLine = getComponentStartLine();

        // No components found, don't enforce the rule
        if (componentStartLine === null) return;

        const violatingStyles = cssStyleNodes.filter((cssNode: any) => cssNode.loc.start.line < componentStartLine);

        if (violatingStyles.length === 0) return;

        // Report violations
        violatingStyles.forEach((cssNode) => {
          context.report({
            node: cssNode,
            message: "CSS styles should be placed at the bottom of the file, after the component",
            fix: (fixer: any) => {
              // Get the parent variable declaration
              const parentDeclaration = cssNode.parent;
              if (parentDeclaration.type !== "VariableDeclaration") return null;

              const fixes: any[] = [];

              // Remove the style from its current position
              fixes.push(fixer.remove(parentDeclaration));

              // Find the appropriate insertion point
              const insertionTarget = componentExportNodes.length > 0 ? componentExportNodes[0] : componentDeclarationNodes[0];
              // Add it after the component
              const styleText = sourceCode.getText(parentDeclaration);
              fixes.push(fixer.insertTextAfter(insertionTarget, `\n\n${styleText}`));
              return fixes;
            }
          });
        });
      }
    };
  }
};

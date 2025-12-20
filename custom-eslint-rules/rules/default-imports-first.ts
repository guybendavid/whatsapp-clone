import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";

export const defaultImportsFirst: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce default imports before named imports"
    },
    fixable: "code",
    schema: []
  },
  create: (context: Rule.RuleContext) => ({
    Program: (node: any) => {
      const imports: any[] = [];
      const { sourceCode } = context;

      // Collect all import declarations
      node.body.forEach((statement: AnyNode) => {
        if (statement.type === "ImportDeclaration") {
          const isDefaultImport = statement.specifiers.some((spec: any) => spec.type === "ImportDefaultSpecifier");
          const isNamedImport = statement.specifiers.some((spec: any) => spec.type === "ImportSpecifier");
          const isSideEffectImport = statement.specifiers.length === 0;

          imports.push({
            node: statement,
            isDefault: isDefaultImport,
            isNamed: isNamedImport,
            isSideEffect: isSideEffectImport,
            text: sourceCode.getText(statement)
          });
        }
      });

      const isViolation = imports.some((importInfo: any, index: number) => {
        if (importInfo.isSideEffect) return false;

        if (importInfo.isNamed) {
          const isDefaultBefore = imports.slice(0, index).some((prev: any) => prev.isDefault && !prev.isSideEffect);

          return isDefaultBefore;
        }

        return false;
      });

      if (isViolation) {
        const firstViolatingImport = imports.find((importInfo: any, index: number) => {
          if (importInfo.isNamed && !importInfo.isSideEffect) {
            const isDefaultBefore = imports.slice(0, index).some((prev: any) => prev.isDefault && !prev.isSideEffect);

            return isDefaultBefore;
          }

          return false;
        });

        context.report({
          node: firstViolatingImport.node,
          message: "Named imports should come before default imports",
          fix: (fixer: any) => {
            const namedImports = imports.filter((imp: any) => imp.isNamed && !imp.isSideEffect);
            const defaultImports = imports.filter((imp: any) => imp.isDefault && !imp.isSideEffect);
            const sideEffectImports = imports.filter((imp: any) => imp.isSideEffect);

            const sortedImports = [
              ...namedImports.sort((a: any, b: any) => a.text.localeCompare(b.text)),
              ...defaultImports.sort((a: any, b: any) => a.text.localeCompare(b.text)),
              ...sideEffectImports.sort((a: any, b: any) => a.text.localeCompare(b.text))
            ];

            const fixes: any[] = [];

            imports.forEach((importInfo: any, index: number) => {
              if (sortedImports[index]) {
                fixes.push(fixer.replaceText(importInfo.node, sortedImports[index].text));
              }
            });

            return fixes;
          }
        });
      }
    }
  })
};

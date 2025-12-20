import type { Rule } from "eslint";
import type { AnyNode } from "../helpers/ast-helpers";
import { getClassNameValue, getIsCssStyle, getIsOutermostElement } from "../helpers/ast-helpers";
import { MessageTypeToText } from "../helpers/message-types";

export const containerStyleNaming: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Enforce 'containerStyle' or 'getContainerStyle' naming for parent/container elements"
    },
    schema: []
  },
  create: (context: Rule.RuleContext) => {
    // Track CSS style variables and their types
    const cssStyles = new Map();

    return {
      VariableDeclarator: (node: any) => {
        const { id, init } = node;
        if (!id || id.type !== "Identifier") return;

        const variableName = id.name;

        if (getIsCssStyle(init)) {
          const isFunction = init.type === "ArrowFunctionExpression" && init.params.length > 0;
          cssStyles.set(variableName, { node: id, isFunction });
        }
      },

      JSXElement: (node: any) => {
        // Check if this is the outermost JSX element
        if (!getIsOutermostElement(node)) {
          return; // Not the outermost element
        }

        // Check if this element has a className attribute
        const { openingElement } = node;

        const classNameAttr = openingElement.attributes.find(
          (attr: any) => attr.type === "JSXAttribute" && attr.name?.name === "className"
        );

        if (!classNameAttr?.value) return;

        const classNameValue = getClassNameValue(classNameAttr);

        if (!classNameValue || !cssStyles.has(classNameValue)) return;

        const styleInfo = cssStyles.get(classNameValue);
        const expectedName = styleInfo.isFunction ? "getContainerStyle" : "containerStyle";

        // Check if it's using the correct container naming
        if (classNameValue !== expectedName) {
          context.report({
            node: styleInfo.node,
            message: `${classNameValue}: ${MessageTypeToText.CONTAINER_STYLE_NAMING}`,
            fix: (fixer: any) => fixer.replaceText(styleInfo.node, expectedName)
          });
        }
      },

      // Check for misuse of containerStyle/getContainerStyle names on non-container elements
      JSXAttribute: (node: any) => {
        if (node.name?.name !== "className" || !node.value) return;

        const classNameValue = getClassNameValue(node);

        if (!classNameValue || !["containerStyle", "getContainerStyle"].includes(classNameValue)) return;

        // Find the JSX element this attribute belongs to
        const getFindJSXElement = (currentNode: AnyNode): any => {
          if (currentNode.type === "JSXElement") return currentNode;
          if (!currentNode.parent) return null;
          return getFindJSXElement(currentNode.parent);
        };

        const jsxElement = getFindJSXElement(node);
        if (!jsxElement) return;

        // Check if this is the outermost JSX element
        const isOutermost = getIsOutermostElement(jsxElement);

        // If it's not the outermost element, report the violation
        if (!isOutermost && cssStyles.has(classNameValue)) {
          context.report({
            node: node.value.expression.type === "CallExpression" ? node.value.expression.callee : node.value.expression,
            message: `${classNameValue}: ${MessageTypeToText.CONTAINER_STYLE_RESERVED}`
          });
        }
      }
    };
  }
};

import type { Rule } from "eslint";

export type AnyNode = any;

export interface SchemaDetectorOptions {
  schemaLibraries?: string[];
  schemaMethods?: string[];
}

export const getIsMultiLine = (node: AnyNode): boolean => node.loc.end.line > node.loc.start.line;

/**
 * Configure which schema libraries to skip in 'get' prefix rules
 */
export const getSchemaDetector = (options: SchemaDetectorOptions = {}) => {
  const schemaLibraries = options.schemaLibraries || [];
  const schemaMethods = options.schemaMethods || [];

  if (schemaLibraries.length === 0 && schemaMethods.length === 0) {
    return () => false;
  }

  return (node: AnyNode): boolean => {
    if (!node.parent || node.parent.type !== "ObjectExpression") return false;

    const getIsSchemaObject = (current: AnyNode): boolean => {
      if (!current) return false;

      if (current.parent && (current.parent.type === "CallExpression" || current.parent.type === "NewExpression")) {
        const { callee } = current.parent;

        if (callee) {
          if (callee.type === "MemberExpression") {
            const objectName = callee.object?.name;
            const propertyName = callee.property?.name;

            if (schemaLibraries.includes(objectName) || schemaMethods.includes(propertyName)) {
              return true;
            }
          }

          if (callee.type === "Identifier" && schemaMethods.includes(callee.name)) {
            return true;
          }
        }
      }

      return getIsSchemaObject(current.parent);
    };

    return getIsSchemaObject(node.parent);
  };
};

export const SCHEMA_CONFIG = {
  schemaLibraries: [],
  schemaMethods: [],
  preferGetPrefixExcludedProperties: ["create", "fix"]
};

export const getIsSchemaOrConfigProperty = getSchemaDetector(SCHEMA_CONFIG);

export const getIsPreferGetPrefixExcludedProperty = (propertyName: string | null | undefined): boolean =>
  Boolean(propertyName && SCHEMA_CONFIG.preferGetPrefixExcludedProperties?.includes(propertyName));

export const getIsBlankLineBefore = (context: Rule.RuleContext, node: AnyNode): boolean => {
  const { sourceCode } = context;
  const tokenBefore = sourceCode.getTokenBefore(node);
  if (!tokenBefore) return true;

  return node.loc.start.line - tokenBefore.loc.end.line > 1;
};

export const getIsBlankLineAfter = (context: Rule.RuleContext, node: AnyNode): boolean => {
  const { sourceCode } = context;
  const tokenAfter = sourceCode.getTokenAfter(node);
  if (!tokenAfter) return true;

  return tokenAfter.loc.start.line - node.loc.end.line > 1;
};

export const getIsBoolean = (init: AnyNode): boolean => {
  if (!init) return false;

  // Check for literal boolean values
  if (init.type === "Literal" && typeof init.value === "boolean") return true;

  // Check for unary negation (!) which produces a boolean
  if (init.type === "UnaryExpression" && init.operator === "!") return true;

  // Check for binary comparisons that return boolean
  const comparisonOperators = ["==", "!=", "===", "!==", ">", ">=", "<", "<="];
  if (init.type === "BinaryExpression" && comparisonOperators.includes(init.operator)) return true;

  return false;
};

export const getCheckReturnStatements = (body: AnyNode) => {
  if (!body) return false;

  if (body.type === "BlockStatement") {
    if (!Array.isArray(body.body)) return false;

    return body.body.some((statement: AnyNode) => {
      if (statement.type === "ReturnStatement" && statement.argument) {
        return getIsBoolean(statement.argument);
      }

      if (statement.type === "IfStatement") {
        const consequentCheck = getCheckReturnStatements(statement.consequent);
        const alternateCheck = statement.alternate ? getCheckReturnStatements(statement.alternate) : false;
        return consequentCheck || alternateCheck;
      }

      if (statement.type === "TryStatement") {
        const blockCheck = getCheckReturnStatements(statement.block);
        const handlerCheck = statement.handler ? getCheckReturnStatements(statement.handler.body) : false;
        const finalizerCheck = statement.finalizer ? getCheckReturnStatements(statement.finalizer) : false;
        return blockCheck || handlerCheck || finalizerCheck;
      }

      return false;
    });
  }

  return getIsBoolean(body);
};

export const getIsBooleanFunction = (functionNode: AnyNode): boolean => {
  if (!functionNode || !functionNode.body) return false;

  // For arrow functions with implicit return
  if (functionNode.type === "ArrowFunctionExpression" && functionNode.body.type !== "BlockStatement") {
    return getIsBoolean(functionNode.body);
  }

  // For functions with explicit return statements
  return getCheckReturnStatements(functionNode.body);
};

// Helper to check if a return statement spans multiple lines
export const getIsMultiLineReturn = (node: AnyNode): boolean => {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  return endLine > startLine;
};

// Helper to check if a statement is a setter call (like setIsLoading, setIsAdmin, etc.)
export const getIsSetterCall = (node: AnyNode): boolean => {
  if (node.type !== "ExpressionStatement") return false;
  const { expression } = node;
  if (expression.type !== "CallExpression") return false;
  const { callee } = expression;
  return callee.type === "Identifier" && callee.name.startsWith("set") && callee.name.length > 3;
};

// Helper to check if a statement is a function call that should have spacing (like setTimeout, setInterval, etc.)
export const getIsSpacingRequiredFunctionCall = (node: AnyNode): boolean => {
  if (node.type !== "ExpressionStatement") return false;
  const { expression } = node;
  if (expression.type !== "CallExpression") return false;
  const { callee } = expression;

  // Only require spacing for specific function calls, not setters
  if (callee.type === "Identifier") {
    const funcName = callee.name;
    // Apply to timing functions and other utility functions first
    const spacingRequiredFunctions = ["setTimeout", "setInterval", "console", "alert"];

    if (spacingRequiredFunctions.includes(funcName)) {
      return true;
    }

    // Don't apply to setter functions (but only after checking specific allowed functions)
    if (funcName.startsWith("set") && funcName.length > 3) {
      return false;
    }
  }

  return false;
};

export const getIsReturnPresent = (body: AnyNode): boolean => {
  if (!body) return false;

  if (body.type === "BlockStatement") {
    if (!Array.isArray(body.body)) return false;

    return body.body.some((statement: AnyNode) => {
      if (statement.type === "ReturnStatement" && statement.argument) return true;

      if (statement.type === "IfStatement") {
        const consequentCheck = getIsReturnPresent(statement.consequent);
        const alternateCheck = statement.alternate ? getIsReturnPresent(statement.alternate) : false;
        return consequentCheck || alternateCheck;
      }

      if (statement.type === "TryStatement") {
        const blockCheck = getIsReturnPresent(statement.block);
        const handlerCheck = statement.handler ? getIsReturnPresent(statement.handler.body) : false;
        const finalizerCheck = statement.finalizer ? getIsReturnPresent(statement.finalizer) : false;
        return blockCheck || handlerCheck || finalizerCheck;
      }

      if (statement.type === "BlockStatement") {
        return getIsReturnPresent(statement);
      }

      return false;
    });
  }

  return false;
};

export const getIsReturn = (functionNode: AnyNode): boolean => {
  if (functionNode.type === "ArrowFunctionExpression") {
    // Only check arrow functions with explicit block and return statements
    if (functionNode.body.type === "BlockStatement") {
      return getIsReturnPresent(functionNode.body);
    }

    // Skip implicit returns - can't reliably determine if void without types
    return false;
  }

  if (functionNode.type === "FunctionExpression" || functionNode.type === "FunctionDeclaration") {
    return getIsReturnPresent(functionNode.body);
  }

  return false;
};

// Check if this is a CSS style (css template literal or function returning css)
export const getIsCssStyle = (init: AnyNode): boolean => {
  // Direct css template literal
  if (!init) return false;

  // Direct css template literal
  if (init.type === "TaggedTemplateExpression" && init.tag?.name === "css") {
    return true;
  }

  // Arrow function returning css
  if (init.type === "ArrowFunctionExpression") {
    const body =
      init.body.type === "BlockStatement"
        ? (init.body.body.find((n: AnyNode) => n.type === "ReturnStatement") as AnyNode)?.argument
        : init.body;

    return (
      body &&
      ((body.type === "TaggedTemplateExpression" && body.tag?.name === "css") ||
        (body.type === "CallExpression" && body.callee?.name === "css"))
    );
  }

  return false;
};

// Helper function to get className value from JSX attribute
export const getClassNameValue = (nodeOrAttr: AnyNode): any => {
  if (nodeOrAttr.type === "JSXAttribute") {
    if (!nodeOrAttr.value) return null;
    const attrValue = nodeOrAttr.value;

    // Handle different className value types
    if (attrValue.type === "Literal") {
      return null; // Skip string literals, we're looking for CSS-in-JS
    }

    if (attrValue.type === "JSXExpressionContainer") {
      const { expression } = attrValue;

      if (expression.type === "Identifier") {
        return expression.name;
      }

      if (expression.type === "CallExpression" && expression.callee?.type === "Identifier") {
        return expression.callee.name;
      }
    }

    return null;
  }

  // Handle the attribute object directly (original behavior)
  const attrValue = nodeOrAttr.value;

  // Handle different className value types
  if (attrValue.type === "Literal") {
    return null; // Skip string literals, we're looking for CSS-in-JS
  }

  if (attrValue.type === "JSXExpressionContainer") {
    const { expression } = attrValue;

    if (expression.type === "Identifier") {
      return expression.name;
    }

    if (expression.type === "CallExpression" && expression.callee?.type === "Identifier") {
      return expression.callee.name;
    }
  }

  return null;
};

// Helper function to check if element is outermost
export const getIsOutermostElement = (node: AnyNode): boolean => {
  const getIsParentNonOutermost = (currentNode: AnyNode): boolean => {
    if (!currentNode.parent) return false;

    const { parent } = currentNode;

    if (parent.type === "JSXElement" || parent.type === "JSXFragment") {
      return false; // Not the outermost element
    }

    if (parent.type === "ReturnStatement") {
      return true; // This is the outermost element in a return
    }

    return getIsParentNonOutermost(parent);
  };

  return getIsParentNonOutermost(node);
};

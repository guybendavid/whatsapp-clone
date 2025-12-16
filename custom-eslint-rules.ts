import { Rule } from "eslint";

type AnyNode = any;

interface SchemaDetectorOptions {
  schemaLibraries?: string[];
  schemaMethods?: string[];
}

const getIsMultiLine = (node: AnyNode): boolean => node.loc.end.line > node.loc.start.line;

/**
 * Configure which schema libraries to skip in 'get' prefix rules
 */
const getSchemaDetector = (options: SchemaDetectorOptions = {}) => {
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

// Configuration for this project - To do: Move to shared config package
const SCHEMA_CONFIG = {
  schemaLibraries: ["mongoose"],
  schemaMethods: ["Schema"]
};

const getIsSchemaOrConfigProperty = getSchemaDetector(SCHEMA_CONFIG);

const getIsBlankLineBefore = (context: Rule.RuleContext, node: AnyNode): boolean => {
  const { sourceCode } = context;
  const tokenBefore = sourceCode.getTokenBefore(node);
  if (!tokenBefore) return true;

  return node.loc.start.line - tokenBefore.loc.end.line > 1;
};

const getIsBlankLineAfter = (context: Rule.RuleContext, node: AnyNode): boolean => {
  const { sourceCode } = context;
  const tokenAfter = sourceCode.getTokenAfter(node);
  if (!tokenAfter) return true;

  return tokenAfter.loc.start.line - node.loc.end.line > 1;
};

const getIsBoolean = (init: AnyNode): boolean => {
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

const getCheckReturnStatements = (body: AnyNode) => {
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

const getIsBooleanFunction = (functionNode: AnyNode): boolean => {
  if (!functionNode || !functionNode.body) return false;

  // For arrow functions with implicit return
  if (functionNode.type === "ArrowFunctionExpression" && functionNode.body.type !== "BlockStatement") {
    return getIsBoolean(functionNode.body);
  }

  // For functions with explicit return statements
  return getCheckReturnStatements(functionNode.body);
};
// Helper to check if a return statement spans multiple lines
const getIsMultiLineReturn = (node: AnyNode): boolean => {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  return endLine > startLine;
};

// Helper to check if a statement is a setter call (like setIsLoading, setIsAdmin, etc.)
const getIsSetterCall = (node: AnyNode): boolean => {
  if (node.type !== "ExpressionStatement") return false;
  const { expression } = node;
  if (expression.type !== "CallExpression") return false;
  const { callee } = expression;
  return callee.type === "Identifier" && callee.name.startsWith("set") && callee.name.length > 3;
};

// Helper to check if a statement is a function call that should have spacing (like setTimeout, setInterval, etc.)
const getIsSpacingRequiredFunctionCall = (node: AnyNode): boolean => {
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

const getIsReturnPresent = (body: any): boolean => {
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

const getIsReturn = (functionNode: AnyNode): boolean => {
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

const MessageTypeToText = {
  FUNCTION_WITHOUT_PARAMETERS: "CSS styling functions without parameters should be converted to regular css variables.",
  FUNCTION_MUST_END_WITH_STYLE: "CSS styling functions must end with 'Style'.",
  LETTER_AFTER_GET_MUST_BE_CAPITALIZED: "Letter after 'get' must be capitalized.",
  TEMPLATE_LITERAL_MUST_END_WITH_STYLE: "CSS template literal variables must end with 'Style'.",
  TEMPLATE_LITERAL_CANNOT_START_WITH_GET: "CSS template literal variables cannot start with 'get'.",
  TEMPLATE_LITERAL_CANNOT_START_WITH_CAPITAL_LETTER: "CSS template literal variables cannot start with capital letter.",
  CONTAINER_STYLE_NAMING: "Parent/container elements should use 'containerStyle' for objects or 'getContainerStyle' for functions.",
  CONTAINER_STYLE_RESERVED: "The names 'containerStyle' and 'getContainerStyle' are reserved for parent/container elements only.",
  BLANK_LINE_BEFORE_MULTILINE_RETURN: "Expected blank line before multi-line return statement.",
  BLANK_LINE_BEFORE_FUNCTION_CALL: "Expected blank line before function call following setter statements.",
  NO_BLOCK_STATEMENTS_IN_EVENT_HANDLERS: "Block statements are not allowed in JSX event handler arrow functions.",
  PREFER_DIRECT_FUNCTION_REFERENCE: "Use direct function reference instead of arrow function when no arguments are passed.",
  NO_INLINE_STYLES: "Inline 'style' prop is forbidden. Use Emotion CSS (@emotion/css) instead.",
  FUNCTION_MUST_START_WITH_GET_PREFIX: "Functions that return values should start with 'get' prefix.",
  NO_INLINE_EXPORTS: "Use export keyword before the variable/function declaration instead of inline exports.",
  REQUIRE_OBJECT_DESTRUCTURING: "Functions with 2 or more parameters must use object destructuring.",
  NO_GET_PREFIX_FOR_VOID_FUNCTIONS: "Void functions (functions that don't return values) should not start with 'get' prefix.",
  NO_HARDCODED_STRINGS: "Hardcoded strings are not allowed. Use constants or localization keys instead.",
  BOOLEAN_VARIABLE_MUST_START_WITH_IS: "Boolean variables should start with 'is' prefix.",
  BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS: "Functions that return boolean values should start with 'getIs' prefix."
};

// Check if this is a CSS style (css template literal or function returning css)
const getIsCssStyle = (init: AnyNode): boolean => {
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
const getClassNameValue = (nodeOrAttr: AnyNode): any => {
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
const getIsOutermostElement = (node: AnyNode): boolean => {
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

export const customRuleMap: Record<string, Rule.RuleModule> = {
  "padding-around-multiline-statements": {
    meta: {
      type: "layout",
      fixable: "whitespace",
      docs: {
        description: "Enforce blank lines around multi-line statements"
      },
      schema: []
    },
    create: (context: Rule.RuleContext) => {
      const checkStatement = (node: AnyNode) => {
        if (!getIsMultiLine(node)) return;

        const { parent } = node;
        if (!parent || parent.type !== "BlockStatement") return;

        const statements = parent.body;
        const currentIndex = statements.indexOf(node);

        // Check blank line before (if not first statement)
        if (currentIndex > 0) {
          const prevStatement = statements[currentIndex - 1];

          const prevEndsFlow = ["ReturnStatement", "ThrowStatement", "BreakStatement", "ContinueStatement"].includes(
            prevStatement.type
          );

          if (!prevEndsFlow && !getIsBlankLineBefore(context, node)) {
            context.report({
              node,
              message: "Expected blank line before multi-line statement",
              fix: (fixer: any) => fixer.insertTextBefore(node, "\n")
            });
          }
        }

        // Check blank line after (if not last statement)
        const isLastStatement = currentIndex >= statements.length - 1;

        if (!isLastStatement && !getIsBlankLineAfter(context, node)) {
          const { loc } = node;

          context.report({
            node,
            loc: loc.end,
            message: "Expected blank line after multi-line statement",
            fix: (fixer: any) => fixer.insertTextAfter(node, "\n")
          });
        }
      };

      return {
        ExpressionStatement: checkStatement,
        VariableDeclaration: checkStatement,
        ReturnStatement: checkStatement,
        IfStatement: checkStatement,
        TryStatement: checkStatement,
        ThrowStatement: checkStatement
      };
    }
  },

  // To do: add fixers (ensure fixing the usages including imports if there are (shared styles))
  "css-style-naming": {
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
            // const newName = variableName.replace(/^get/, "").replace(/Style$/, "") + "Style";

            context.report({
              node: id,
              message: `${variableName}: ${MessageTypeToText.FUNCTION_WITHOUT_PARAMETERS}`
              // fix: (fixer: any) => {
              //   const [quasi] = body.quasi.quasis;
              //   return [fixer.replaceText(init, `css\`${quasi.value.raw}\``), fixer.replaceText(id, newName)];
              // }
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
            // const newName = variableName.replace(/^get/, "").replace(/Style$/, "") + "Style";

            context.report({
              node: id,
              message: !variableName.endsWith("Style")
                ? `${variableName}: ${MessageTypeToText.TEMPLATE_LITERAL_MUST_END_WITH_STYLE}`
                : variableName.startsWith("get")
                  ? `${variableName}: ${MessageTypeToText.TEMPLATE_LITERAL_CANNOT_START_WITH_GET}`
                  : `${variableName}: ${MessageTypeToText.TEMPLATE_LITERAL_CANNOT_START_WITH_CAPITAL_LETTER}`
              // fix: (fixer: any) => fixer.replaceText(id, newName)
            });
          }
        }
      }
    })
  },
  // To do: use a library instead
  "default-imports-first": {
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
        }); // Check if named imports come before default imports

        const isViolation = imports.some((importInfo: any, index: number) => {
          if (importInfo.isSideEffect) return false; // Skip side-effect imports

          if (importInfo.isNamed) {
            // Check if there's a default import before this named import
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
              // Sort the imports: named first, then defaults, then side-effects
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
  },

  // Check if this is a CSS style (css template literal or function returning css)
  "container-style-naming": {
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
        }, // Check for misuse of containerStyle/getContainerStyle names on non-container elements
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
  },
  "no-block-event-handlers": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow block statements in JSX event handler arrow functions",
        category: "Stylistic Issues"
      },
      fixable: "code",
      schema: []
    },

    create: (context: Rule.RuleContext) => {
      const { sourceCode } = context;

      const checkArrowFunction = (node: AnyNode) => {
        // Only check arrow functions with block statements
        if (node.body.type !== "BlockStatement") return;

        const statements = node.body.body;

        // Always report block statements in JSX event handlers
        const reportConfig: { node: any; message: string; fix?: any } = {
          node,
          message: MessageTypeToText.NO_BLOCK_STATEMENTS_IN_EVENT_HANDLERS
        };

        // Only provide auto-fix for simple cases (single statement that's return/expression)
        if (statements.length === 1) {
          const [statement] = statements;

          if (statement.type === "ReturnStatement" || statement.type === "ExpressionStatement") {
            const expression = statement.type === "ReturnStatement" ? statement.argument : statement.expression;

            if (expression) {
              reportConfig.fix = (fixer: any) => {
                // Convert block statement to expression
                const expressionText = sourceCode.getText(expression);

                // Replace the entire body with just the expression
                return fixer.replaceText(node.body, expressionText);
              };
            }
          }
        }

        context.report(reportConfig);
      };

      return {
        // Only check JSX event handlers: <button onClick={(e) => { doSomething(); }} />
        JSXExpressionContainer: (node: any) => {
          const { parent } = node;
          if (parent.type !== "JSXAttribute") return;

          const { name } = parent;
          const attrName = name?.name;

          // Check if this is a JSX event handler (starts with "on" followed by uppercase)
          if (!attrName || !/^on[A-Z]/.test(attrName)) return;

          const { expression } = node;

          if (expression.type === "ArrowFunctionExpression") {
            checkArrowFunction(expression);
          }
        }
      };
    }
  },

  "css-styles-at-bottom": {
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
              (declarator.init?.type === "ArrowFunctionExpression" || declarator.init?.type === "FunctionExpression") && // Check if the name looks like a component (starts with capital letter)
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
          if (
            node.declaration &&
            (node.declaration.type === "FunctionDeclaration" || node.declaration.type === "VariableDeclaration")
          ) {
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
  },
  "blank-line-after-setters": {
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
  },
  "prefer-direct-function-reference": {
    meta: {
      type: "problem",
      docs: {
        description: "Prefer direct function references over arrow functions in JSX event handlers when no arguments are passed",
        category: "Best Practices"
      },
      fixable: "code",
      schema: []
    },
    create: (context: Rule.RuleContext) => ({
      JSXExpressionContainer: (node: any) => {
        const { parent } = node;
        if (parent.type !== "JSXAttribute") return;

        const { name } = parent;
        const attrName = name?.name;

        // Check if this is a JSX event handler (starts with "on" followed by uppercase)
        if (!attrName || !/^on[A-Z]/.test(attrName)) return;

        const { expression } = node;

        // Check if it's an arrow function
        if (expression.type !== "ArrowFunctionExpression") return;

        // Check if the arrow function has no parameters
        if (expression.params.length > 0) return;

        // Check if the body is a single function call without arguments
        const functionCall = (() => {
          if (expression.body.type === "CallExpression") {
            return expression.body;
          }

          if (
            expression.body.type === "BlockStatement" &&
            expression.body.body.length === 1 &&
            expression.body.body[0].type === "ExpressionStatement" &&
            expression.body.body[0].expression.type === "CallExpression"
          ) {
            return expression.body.body[0].expression;
          }

          return null;
        })();

        if (!functionCall) return;

        // Check if the function call has no arguments
        if (functionCall.arguments.length > 0) return;

        // Check if the function being called is a simple identifier (not a member expression)
        if (functionCall.callee.type !== "Identifier") return;

        const functionName = functionCall.callee.name;

        context.report({
          node: expression,
          message: MessageTypeToText.PREFER_DIRECT_FUNCTION_REFERENCE,
          fix: (fixer: any) =>
            // Replace the entire arrow function with just the function name
            fixer.replaceText(expression, functionName)
        });
      }
    })
  },
  "no-inline-styles": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow inline style prop on all JSX elements"
      },
      schema: []
    },
    create: (context: Rule.RuleContext) => ({
      JSXAttribute: (node: any) => {
        if (node.name.name === "style") {
          context.report({
            node,
            message: MessageTypeToText.NO_INLINE_STYLES
          });
        }
      }
    })
  },
  "prefer-get-prefix": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce 'get' prefix for functions that return values"
      },
      schema: []
    },
    create: (context: Rule.RuleContext) => {
      const checkFunctionForReturn = (functionNode: AnyNode, functionName: string, reportNode: AnyNode) => {
        // Skip if already starts with "get"
        if (functionName.startsWith("get")) return;

        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(functionName)) return;

        // Skip if it's a hook (starts with "use")
        if (functionName.startsWith("use")) return;

        // Skip async functions - they return Promises, can't determine resolved type
        if (functionNode.async) return;

        // Check if function has a return statement (including nested scopes)
        if (getIsReturn(functionNode)) {
          context.report({
            node: reportNode,
            message: MessageTypeToText.FUNCTION_MUST_START_WITH_GET_PREFIX
          });
        }
      };

      return {
        // Handle all variable declarations (arrow functions and function expressions)
        VariableDeclarator: (node: any) => {
          if (!node.id || node.id.type !== "Identifier") return;
          const functionName = node.id.name;

          if (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression") {
            checkFunctionForReturn(node.init, functionName, node.id);
          }
        },

        // Handle all function declarations
        FunctionDeclaration: (node: any) => {
          if (!node.id || node.id.type !== "Identifier") return;
          const functionName = node.id.name;
          checkFunctionForReturn(node, functionName, node.id);
        },
        // Handle object properties like: { getIsCssStyle: (init) => { } }
        Property: (node: any) => {
          if (!node.key || node.key.type !== "Identifier" || !node.value) return;
          const functionName = node.key.name;
          // Skip ESLint API properties
          if (functionName === "create" || functionName === "fix") return;

          // Skip schema/config object properties (like Mongoose schema methods)
          if (getIsSchemaOrConfigProperty(node)) return;

          if (node.value.type === "ArrowFunctionExpression" || node.value.type === "FunctionExpression") {
            checkFunctionForReturn(node.value, functionName, node.key);
          }
        }
      };
    }
  },
  "no-inline-exports": {
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
  },
  "require-object-destructuring": {
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
  },
  "no-hardcoded-strings": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow hardcoded strings (any language) to enforce use of constants or i18n"
      },
      schema: [
        {
          type: "object",
          properties: {
            minLength: {
              type: "number",
              default: 3
            },
            ignorePatterns: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          additionalProperties: false
        }
      ]
    },
    create: (context: Rule.RuleContext) => {
      const options = context.options[0] || {};
      const minLength = options.minLength || 3;
      const ignorePatterns = options.ignorePatterns || [];

      const getIsShouldIgnore = (value: any): boolean => {
        if (typeof value !== "string") return true;
        if (value.length < minLength) return true;

        if (value.trim().length === 0) return true;

        return ignorePatterns.some((pattern: any) => new RegExp(pattern).test(value));
      };

      return {
        Literal: (node: any) => {
          if (getIsShouldIgnore(node.value)) return;

          const { parent } = node;
          if (parent.type === "Property" && parent.key === node) return;
          if ((parent as AnyNode).type === "JSXAttribute") return;

          context.report({
            node,
            message: MessageTypeToText.NO_HARDCODED_STRINGS
          });
        },
        TemplateLiteral: (node: any) => {
          const isExpressions = node.expressions.length > 0;
          const value = node.quasis.map((q: AnyNode) => q.value.raw).join("");

          if (getIsShouldIgnore(value) && !isExpressions) return;

          context.report({
            node,
            message: MessageTypeToText.NO_HARDCODED_STRINGS
          });
        }
      };
    }
  },
  "prefer-boolean-is-prefix": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce 'is' prefix for boolean variables and 'getIs' for boolean-returning functions"
      },
      schema: []
    },
    create: (context: Rule.RuleContext) => ({
      VariableDeclarator: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const variableName = node.id.name;

        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(variableName)) return;

        // Skip if it's a constant (all uppercase with underscores)
        if (/^[A-Z_]+$/.test(variableName)) return;

        // Check if it's a boolean variable
        if (node.init && getIsBoolean(node.init) && !variableName.startsWith("is")) {
          context.report({
            node: node.id,
            message: MessageTypeToText.BOOLEAN_VARIABLE_MUST_START_WITH_IS
          });
        }

        // Check if it's a function that returns boolean
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression") &&
          getIsBooleanFunction(node.init) &&
          !variableName.startsWith("getIs")
        ) {
          context.report({
            node: node.id,
            message: MessageTypeToText.BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS
          });
        }
      },

      FunctionDeclaration: (node: any) => {
        if (!node.id || node.id.type !== "Identifier") return;
        const functionName = node.id.name;

        // Skip if it's a component (starts with capital letter)
        if (/^[A-Z]/.test(functionName)) return;

        // Check if it returns a boolean
        if (getIsBooleanFunction(node) && !functionName.startsWith("getIs")) {
          context.report({
            node: node.id,
            message: MessageTypeToText.BOOLEAN_FUNCTION_MUST_START_WITH_GET_IS
          });
        }
      }
    })
  },
  "no-get-prefix-for-void": {
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

          // Skip schema/config object properties (like Mongoose schema methods)
          if (getIsSchemaOrConfigProperty(node)) return;

          if (node.value.type === "ArrowFunctionExpression" || node.value.type === "FunctionExpression") {
            checkFunctionForVoid(node.value, functionName, node.key);
          }
        }
      };
    }
  },
  "blank-line-before-multiline-return": {
    meta: {
      type: "layout",
      fixable: "whitespace",
      docs: {
        description: "Enforce blank line before multi-line return statements"
      },
      schema: []
    },
    create: (context) => ({
      ReturnStatement: (node) => {
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
          fix: (fixer) => fixer.insertTextBefore(node, "\n")
        });
      }
    })
  }
};

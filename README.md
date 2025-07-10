Still another utility that I am bound to reuse between open-source projects. Here is the code with JSDoc comments:

```js
/**
 * $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTS
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
 */
export const findAllImports = (
  filePath,
  {
    cwd = process.cwd(),
    visitedSet = new Set(),
    depth = 0,
    maxDepth = 100,
  } = {}
) => {
  // Fails early if max depth is recursively reached.
  if (depth > maxDepth) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeWarning,
          message: `WARNING. Max depth ${maxDepth} reached at ${filePath}.`,
        },
      ],
    };
  }
  // Fails early if no file is found.
  if (!fs.existsSync(filePath)) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeWarning,
          message: `WARNING. File not found at ${filePath}.`,
        },
      ],
    };
  }
  // Returns the existing set directly if a path has already been visited.
  if (visitedSet.has(filePath)) {
    return { ...successTrue, visitedSet };
  }

  // Updates the visited set.
  visitedSet.add(filePath);

  // Parses the file's source code AST.
  const sourceCode = getSourceCodeFromFilePath(filePath);
  // Fails early there is no AST.
  if (!sourceCode?.ast) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeWarning,
          message: `WARNING. Failed to parse AST for ${filePath}.`,
        },
      ],
    };
  }

  // Makes the joint settings for the conditional calls of processImport.
  const processImportSettings = {
    currentDir: path.dirname(filePath),
    cwd,
    visitedSet,
    depth,
    maxDepth,
  };

  // Processes all imports.
  for (const node of sourceCode.ast.body) {
    // ES Modules (import x from 'y')
    if (node.type === "ImportDeclaration") {
      const processImportResults = processImport(
        node.source.value,
        processImportSettings
      );
      if (!processImportResults) {
        return processImportResults;
      }
    }

    // CommonJS (require('x'))
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression" &&
      node.expression.callee.name === "require" &&
      node.expression.arguments[0]?.type === "Literal"
    ) {
      const processImportResults = processImport(
        node.expression.arguments[0].value,
        processImportSettings
      );
      if (!processImportResults) {
        return processImportResults;
      }
    }
  }

  return { ...successTrue, visitedSet };
};
```

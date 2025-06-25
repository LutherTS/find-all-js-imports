Still another utility that I am bound to reuse between open-source projects. Here is the code with JSDoc comments:

```js
/**
 * Finds all import paths recursively related to a given file path.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {Object} options The additional options as follows:
 * @param {string} [options.cwd] The current working directory, set as `process.cwd()` by default.
 * @param {Set<string>} [options.visitedSet] The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {number} [options.depth] The current depth of the recursion, instantiated at `0` by default.
 * @param {number} [options.maxDepth] The maximum depth allowed for the recursion, instantiated at `100` by default.
 * @returns The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`).
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

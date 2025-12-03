import fs from "fs";
import path from "path";

import { getSourceCodeFromFilePath } from "get-sourcecode-from-file-path";

import { successTrue, successFalse, typeError } from "../constants/bases.js";
import { VisitedSetSchema } from "../constants/schemas.js";

/**
 * @typedef {import("../../types/typedefs.js").ASTBodyNode} ASTBodyNode
 */

/* makeSuccessFalseTypeError */

/**
 * Makes a `{success: false}` object with a single error in its errors array of `{type: "error"}` based on the message it is meant to display.
 * @param {string} message The human-readable message of the error.
 * @returns A `{success: false}` object with a single error in its error array of `{type: "error"}`.
 */
export const makeSuccessFalseTypeError = (message) => ({
  ...successFalse,
  errors: [
    {
      ...typeError,
      message,
    },
  ],
});

/* validateFilePathAndOptions */

/**
 * Makes a standardized string for `typeof` errors, `instanceof` errors and the likes.
 * @param {string} paramName The string for the param's name.
 * @param {string} paramKind The string for the param's kind.
 * @returns [paramName] is supposed to be [paramKind].
 */
const makeIsSupposedToBe = (paramName, paramKind) =>
  `${paramName} is supposed to be ${paramKind}.`;

/**
 * Validates filePath and options in `findAllImports` functions, both structurally and functionally.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {Object} options The additional options as follows:
 * @param {string} [options.cwd] The current working directory, set as `process.cwd()` by default.
 * @param {Set<string>} [options.visitedSet] The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {number} [options.depth] The current depth of the recursion, instantiated at `0` by default.
 * @param {number} [options.maxDepth] The maximum depth allowed for the recursion, instantiated at `100` by default.
 * @returns A `{success: false}` object along with its errors when an issue is encountered, used to stop the process while notifying on the reasons why it stopped at the point of consumption.
 */
export const validateFilePathAndOptions = (
  filePath,
  { cwd, visitedSet, depth, maxDepth }
) => {
  // Begins with roughly validating filePath and options.
  if (typeof filePath !== "string")
    return makeSuccessFalseTypeError(
      `ERROR. ${makeIsSupposedToBe("filePath", "a string")}`
    );
  if (typeof cwd !== "string")
    return makeSuccessFalseTypeError(
      `ERROR. ${makeIsSupposedToBe("cwd", "a string")}`
    );
  if (visitedSet instanceof Set === false)
    return makeSuccessFalseTypeError(
      `ERROR. ${makeIsSupposedToBe("visitedSet", "a Set")}`
    );
  if (typeof depth !== "number")
    return makeSuccessFalseTypeError(
      `ERROR. ${makeIsSupposedToBe("depth", "a number")}`
    );
  if (typeof maxDepth !== "number")
    return makeSuccessFalseTypeError(
      `ERROR. ${makeIsSupposedToBe("maxDepth", "a number")}`
    );

  // Then validates visitedSet with zod.
  const visitedSetResults = VisitedSetSchema.safeParse(visitedSet);
  if (!visitedSetResults.success) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: "ERROR. Config data could not pass validation from zod.",
        },
        ...visitedSetResults.error.issues.map((e) => ({
          ...typeError,
          message: e.message,
        })),
      ],
    };
  }

  // Fails early if max depth is recursively reached.
  if (depth > maxDepth)
    return makeSuccessFalseTypeError(
      `ERROR. Max depth ${maxDepth} reached at ${filePath}.`
    );

  // Fails early if no file is found.
  if (!fs.existsSync(filePath))
    return makeSuccessFalseTypeError(`ERROR. File not found at ${filePath}.`);

  // Parses the file's source code AST.
  const sourceCode = getSourceCodeFromFilePath(filePath);
  // Fails early if there is no AST.
  if (!sourceCode?.ast)
    return makeSuccessFalseTypeError(
      `ERROR. Failed to parse AST for ${filePath} somehow.`
    );

  return {
    ...successTrue,
    filePath,
    cwd,
    visitedSet: visitedSetResults.data,
    depth,
    maxDepth,
    sourceCode,
  };
};

/* validateCallbackConfig */

/**
 * Validates the callbackConfig passed, ensures that it is an object, that its property `callback` is a function, and ascertains that its property `accumulator` is unknown.
 * @param {unknown} callbackConfig The configuration of a callback function provided to a `findAllImports` function, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties.
 * @returns A `{success: false}` object along with its errors when an issue is encountered, used to stop the process while notifying on the reasons why it stopped at the point of consumption.
 */
export const validateCallbackConfig = (callbackConfig) => {
  // Begins by checking the integrity of callbackConfig.
  if (
    !callbackConfig ||
    typeof callbackConfig !== "object" ||
    Array.isArray(callbackConfig)
  )
    return makeSuccessFalseTypeError(
      "ERROR. Invalid callbackConfig format. The callbackConfig should be an object."
    );

  // Ensures callbackConfig.callback is a function.
  const callback = /** @type {unknown} */ (callbackConfig.callback);
  if (typeof callback !== "function")
    return makeSuccessFalseTypeError(
      "ERROR. Invalid callbackConfig.callback format. The callbackConfig.callback should be a function."
    );

  // Ascertains callbackConfig.accumulator to be unknown.
  const accumulator = /** @type {unknown} */ (callbackConfig.accumulator);

  // Returns callbackConfig with validated and typed properties. (Even though these won't be used within the functions in order to benefit fom the preexisting JSDoc.)
  return {
    ...successTrue,
    callbackConfig: {
      callback,
      accumulator,
    },
  };
};

/* updateVisitedSet */

/**
 * Updates visitedSet with the current filePath once all validations have been successful, thus including it in the list of the original file path and all of its recursive imports.
 * @param {Set<string>} visitedSet The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @returns
 */
export const updateVisitedSet = (visitedSet, filePath) => {
  visitedSet.add(filePath);
};

/* makeProcessImportSettings */

/**
 * Makes the settings of the next round of `processImport`.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns The settings object of the next round of `processImport`.
 */
export const makeProcessImportSettings = (
  filePath,
  { cwd, visitedSet, depth, maxDepth }
) => ({
  currentDir: path.dirname(filePath),
  cwd,
  visitedSet,
  depth,
  maxDepth,
});

/* makeFindAllImportsOptions */

/**
 * Makes the options of the next round of `findAllImports`. (Given that they are required, they are no longer "options" per se and are therefore considered here as "settings".)
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.currentDir The directory containing the import path currently being addressed.
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns The options object of the next round of `findAllImports`.
 */
export const makeFindAllImportsOptions = ({
  cwd,
  visitedSet,
  depth,
  maxDepth,
}) => ({
  cwd,
  visitedSet,
  depth: depth + 1,
  maxDepth,
});

/* visitedSetHasPreviousVisit */

/**
 * Tells if the current file path has already been visited within the current recursion.
 * @param {Set<string>} visitedSet The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @returns `true` if the file path has been visited before, `false` if it hasn't.
 */
export const visitedSetHasPreviousVisit = (visitedSet, filePath) =>
  visitedSet.has(filePath);

/* nodeIsImportDeclaration */

/**
 * Tells if the node being walked through corresponds to an ES Module import.
 * @param {ASTBodyNode} node The current node of the current file path's AST (Abstract Syntax Tree).
 * @returns `true` if the node is an `import`, `false` if it isn't.
 */
export const nodeIsImportDeclaration = (node) =>
  node.type === "ImportDeclaration";

/* nodeIsImportExpression */

/**
 * Tells if the node being walked through corresponds to a dynamic import.
 * @param {ASTBodyNode} node The current node of the current file path's AST (Abstract Syntax Tree).
 * @returns `true` if the node is an `import()`, `false` if it isn't.
 */
export const nodeIsImportExpression = (node) =>
  node.type === "ImportExpression";

/* nodeIsRequireCall */

/**
 * Tells if the node being walked through corresponds to a CommonJS require.
 * @param {ASTBodyNode} node The current node of the current file path's AST (Abstract Syntax Tree).
 * @returns `true` if the node is a `require`, `false` if it isn't.
 */
export const nodeIsRequireCall = (node) =>
  node.type === "ExpressionStatement" &&
  node.expression.type === "CallExpression" &&
  node.expression.callee.name === "require" &&
  node.expression.arguments[0]?.type === "Literal";

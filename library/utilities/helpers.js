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
 * $COMMENT#JSDOC#DEFINITIONS#MAKESUCCESSFALSETYPEERROR
 * @param {string} message $COMMENT#JSDOC#PARAMS#MESSAGE
 * @returns $COMMENT#JSDOC#RETURNS#MAKESUCCESSFALSETYPEERROR
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
 * $COMMENT#JSDOC#DEFINITIONS#MAKEISSUPPOSEDTOBE
 * @param {string} paramName $COMMENT#JSDOC#PARAMS#PARAMNAME
 * @param {string} paramKind $COMMENT#JSDOC#PARAMS#PARAMKIND
 * @returns $COMMENT#JSDOC#RETURNS#MAKEISSUPPOSEDTOBE
 */
const makeIsSupposedToBe = (paramName, paramKind) =>
  `${paramName} is supposed to be ${paramKind}.`;

/**
 * $COMMENT#JSDOC#DEFINITIONS#VALIDATEFILEPATHANDOPTIONS
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#VALIDATE
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
 * $COMMENT#JSDOC#DEFINITIONS#VALIDATECALLBACKCONFIG
 * @param {unknown} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIG
 * @returns $COMMENT#JSDOC#RETURNS#VALIDATE
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
 * $COMMENT#JSDOC#DEFINITIONS#UPDATEVISITEDSET
 * @param {Set<string>} visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @returns
 */
export const updateVisitedSet = (visitedSet, filePath) => {
  visitedSet.add(filePath);
};

/* makeProcessImportSettings */

/**
 * $COMMENT#JSDOC#DEFINITIONS#MAKEPROCESSIMPORTSETTINGS
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {Object} settings $COMMENT#JSDOC#PARAMS#SETTINGS
 * @param {string} settings.cwd $COMMENT#JSDOC#PARAMS#CWDSETTING
 * @param {Set<string>} settings.visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING
 * @param {number} settings.depth $COMMENT#JSDOC#PARAMS#DEPTHSETTING
 * @param {number} settings.maxDepth $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING
 * @returns $COMMENT#JSDOC#RETURNS#MAKEPROCESSIMPORTSETTINGS
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
 * $COMMENT#JSDOC#DEFINITIONS#MAKEFINDALLIMPORTSOPTIONS
 * @param {Object} settings $COMMENT#JSDOC#PARAMS#SETTINGS
 * @param {string} settings.currentDir $COMMENT#JSDOC#PARAMS#CURRENTDIRSETTING
 * @param {string} settings.cwd $COMMENT#JSDOC#PARAMS#CWDSETTING
 * @param {Set<string>} settings.visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING
 * @param {number} settings.depth $COMMENT#JSDOC#PARAMS#DEPTHSETTING
 * @param {number} settings.maxDepth $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING
 * @returns $COMMENT#JSDOC#RETURNS#MAKEFINDALLIMPORTSOPTIONS
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
 * $COMMENT#JSDOC#DEFINITIONS#VISITEDSETHASPREVIOUSVISIT
 * @param {Set<string>} visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @returns $COMMENT#JSDOC#RETURNS#VISITEDSETHASPREVIOUSVISIT
 */
export const visitedSetHasPreviousVisit = (visitedSet, filePath) =>
  visitedSet.has(filePath);

/* nodeIsImportDeclaration */

/**
 * $COMMENT#JSDOC#DEFINITIONS#NODEISIMPORTDECLARATION
 * @param {ASTBodyNode} node $COMMENT#JSDOC#PARAMS#NODE
 * @returns $COMMENT#JSDOC#RETURNS#NODEISIMPORTDECLARATION
 */
export const nodeIsImportDeclaration = (node) =>
  node.type === "ImportDeclaration";

/* nodeIsRequireCall */

/**
 * $COMMENT#JSDOC#DEFINITIONS#NODEISREQUIRECALL
 * @param {ASTBodyNode} node $COMMENT#JSDOC#PARAMS#NODE
 * @returns $COMMENT#JSDOC#RETURNS#NODEISREQUIRECALL
 */
export const nodeIsRequireCall = (node) =>
  node.type === "ExpressionStatement" &&
  node.expression.type === "CallExpression" &&
  node.expression.callee.name === "require" &&
  node.expression.arguments[0]?.type === "Literal";

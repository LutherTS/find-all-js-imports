import fs from "fs";
import path from "path";

import * as z from "zod";

import { resolveImportingPath } from "resolve-importing-path";
import { getSourceCodeFromFilePath } from "get-sourcecode-from-file-path";

/**
 * @typedef {"error" | "warning"} ErrorOrWarning
 * @typedef {import('eslint').SourceCode} SourceCode
 * @typedef {import('@typescript-eslint/types').TSESTree.Program['body'][number]} ASTBodyNode
 */

/**
 * @typedef {{
 *   success: false;
 *   errors: Array<{ message: string; type: ErrorOrWarning;}>;
 * } | {
 *   success: true;
 *   visitedSet: Set<string>;
 * }} FindAllImportsResults
 */

/**
 * @typedef {{
 *   success: false;
 *   errors: Array<{ message: string; type: ErrorOrWarning;}>;
 * } | {
 *   success: true;
 *   visitedSet: Set<string>;
 *   accumulator: unknown;
 * }} FindAllImportsResultsWithAccumulator
 */

/**
 * @typedef {{
 *   callback: (
 *     filePath: string,
 *     sourceCode: SourceCode,
 *     accumulator: unknown,
 *   ) => void;
 *   accumulator: unknown;
 * }} SynchronousCallbackConfig
 */

/**
 * @typedef {{
 *   callback: (
 *     filePath: string,
 *     sourceCode: SourceCode,
 *     accumulator: unknown,
 *   ) => Promise<void>,
 *   accumulator: unknown
 * }} AsynchronousCallbackConfig
 */

// success objects
export const successFalse = Object.freeze({
  success: false,
});
export const successTrue = Object.freeze({
  success: true,
});

// error objects
export const typeError = Object.freeze({
  type: "error",
});
export const typeWarning = Object.freeze({
  type: "warning",
});

const VisitedSetSchema = z.set(
  z.string({ error: "All values within visitedSet should be strings." }),
  { error: "visitedSet should be a Set." }
);

/* helpers
 * First, make sure they work.
 * Second, make their params' types.
 * Third, make their JSDoc.
 * Fourth, make their own files in a new library/ directory.
 */

/**
 * $COMMENT#JSDOC#DEFINITIONS#MAKEISSUPPOSEDTOBE
 * @param {string} paramName $COMMENT#JSDOC#PARAMS#PARAMNAME
 * @param {string} paramKind $COMMENT#JSDOC#PARAMS#PARAMKIND
 * @returns $COMMENT#JSDOC#RETURNS#MAKEISSUPPOSEDTOBE
 */
export const makeIsSupposedToBe = (paramName, paramKind) =>
  `${paramName} is supposed to be ${paramKind}.`;

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

/**
 * $COMMENT#JSDOC#DEFINITIONS#UPDATEVISITEDSET
 * @param {Set<string>} visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @returns
 */
export const updateVisitedSet = (visitedSet, filePath) => {
  visitedSet.add(filePath);
};

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

/**
 * $COMMENT#JSDOC#DEFINITIONS#VISITEDSETHASPREVIOUSVISIT
 * @param {Set<string>} visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @returns $COMMENT#JSDOC#RETURNS#VISITEDSETHASPREVIOUSVISIT
 */
export const visitedSetHasPreviousVisit = (visitedSet, filePath) =>
  visitedSet.has(filePath);

/**
 * $COMMENT#JSDOC#DEFINITIONS#NODEISIMPORTDECLARATION
 * @param {ASTBodyNode} node $COMMENT#JSDOC#PARAMS#NODE
 * @returns $COMMENT#JSDOC#RETURNS#NODEISIMPORTDECLARATION
 */
export const nodeIsImportDeclaration = (node) =>
  node.type === "ImportDeclaration";

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

/* findAllImports */

/**
 * $COMMENT#JSDOC#DEFINITIONS#PROCESSIMPORT
 * @param {string} importPath $COMMENT#JSDOC#PARAMS#IMPORTPATH
 * @param {Object} settings $COMMENT#JSDOC#PARAMS#SETTINGS
 * @param {string} settings.currentDir $COMMENT#JSDOC#PARAMS#CURRENTDIRSETTING
 * @param {string} settings.cwd $COMMENT#JSDOC#PARAMS#CWDSETTING
 * @param {Set<string>} settings.visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING
 * @param {number} settings.depth $COMMENT#JSDOC#PARAMS#DEPTHSETTING
 * @param {number} settings.maxDepth $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING
 * @returns $COMMENT#JSDOC#RETURNS#PROCESSIMPORT
 */
const processImport = (
  importPath,
  { currentDir, cwd, visitedSet, depth, maxDepth }
) => {
  // Resolves the provided import path.
  const resolvedPath = resolveImportingPath(currentDir, importPath, cwd);
  // Returns early to skip processing on unresolved paths.
  if (!resolvedPath) return { ...successTrue, visitedSet };

  // Establishes the options for the next round of findAllImports.
  const findAllImportsOptions = makeFindAllImportsOptions({
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Runs findAllImports on the imported path resolved, thus recursively.
  const findAllImportsResults = /** @type {FindAllImportsResults} */ (
    findAllImports(resolvedPath, findAllImportsOptions)
  );
  // Returns the results of the embedded round of `findAllImports`.
  return findAllImportsResults;
};

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
  // Begins with validating filePath and options.
  const validateFilePathAndOptionsResults = validateFilePathAndOptions(
    filePath,
    { cwd, visitedSet, depth, maxDepth }
  );
  if (!validateFilePathAndOptionsResults.success)
    return validateFilePathAndOptionsResults;

  // Retrieves the file path's SourceCode object from the validated results.
  const { sourceCode } = validateFilePathAndOptionsResults;

  // Returns the existing set directly if a path has already been visited.
  if (visitedSetHasPreviousVisit(visitedSet, filePath)) {
    return { ...successTrue, visitedSet };
  }

  // Updates the visited set.
  updateVisitedSet(visitedSet, filePath);

  // Makes the joint settings for the conditional calls of processImport.
  const processImportSettings = makeProcessImportSettings(filePath, {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Processes all top-level imports.
  for (const node of sourceCode.ast.body) {
    // ES Modules (import x from 'y')
    if (nodeIsImportDeclaration(node)) {
      const processImportResults = processImport(
        node.source.value,
        processImportSettings
      );
      if (!processImportResults.success) return processImportResults;
    }

    // CommonJS (require('x'))
    if (nodeIsRequireCall(node)) {
      const processImportResults = processImport(
        node.expression.arguments[0].value,
        processImportSettings
      );
      if (!processImportResults.success) return processImportResults;
    }
  }

  return { ...successTrue, visitedSet };
};

/* findAllImportsWithCallbackSync */

/**
 * $COMMENT#JSDOC#DEFINITIONS#PROCESSIMPORT
 * @param {string} importPath $COMMENT#JSDOC#PARAMS#IMPORTPATH
 * @param {SynchronousCallbackConfig} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGSYNCSHORT
 * @param {Object} settings $COMMENT#JSDOC#PARAMS#SETTINGS
 * @param {string} settings.currentDir $COMMENT#JSDOC#PARAMS#CURRENTDIRSETTING
 * @param {string} settings.cwd $COMMENT#JSDOC#PARAMS#CWDSETTING
 * @param {Set<string>} settings.visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING
 * @param {number} settings.depth $COMMENT#JSDOC#PARAMS#DEPTHSETTING
 * @param {number} settings.maxDepth $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING
 * @returns $COMMENT#JSDOC#RETURNS#PROCESSIMPORT
 */
const processImportWithCallbackSync = (
  importPath,
  callbackConfig,
  { currentDir, cwd, visitedSet, depth, maxDepth }
) => {
  // Resolves the provided import path.
  const resolvedPath = resolveImportingPath(currentDir, importPath, cwd);
  // Returns early to skip processing on unresolved paths.
  if (!resolvedPath)
    return {
      ...successTrue,
      visitedSet,
      accumulator: callbackConfig.accumulator,
    };

  // Establishes the options for the next round of findAllImports.
  const findAllImportsOptions = makeFindAllImportsOptions({
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Runs findAllImports on the imported path resolved, thus recursively.
  const findAllImportsResults =
    /** @type {FindAllImportsResultsWithAccumulator} */ (
      findAllImportsWithCallbackSync(
        resolvedPath,
        callbackConfig,
        findAllImportsOptions
      )
    );
  // Returns the results of the embedded round of `findAllImports`.
  return findAllImportsResults;
};

/**
 * $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTSWITHCALLBACKSYNC
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {SynchronousCallbackConfig} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGSYNCLONG
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
 */
export const findAllImportsWithCallbackSync = (
  filePath,
  callbackConfig,
  {
    cwd = process.cwd(),
    visitedSet = new Set(),
    depth = 0,
    maxDepth = 100,
  } = {}
) => {
  // Begins with validating filePath and options.
  const validateFilePathAndOptionsResults = validateFilePathAndOptions(
    filePath,
    { cwd, visitedSet, depth, maxDepth }
  );
  if (!validateFilePathAndOptionsResults.success)
    return validateFilePathAndOptionsResults;

  // Retrieves the file path's SourceCode object from the validated results.
  const { sourceCode } = validateFilePathAndOptionsResults;

  // Also begins with validating callbackConfig.
  const validateSynchronousCallbackConfigResults =
    validateCallbackConfig(callbackConfig);
  if (!validateSynchronousCallbackConfigResults.success)
    return validateSynchronousCallbackConfigResults;

  // Returns the existing set directly if a path has already been visited.
  if (visitedSetHasPreviousVisit(visitedSet, filePath)) {
    return {
      ...successTrue,
      visitedSet,
      accumulator: callbackConfig.accumulator,
    };
  }

  // Updates the visited set.
  updateVisitedSet(visitedSet, filePath);

  // Addresses the callback.
  try {
    callbackConfig.callback(filePath, sourceCode, callbackConfig.accumulator);
  } catch (e) {
    return makeSuccessFalseTypeError(
      `ERROR. Callback error in ${filePath}. \nError: \n${e}`
    );
  }

  // Makes the joint settings for the conditional calls of processImport.
  const processImportSettings = makeProcessImportSettings(filePath, {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Processes all top-level imports.
  for (const node of sourceCode.ast.body) {
    // ES Modules (import x from 'y')
    if (nodeIsImportDeclaration(node)) {
      const processImportResults = processImportWithCallbackSync(
        node.source.value,
        callbackConfig,
        processImportSettings
      );
      if (!processImportResults.success) return processImportResults;
    }

    // CommonJS (require('x'))
    if (nodeIsRequireCall(node)) {
      const processImportResults = processImportWithCallbackSync(
        node.expression.arguments[0].value,
        callbackConfig,
        processImportSettings
      );
      if (!processImportResults.success) return processImportResults;
    }
  }

  return {
    ...successTrue,
    visitedSet,
    accumulator: callbackConfig.accumulator,
  };
};

/* findAllImportsWithCallbackAsync */

/**
 * $COMMENT#JSDOC#DEFINITIONS#PROCESSIMPORT
 * @param {string} importPath $COMMENT#JSDOC#PARAMS#IMPORTPATH
 * @param {AsynchronousCallbackConfig} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGASYNCSHORT
 * @param {Object} settings $COMMENT#JSDOC#PARAMS#SETTINGS
 * @param {string} settings.currentDir $COMMENT#JSDOC#PARAMS#CURRENTDIRSETTING
 * @param {string} settings.cwd $COMMENT#JSDOC#PARAMS#CWDSETTING
 * @param {Set<string>} settings.visitedSet $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING
 * @param {number} settings.depth $COMMENT#JSDOC#PARAMS#DEPTHSETTING
 * @param {number} settings.maxDepth $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING
 * @returns $COMMENT#JSDOC#RETURNS#PROCESSIMPORT
 */
const processImportWithCallbackAsync = async (
  importPath,
  callbackConfig,
  { currentDir, cwd, visitedSet, depth, maxDepth }
) => {
  // Resolves the provided import path.
  const resolvedPath = resolveImportingPath(currentDir, importPath, cwd);
  // Returns early to skip processing on unresolved paths.
  if (!resolvedPath)
    return {
      ...successTrue,
      visitedSet,
      accumulator: callbackConfig.accumulator,
    };

  // Establishes the options for the next round of findAllImports.
  const findAllImportsOptions = makeFindAllImportsOptions({
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Runs findAllImports on the imported path resolved, thus recursively.
  const findAllImportsResults =
    /** @type {FindAllImportsResultsWithAccumulator} */ (
      await findAllImportsWithCallbackAsync(
        resolvedPath,
        callbackConfig,
        findAllImportsOptions
      )
    );
  // Returns the results of the embedded round of `findAllImports`.
  return findAllImportsResults;
};

/**
 * $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTSWITHCALLBACKASYNC
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {AsynchronousCallbackConfig} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGASYNCLONG
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
 */
export const findAllImportsWithCallbackAsync = async (
  filePath,
  callbackConfig,
  {
    cwd = process.cwd(),
    visitedSet = new Set(),
    depth = 0,
    maxDepth = 100,
  } = {}
) => {
  // Begins with validating filePath and options.
  const validateFilePathAndOptionsResults = validateFilePathAndOptions(
    filePath,
    { cwd, visitedSet, depth, maxDepth }
  );
  if (!validateFilePathAndOptionsResults.success)
    return validateFilePathAndOptionsResults;

  // Retrieves the file path's SourceCode object from the validated results.
  const { sourceCode } = validateFilePathAndOptionsResults;

  // Also begins with validating callbackConfig.
  const validateAsynchronousCallbackConfigResults =
    validateCallbackConfig(callbackConfig);
  if (!validateAsynchronousCallbackConfigResults.success)
    return validateAsynchronousCallbackConfigResults;

  // Returns the existing set directly if a path has already been visited.
  if (visitedSetHasPreviousVisit(visitedSet, filePath)) {
    return {
      ...successTrue,
      visitedSet,
      accumulator: callbackConfig.accumulator,
    };
  }

  // Updates the visited set.
  updateVisitedSet(visitedSet, filePath);

  // Addresses the callback.
  try {
    await callbackConfig.callback(
      filePath,
      sourceCode,
      callbackConfig.accumulator
    );
  } catch (e) {
    return makeSuccessFalseTypeError(
      `ERROR. Callback error in ${filePath}. \nError: \n${e}`
    );
  }

  // Makes the joint settings for the conditional calls of processImport.
  const processImportSettings = makeProcessImportSettings(filePath, {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Processes all top-level imports.
  for (const node of sourceCode.ast.body) {
    // ES Modules (import x from 'y')
    if (nodeIsImportDeclaration(node)) {
      const processImportResults = await processImportWithCallbackAsync(
        node.source.value,
        callbackConfig,
        processImportSettings
      );
      if (!processImportResults.success) return processImportResults;
    }

    // CommonJS (require('x'))
    if (nodeIsRequireCall(node)) {
      const processImportResults = await processImportWithCallbackAsync(
        node.expression.arguments[0].value,
        callbackConfig,
        processImportSettings
      );
      if (!processImportResults.success) return processImportResults;
    }
  }

  return {
    ...successTrue,
    visitedSet,
    accumulator: callbackConfig.accumulator,
  };
};

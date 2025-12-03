import { resolveImportingPath } from "resolve-importing-path";

import { successTrue } from "./constants/bases.js";
import {
  makeSuccessFalseTypeError,
  validateFilePathAndOptions,
  validateCallbackConfig,
  updateVisitedSet,
  makeProcessImportSettings,
  makeFindAllImportsOptions,
  visitedSetHasPreviousVisit,
  nodeIsImportDeclaration,
  nodeIsImportExpression,
  nodeIsRequireCall,
} from "./utilities/helpers.js";

/**
 * @typedef {import("../types/typedefs.js").FindAllImportsResults} FindAllImportsResults
 * @typedef {import("../types/typedefs.js").FindAllImportsResultsWithAccumulator} FindAllImportsResultsWithAccumulator
 * @typedef {import("../types/typedefs.js").SynchronousCallbackConfig} SynchronousCallbackConfig
 * @typedef {import("../types/typedefs.js").AsynchronousCallbackConfig} AsynchronousCallbackConfig
 */

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

    // now with dynamic imports since same flow as ImportDeclaration
    if (nodeIsImportExpression(node)) {
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

    // now with dynamic imports since same flow as ImportDeclaration
    if (nodeIsImportExpression(node)) {
      const processImportResults = processImportWithCallbackSync(
        node.source.value,
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

    // now with dynamic imports since same flow as ImportDeclaration
    if (nodeIsImportExpression(node)) {
      const processImportResults = await processImportWithCallbackAsync(
        node.source.value,
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

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
 * Processes recursively and resolves a single import path. (Unlike `findAllImports`, here `currentDir`, `cwd`, `visitedSet`, `depth`, and `maxDepth` aren't options because they are mandatory and not pre-parameterized.)
 * @param {string} importPath The import path currently being addressed.
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.currentDir The directory containing the import path currently being addressed.
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns The results of the embedded round of `findAllImports`, since `findAllImports`'s recursion happens within `processImport`.
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
 * Processes recursively and resolves a single import path. (Unlike `findAllImports`, here `currentDir`, `cwd`, `visitedSet`, `depth`, and `maxDepth` aren't options because they are mandatory and not pre-parameterized.)
 * @param {string} importPath The import path currently being addressed.
 * @param {SynchronousCallbackConfig} callbackConfig The configuration of a synchronous-only callback function provided to `findAllImportsWithCallbackSync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties.
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.currentDir The directory containing the import path currently being addressed.
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns The results of the embedded round of `findAllImports`, since `findAllImports`'s recursion happens within `processImport`.
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
 * Finds all import paths recursively related to a given file path, with a given callback function running on every file path encountered, synchronously.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {SynchronousCallbackConfig} callbackConfig The configuration of a synchronous-only callback function provided to `findAllImportsWithCallbackSync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackSync`'s recursion, and accesses three arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion.
 * @param {Object} options The additional options as follows:
 * @param {string} [options.cwd] The current working directory, set as `process.cwd()` by default.
 * @param {Set<string>} [options.visitedSet] The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {number} [options.depth] The current depth of the recursion, instantiated at `0` by default.
 * @param {number} [options.maxDepth] The maximum depth allowed for the recursion, instantiated at `100` by default.
 * @returns The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`).
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
 * Processes recursively and resolves a single import path. (Unlike `findAllImports`, here `currentDir`, `cwd`, `visitedSet`, `depth`, and `maxDepth` aren't options because they are mandatory and not pre-parameterized.)
 * @param {string} importPath The import path currently being addressed.
 * @param {AsynchronousCallbackConfig} callbackConfig The configuration of an asynchronous-only callback function provided to `findAllImportsWithCallbackAsync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties.
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.currentDir The directory containing the import path currently being addressed.
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns The results of the embedded round of `findAllImports`, since `findAllImports`'s recursion happens within `processImport`.
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
 * Finds all import paths recursively related to a given file path, with a given callback function running on every file path encountered, asynchronously.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {AsynchronousCallbackConfig} callbackConfig The configuration of an asynchronous-only callback function provided to `findAllImportsWithCallbackAsync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackAsync`'s recursion, and accesses three arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion.
 * @param {Object} options The additional options as follows:
 * @param {string} [options.cwd] The current working directory, set as `process.cwd()` by default.
 * @param {Set<string>} [options.visitedSet] The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {number} [options.depth] The current depth of the recursion, instantiated at `0` by default.
 * @param {number} [options.maxDepth] The maximum depth allowed for the recursion, instantiated at `100` by default.
 * @returns The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`).
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

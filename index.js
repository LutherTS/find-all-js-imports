import fs from "fs";
import path from "path";

import { resolveImportingPath } from "resolve-importing-path";
import { getSourceCodeFromFilePath } from "get-sourcecode-from-file-path";

/**
 * @typedef {"error" | "warning"} ErrorOrWarning
 * @typedef {import('eslint').SourceCode} SourceCode
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

/* helpers
 * First, make sure they work.
 * Second, make params' types.
 * Third, make their JSDoc.
 * Fourth, make their own files in a new library/ directory.
 */

const makeIsSupposedToBe = (paramName, paramKind) =>
  `${paramName} is supposed to be ${paramKind}.`;

export const validateFilePathAndOptions = (
  filePath,
  { cwd, visitedSet, depth, maxDepth }
) => {
  // Begins with roughly validating filePath and options.
  if (typeof filePath !== "string") {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. ${makeIsSupposedToBe("filePath", "a string")}`,
        },
      ],
    };
  }
  if (typeof cwd !== "string") {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. ${makeIsSupposedToBe("cwd", "a string")}`,
        },
      ],
    };
  }
  if (visitedSet instanceof Set === false) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. ${makeIsSupposedToBe("visitedSet", "a Set")}`,
        },
      ],
    };
  }
  if (typeof depth !== "number") {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. ${makeIsSupposedToBe("depth", "a number")}`,
        },
      ],
    };
  }
  if (typeof maxDepth !== "number") {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. ${makeIsSupposedToBe("maxDepth", "a number")}`,
        },
      ],
    };
  }

  // Then validates filePath and options with zod.
  // (To be done.)
  const visitedSetManuallyTyped = /** @type {Set<string>} */ (visitedSet); // manually typing visitedSet temporarily before implementing zod

  // Fails early if max depth is recursively reached.
  if (depth > maxDepth) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. Max depth ${maxDepth} reached at ${filePath}.`,
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
          ...typeError,
          message: `ERROR. File not found at ${filePath}.`,
        },
      ],
    };
  }

  // Parses the file's source code AST.
  const sourceCode = getSourceCodeFromFilePath(filePath);
  // Fails early if there is no AST.
  if (!sourceCode?.ast) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. Failed to parse AST for ${filePath} somehow.`,
        },
      ],
    };
  }

  return {
    ...successTrue,
    filePath,
    cwd,
    visitedSet: visitedSetManuallyTyped,
    depth,
    maxDepth,
    sourceCode,
  };
};

/**
 *
 * @param {unknown} callbackConfig
 * @returns
 */
export const validateCallbackConfig = (callbackConfig) => {
  // First, begins by checking the integrity of callbackConfig.
  // Eventually, I will be doing this with zod, but for now I'm just making sure that callbackConfig is an object. For example, via zod, I'll have to make sure that callbackConfig.callback is strictly synchronous or asynchronous.
  if (
    !callbackConfig ||
    typeof callbackConfig !== "object" ||
    Array.isArray(callbackConfig)
  ) {
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message:
            "ERROR. Invalid callbackConfig format. The callbackConfig should be an object.",
        },
      ],
    };
  }

  return {
    ...successTrue,
    callbackConfig,
  };
};

export const validateSynchronousCallbackConfig = (callbackConfig) => {
  // Begins with roughly validating callbackConfig.
  const validateCallbackConfigResults = validateCallbackConfig(callbackConfig);

  if (!validateCallbackConfigResults.success)
    return validateCallbackConfigResults;
  const { callbackConfig: synchronousCallbackConfig } =
    validateCallbackConfigResults;

  // Then validates synchronousCallbackConfig with zod.
  // (To be done.)

  return {
    ...successTrue,
    synchronousCallbackConfig,
  };
};

export const validateAsynchronousCallbackConfig = async (callbackConfig) => {
  // Begins with roughly validating callbackConfig.
  const validateCallbackConfigResults = validateCallbackConfig(callbackConfig);

  if (!validateCallbackConfigResults.success)
    return validateCallbackConfigResults;
  const { callbackConfig: asynchronousCallbackConfig } =
    validateCallbackConfigResults;

  // Then validates asynchronousCallbackConfig with zod.
  // (To be done.)

  return {
    ...successTrue,
    asynchronousCallbackConfig,
  };
};

/**
 *
 * @param {Set<string>} visitedSet The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @returns
 */
export const updateVisitedSet = (visitedSet, filePath) => {
  visitedSet.add(filePath);
};

/**
 * $
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.currentDir The directory containing the import path currently being addressed.
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns $
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
 * $
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {Object} settings The required settings as follows:
 * @param {string} settings.cwd The current working directory.
 * @param {Set<string>} settings.visitedSet The set of strings tracking the import paths that have already been visited.
 * @param {number} settings.depth The current depth of the recursion.
 * @param {number} settings.maxDepth The maximum depth allowed for the recursion.
 * @returns $
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
 *
 * @param {Set<string>} visitedSet The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @returns
 */
export const visitedSetHasPreviousVisit = (visitedSet, filePath) =>
  visitedSet.has(filePath);

export const nodeIsImportDeclaration = (node) =>
  node.type === "ImportDeclaration";

export const nodeIsRequireCall = (node) =>
  node.type === "ExpressionStatement" &&
  node.expression.type === "CallExpression" &&
  node.expression.callee.name === "require" &&
  node.expression.arguments[0]?.type === "Literal";

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
  const { sourceCode } = validateFilePathAndOptionsResults;
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
 * @param {SynchronousCallbackConfig} callbackConfig The configuration of a synchronous-only callback function provided to `findAllImportsWithCallbackSync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackSync`'s recursion, and accesses five arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion.
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

  // Also begins with validating callbackConfig.
  const validateSynchronousCallbackConfigResults =
    validateSynchronousCallbackConfig(callbackConfig);
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
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. Callback error in ${filePath}. \nError: \n${e}`,
        },
      ],
    };
  }

  // Makes the joint settings for the conditional calls of processImport.
  const processImportSettings = makeProcessImportSettings(filePath, {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Processes all top-level imports.
  const { sourceCode } = validateFilePathAndOptionsResults;
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
 * @param {AsynchronousCallbackConfig} callbackConfig The configuration of an asynchronous-only callback function provided to `findAllImportsWithCallbackAsync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackAsync`'s recursion, and accesses five arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion.
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

  // Also begins with validating callbackConfig.
  const validateAsynchronousCallbackConfigResults =
    await validateAsynchronousCallbackConfig(callbackConfig);
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
    return {
      ...successFalse,
      errors: [
        {
          ...typeError,
          message: `ERROR. Callback error in ${filePath}. \nError: \n${e}`,
        },
      ],
    };
  }

  // Makes the joint settings for the conditional calls of processImport.
  const processImportSettings = makeProcessImportSettings(filePath, {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  });

  // Processes all top-level imports.
  const { sourceCode } = validateFilePathAndOptionsResults;
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

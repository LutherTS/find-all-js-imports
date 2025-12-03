import { SourceCode } from "eslint";

type FindAllImportsResults =
  | {
      success: false;
      errors: Array<{ message: string; type: "error" }>;
    }
  | {
      success: true;
      visitedSet: Set<string>;
    };

type FindAllImportsResultsWithAccumulator =
  | {
      success: false;
      errors: Array<{ message: string; type: "error" }>;
    }
  | {
      success: true;
      visitedSet: Set<string>;
      accumulator: unknown;
    };

type SynchronousCallbackConfig = {
  callback: (
    filePath: string,
    sourceCode: SourceCode,
    accumulator: unknown
  ) => void;
  accumulator: unknown;
};

type AsynchronousCallbackConfig = {
  callback: (
    filePath: string,
    sourceCode: SourceCode,
    accumulator: unknown
  ) => Promise<void>;
  accumulator: unknown;
};

// must be manually maintained

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
export const findAllImports: (
  filePath: string,
  {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  }?: {
    cwd?: string | undefined;
    visitedSet?: Set<string> | undefined;
    depth?: number | undefined;
    maxDepth?: number | undefined;
  }
) =>
  | {
      success: false;
      errors: Array<{ message: string; type: "error" }>;
    }
  | {
      success: true;
      visitedSet: Set<string>;
    };

/**
 * Finds all import paths recursively related to a given file path, with a given callback function running on every file path encountered, synchronously.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {{callback: (filePath: string, sourceCode: SourceCode, accumulator: unknown) => void; accumulator: unknown}} callbackConfig The configuration of a synchronous-only callback function provided to `findAllImportsWithCallbackSync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackSync`'s recursion, and accesses three arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion.
 * @param {Object} options The additional options as follows:
 * @param {string} [options.cwd] The current working directory, set as `process.cwd()` by default.
 * @param {Set<string>} [options.visitedSet] The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {number} [options.depth] The current depth of the recursion, instantiated at `0` by default.
 * @param {number} [options.maxDepth] The maximum depth allowed for the recursion, instantiated at `100` by default.
 * @returns The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`).
 */
export const findAllImportsWithCallbackSync: (
  filePath: string,
  callbackConfig: {
    callback: (
      filePath: string,
      sourceCode: SourceCode,
      accumulator: unknown
    ) => void;
    accumulator: unknown;
  },
  {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  }?: {
    cwd?: string | undefined;
    visitedSet?: Set<string> | undefined;
    depth?: number | undefined;
    maxDepth?: number | undefined;
  }
) =>
  | {
      success: false;
      errors: Array<{ message: string; type: "error" }>;
    }
  | {
      success: true;
      visitedSet: Set<string>;
      accumulator: unknown;
    };

/**
 * Finds all import paths recursively related to a given file path, with a given callback function running on every file path encountered, asynchronously.
 * @param {string} filePath The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.
 * @param {{callback: (filePath: string, sourceCode: SourceCode, accumulator: unknown) => Promise<void>; accumulator: unknown;}} callbackConfig The configuration of an asynchronous-only callback function provided to `findAllImportsWithCallbackAsync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackAsync`'s recursion, and accesses three arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion.
 * @param {Object} options The additional options as follows:
 * @param {string} [options.cwd] The current working directory, set as `process.cwd()` by default.
 * @param {Set<string>} [options.visitedSet] The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.
 * @param {number} [options.depth] The current depth of the recursion, instantiated at `0` by default.
 * @param {number} [options.maxDepth] The maximum depth allowed for the recursion, instantiated at `100` by default.
 * @returns The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`).
 */
export const findAllImportsWithCallbackAsync: (
  filePath: string,
  callbackConfig: {
    callback: (
      filePath: string,
      sourceCode: SourceCode,
      accumulator: unknown
    ) => Promise<void>;
    accumulator: unknown;
  },
  {
    cwd,
    visitedSet,
    depth,
    maxDepth,
  }?: {
    cwd?: string | undefined;
    visitedSet?: Set<string> | undefined;
    depth?: number | undefined;
    maxDepth?: number | undefined;
  }
) => Promise<
  | {
      success: false;
      errors: Array<{ message: string; type: "error" }>;
    }
  | {
      success: true;
      visitedSet: Set<string>;
      accumulator: unknown;
    }
>;

/**
 * ESLint SourceCode type accessed without needing to install ESLint at the point of consumption. (`SourceCode.ast` for AST, `SourceCode.getAllComments()` for all comments.)
 */
export type SourceCode = SourceCode;

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
      success: true;
      visitedSet: Set<string>;
    }
  | {
      success: false;
      errors: Array<{
        message: string;
        type: "warning";
      }>;
    };

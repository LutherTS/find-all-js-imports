/**
 * Now currently unused. All functions now return only type "error" for error handling.
 * @typedef {"error" | "warning"} ErrorOrWarning
 */

/**
 * @typedef {import('eslint').SourceCode} SourceCode
 *
 * @typedef {import('@typescript-eslint/types').TSESTree.Program['body'][number]} ASTBodyNode
 */

/**
 * @typedef {{
 *   success: false;
 *   errors: Array<{ message: string; type: "error";}>;
 * } | {
 *   success: true;
 *   visitedSet: Set<string>;
 * }} FindAllImportsResults
 */

/**
 * @typedef {{
 *   success: false;
 *   errors: Array<{ message: string; type: "error";}>;
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

export {}; // Makes the file a module

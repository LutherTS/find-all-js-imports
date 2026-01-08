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
 * $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTS
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
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
 * $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTSWITHCALLBACKSYNC
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {{callback: (filePath: string, sourceCode: SourceCode, accumulator: unknown) => void; accumulator: unknown}} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGSYNCLONG
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
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
 * $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTSWITHCALLBACKASYNC
 * @param {string} filePath $COMMENT#JSDOC#PARAMS#FILEPATH
 * @param {{callback: (filePath: string, sourceCode: SourceCode, accumulator: unknown) => Promise<void>; accumulator: unknown;}} callbackConfig $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGASYNCLONG
 * @param {Object} options $COMMENT#JSDOC#PARAMS#OPTIONS
 * @param {string} [options.cwd] $COMMENT#JSDOC#PARAMS#CWDOPTION
 * @param {Set<string>} [options.visitedSet] $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
 * @param {number} [options.depth] $COMMENT#JSDOC#PARAMS#DEPTHOPTION
 * @param {number} [options.maxDepth] $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
 * @returns $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
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
 * $COMMENT#JSDOC#TYPES#SOURCECODE
 */
export type SourceCode = SourceCode;

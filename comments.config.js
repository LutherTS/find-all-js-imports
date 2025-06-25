const data = {
  jsDoc: Object.freeze({
    definitions: Object.freeze({
      findAllImports:
        "Finds all import paths recursively related to a given file path.", // $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTS
      processImport:
        "Processes recursively and resolves a single import path. (Unlike `findAllImports`, here `currentDir`, `cwd`, `visitedSet`, `depth`, and `maxDepth` aren't options because they are mandatory and not pre-parameterized.)", // $COMMENT#JSDOC#DEFINITIONS#PROCESSIMPORT
    }),
    params: Object.freeze({
      filePath:
        "The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file.", // $COMMENT#JSDOC#PARAMS#FILEPATH
      cwdOption:
        "The current working directory, set as `process.cwd()` by default.", // $COMMENT#JSDOC#PARAMS#CWDOPTION
      visitedSetOption:
        "The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default.", // $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION
      depthOption:
        "The current depth of the recursion, instantiated at `0` by default.", // $COMMENT#JSDOC#PARAMS#DEPTHOPTION
      maxDepthOption:
        "The maximum depth allowed for the recursion, instantiated at `100` by default.", // $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION
      importPath: "The import path currently being addressed.", // $COMMENT#JSDOC#PARAMS#IMPORTPATH
      currentDirSetting:
        "The directory containing the import path currently being addressed.", // $COMMENT#JSDOC#PARAMS#CURRENTDIRSETTING
      cwdSetting: "The current working directory.", // $COMMENT#JSDOC#PARAMS#CWDSETTING
      visitedSetSetting:
        "The set of strings tracking the import paths that have already been visited.", // $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING
      depthSetting: "The current depth of the recursion.", // $COMMENT#JSDOC#PARAMS#DEPTHSETTING
      maxDepthSetting: "The maximum depth allowed for the recursion.", // $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING
      options: "The additional options as follows:", // $COMMENT#JSDOC#PARAMS#OPTIONS
      settings: "The required settings as follows:", // $COMMENT#JSDOC#PARAMS#SETTINGS
    }),
    returns: Object.freeze({
      findAllImports:
        "The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`).", // $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS
      processImport:
        "The results of the embedded round of `findAllImports`, since `findAllImports`'s recursion happens within `processImport`.", // $COMMENT#JSDOC#RETURNS#PROCESSIMPORT
    }),
  }),
};

const ignores = [];

const config = {
  data,
  ignores,
};

export default config;

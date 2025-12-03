const data = {
  jsDoc: Object.freeze({
    definitions: Object.freeze({
      findAllImports:
        "Finds all import paths recursively related to a given file path." /* $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTS */,
      processImport:
        "Processes recursively and resolves a single import path. (Unlike `findAllImports`, here `currentDir`, `cwd`, `visitedSet`, `depth`, and `maxDepth` aren't options because they are mandatory and not pre-parameterized.)" /* $COMMENT#JSDOC#DEFINITIONS#PROCESSIMPORT */,
      makeIsSupposedToBe:
        "Makes a standardized string for `typeof` errors, `instanceof` errors and the likes." /* $COMMENT#JSDOC#DEFINITIONS#MAKEISSUPPOSEDTOBE */,
      makeSuccessFalseTypeError:
        'Makes a `{success: false}` object with a single error in its errors array of `{type: "error"}` based on the message it is meant to display.' /* $COMMENT#JSDOC#DEFINITIONS#MAKESUCCESSFALSETYPEERROR */,
      validateFilePathAndOptions:
        "Validates filePath and options in `findAllImports` functions, both structurally and functionally." /* $COMMENT#JSDOC#DEFINITIONS#VALIDATEFILEPATHANDOPTIONS */,
      validateCallbackConfig:
        "Validates the callbackConfig passed, ensures that it is an object, that its property `callback` is a function, and ascertains that its property `accumulator` is unknown." /* $COMMENT#JSDOC#DEFINITIONS#VALIDATECALLBACKCONFIG */,
      updateVisitedSet:
        "Updates visitedSet with the current filePath once all validations have been successful, thus including it in the list of the original file path and all of its recursive imports." /* $COMMENT#JSDOC#DEFINITIONS#UPDATEVISITEDSET */,
      makeProcessImportSettings:
        "Makes the settings of the next round of `processImport`." /* $COMMENT#JSDOC#DEFINITIONS#MAKEPROCESSIMPORTSETTINGS */,
      makeFindAllImportsOptions:
        'Makes the options of the next round of `findAllImports`. (Given that they are required, they are no longer "options" per se and are therefore considered here as "settings".)' /* $COMMENT#JSDOC#DEFINITIONS#MAKEFINDALLIMPORTSOPTIONS */,
      visitedSetHasPreviousVisit:
        "Tells if the current file path has already been visited within the current recursion." /* $COMMENT#JSDOC#DEFINITIONS#VISITEDSETHASPREVIOUSVISIT */,
      nodeIsImportDeclaration:
        "Tells if the node being walked through corresponds to an ES Module import." /* $COMMENT#JSDOC#DEFINITIONS#NODEISIMPORTDECLARATION */,
      nodeIsImportExpression:
        "Tells if the node being walked through corresponds to a dynamic import." /* $COMMENT#JSDOC#DEFINITIONS#NODEISIMPORTEXPRESSION */,
      nodeIsRequireCall:
        "Tells if the node being walked through corresponds to a CommonJS require." /* $COMMENT#JSDOC#DEFINITIONS#NODEISREQUIRECALL */,
      findAllImportsWithCallbackSync:
        "Finds all import paths recursively related to a given file path, with a given callback function running on every file path encountered, synchronously." /* $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTSWITHCALLBACKSYNC */,
      findAllImportsWithCallbackAsync:
        "Finds all import paths recursively related to a given file path, with a given callback function running on every file path encountered, asynchronously." /* $COMMENT#JSDOC#DEFINITIONS#FINDALLIMPORTSWITHCALLBACKASYNC */,
    }),
    params: Object.freeze({
      filePath:
        "The absolute path of the file whose imports are being recursively found, such as that of a project's `comments.config.js` file." /* $COMMENT#JSDOC#PARAMS#FILEPATH */,
      cwdOption:
        "The current working directory, set as `process.cwd()` by default." /* $COMMENT#JSDOC#PARAMS#CWDOPTION */,
      visitedSetOption:
        "The set of strings tracking the import paths that have already been visited, instantiated as a `new Set()` by default." /* $COMMENT#JSDOC#PARAMS#VISITEDSETOPTION */,
      depthOption:
        "The current depth of the recursion, instantiated at `0` by default." /* $COMMENT#JSDOC#PARAMS#DEPTHOPTION */,
      maxDepthOption:
        "The maximum depth allowed for the recursion, instantiated at `100` by default." /* $COMMENT#JSDOC#PARAMS#MAXDEPTHOPTION */,
      importPath:
        "The import path currently being addressed." /* $COMMENT#JSDOC#PARAMS#IMPORTPATH */,
      currentDirSetting:
        "The directory containing the import path currently being addressed." /* $COMMENT#JSDOC#PARAMS#CURRENTDIRSETTING */,
      cwdSetting:
        "The current working directory." /* $COMMENT#JSDOC#PARAMS#CWDSETTING */,
      visitedSetSetting:
        "The set of strings tracking the import paths that have already been visited." /* $COMMENT#JSDOC#PARAMS#VISITEDSETSETTING */,
      depthSetting:
        "The current depth of the recursion." /* $COMMENT#JSDOC#PARAMS#DEPTHSETTING */,
      maxDepthSetting:
        "The maximum depth allowed for the recursion." /* $COMMENT#JSDOC#PARAMS#MAXDEPTHSETTING */,
      options:
        "The additional options as follows:" /* $COMMENT#JSDOC#PARAMS#OPTIONS */,
      settings:
        "The required settings as follows:" /* $COMMENT#JSDOC#PARAMS#SETTINGS */,
      paramName:
        "The string for the param's name." /* $COMMENT#JSDOC#PARAMS#PARAMNAME */,
      paramKind:
        "The string for the param's kind." /* $COMMENT#JSDOC#PARAMS#PARAMKIND */,
      message:
        "The human-readable message of the error." /* $COMMENT#JSDOC#PARAMS#MESSAGE */,
      callbackConfig:
        "The configuration of a callback function provided to a `findAllImports` function, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties." /* $COMMENT#JSDOC#PARAMS#CALLBACKCONFIG */,
      node: "The current node of the current file path's AST (Abstract Syntax Tree)." /* $COMMENT#JSDOC#PARAMS#NODE */,
      callbackConfigSyncShort:
        "The configuration of a synchronous-only callback function provided to `findAllImportsWithCallbackSync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties." /* $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGSYNCSHORT */,
      callbackConfigSyncLong:
        "The configuration of a synchronous-only callback function provided to `findAllImportsWithCallbackSync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackSync`'s recursion, and accesses three arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion." /* $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGSYNCLONG */,
      callbackConfigAsyncShort:
        "The configuration of an asynchronous-only callback function provided to `findAllImportsWithCallbackAsync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties." /* $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGASYNCSHORT */,
      callbackConfigAsyncLong:
        "The configuration of an asynchronous-only callback function provided to `findAllImportsWithCallbackAsync`, with the callback itself (`callbackConfig.callback`) and its accumulator (`callbackConfig.accumulator`) as properties. The callback runs on every file path found, before `findAllImportsWithCallbackAsync`'s recursion, and accesses three arguments in the following order: `filePath` which is the current file's path, `sourceCode` which is the current file's SourceCode object, and `accumulator` which is the accumulator for the callback through the recursion." /* $COMMENT#JSDOC#PARAMS#CALLBACKCONFIGASYNCLONG */,
    }),
    returns: Object.freeze({
      findAllImports:
        "The complete set of strings of import paths recursively related to the given file path in a success object (`success: true`). Errors are bubbled up during failures in a failure object (`success: false`)." /* $COMMENT#JSDOC#RETURNS#FINDALLIMPORTS */,
      processImport:
        "The results of the embedded round of `findAllImports`, since `findAllImports`'s recursion happens within `processImport`." /* $COMMENT#JSDOC#RETURNS#PROCESSIMPORT */,
      makeIsSupposedToBe:
        "[paramName] is supposed to be [paramKind]." /* $COMMENT#JSDOC#RETURNS#MAKEISSUPPOSEDTOBE */,
      makeSuccessFalseTypeError:
        'A `{success: false}` object with a single error in its error array of `{type: "error"}`.' /* $COMMENT#JSDOC#RETURNS#MAKESUCCESSFALSETYPEERROR */,
      validate:
        "A `{success: false}` object along with its errors when an issue is encountered, used to stop the process while notifying on the reasons why it stopped at the point of consumption." /* $COMMENT#JSDOC#RETURNS#VALIDATE */,
      makeProcessImportSettings:
        "The settings object of the next round of `processImport`." /* $COMMENT#JSDOC#RETURNS#MAKEPROCESSIMPORTSETTINGS */,
      makeFindAllImportsOptions:
        "The options object of the next round of `findAllImports`." /* $COMMENT#JSDOC#RETURNS#MAKEFINDALLIMPORTSOPTIONS */,
      visitedSetHasPreviousVisit:
        "`true` if the file path has been visited before, `false` if it hasn't." /* $COMMENT#JSDOC#RETURNS#VISITEDSETHASPREVIOUSVISIT */,
      nodeIsImportDeclaration:
        "`true` if the node is an `import`, `false` if it isn't." /* $COMMENT#JSDOC#RETURNS#NODEISIMPORTDECLARATION */,
      nodeIsImportExpression:
        "`true` if the node is an `import()`, `false` if it isn't." /* $COMMENT#JSDOC#RETURNS#NODEISIMPORTEXPRESSION */,
      nodeIsRequireCall:
        "`true` if the node is a `require`, `false` if it isn't." /* $COMMENT#JSDOC#RETURNS#NODEISREQUIRECALL */,
    }),
    types: Object.freeze({
      sourceCode:
        "ESLint SourceCode type accessed without needing to install ESLint at the point of consumption. (`SourceCode.ast` for AST, `SourceCode.getAllComments()` for all comments.)" /* $COMMENT#JSDOC#TYPES#SOURCECODE */,
    }),
  }),
};

const ignores = [];

const config = {
  data,
  ignores,
};

export default config;

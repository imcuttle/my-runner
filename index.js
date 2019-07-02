/**
 * Run script in sandbox with customized style
 * @author imcuttle
 */

const name = require('./package').name
const cosmiconfig = require('cosmiconfig')
const fs = require('fs')
const nps = require('path')
const { runScriptAdvanced, defaultAdvancedOptions } = require('./lib/runScriptAdvanced')

const explorer = cosmiconfig(name)

const loadConfig = (path = process.cwd()) => {
  const searchedFor = explorer.searchSync(path)

  if (searchedFor && searchedFor.config) {
    return {
      rootDir: nps.dirname(searchedFor.filepath),
      ...searchedFor.config
    }
  }
}

/**
 * @typedef {{
 *   module: {exports},
 *   exports,
 *   require,
 *   global
 * }}
 * @name RunResult
 */

/**
 * Run code script
 * @public
 * @param code {string}
 * @param opts {{}}
 * @param {string} [opts.rootDir] - The run environment's root directory path.
 * @param {boolean} [opts.myrunnerrc] - Whether or not to look up .myrunnerrc or myrunner.config.js file.
 * @param {Object<string, string>} [opts.moduleNameMapper] - A map from regular expressions to module names that allow to stub out resources, like images or styles with a single module.
 * @param {string[]} [opts.modulePathIgnorePatterns] - An array of regexp pattern strings that are matched against all module paths before those paths are to be considered 'visible' to the module loader.
 * @param {string[]} [opts.modulePaths] - An array of absolute paths to additional locations to search when resolving modules.
 * @param {string[]} [opts.moduleFileExtensions=['.js', '.json', '.jsx', '.ts', '.tsx', '.node']] - An array of file extensions your modules use.
 * @param {string[]} [opts.moduleDirectories=['node_modules']] - An array of directory names to be searched recursively up from the requiring module's location.
 * @param {boolean} [opts.browser=false] - Respect Browserify's "browser" field in package.json when resolving modules.
 * @param {string[]} [opts.transformIgnorePatterns=['/node_modules/']] - An array of regexp pattern strings that are matched against all source file paths before transformation. If the test path matches any of the patterns, it will not be transformed.
 * @param {Object<string, string|Function|{name: string, options: any}>} [opts.transform={}] - A map from regular expressions to paths to transformers. A transformer is a module that provides a synchronous function for transforming source files.
 * @param {string} [opts.globalSetup] - This option allows the use of a custom global setup module which exports an async function that is triggered once.
 * @param {Object} [opts.globals] - A set of global variables that need to be available in environments.
 * @param {Function} [opts.transformContext] - A sync function for transforming context.
 * @param {any} [opts.global={...global}] - The reference on global environment.
 * @param {Object} [opts.fs=require('fs')] - The fs module.
 * @param {Object} [opts.vm=require('vm')] - The vm module.
 * @return {RunResult}
 */
function run(code, opts = {}) {
  let { myrunnerrc = true, cwd, rootDir, ...restOpts } = opts
  if (myrunnerrc) {
    const rcConfig = loadConfig(cwd || rootDir) || {}
    restOpts = {
      ...rcConfig,
      ...restOpts,
      rootDir: rcConfig.rootDir || rootDir || cwd
    }
  }
  return runScriptAdvanced(code, restOpts)
}

/**
 * Run file script
 * @public
 * @param {string} filename
 * @param {Object} opts - Same as `run` options parameter.
 * @return {RunResult}
 */
function runFile(filename, opts = {}) {
  filename = nps.resolve(opts.cwd || opts.rootDir || process.cwd(), filename)
  return run(String((opts.fs || fs).readFileSync(filename)), {
    ...opts,
    filename
  })
}

module.exports = {
  run,
  runFile,
  loadConfig,
  /**
   * The default options
   * @public
   */
  defaultAdvancedOptions
}

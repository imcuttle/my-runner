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

function run(code, { myrunnerrc = true, cwd, rootDir, ...opts } = {}) {
  if (myrunnerrc) {
    const rcConfig = loadConfig(cwd || rootDir) || {}
    opts = {
      ...rcConfig,
      ...opts,
      rootDir: rcConfig.rootDir || rootDir || cwd
    }
  }
  return runScriptAdvanced(code, opts)
}

function runFile(file, opts = {}) {
  file = nps.resolve(opts.cwd || opts.rootDir || process.cwd(), file)
  return run(String((opts.fs || fs).readFileSync(file)), {
    ...opts,
    filename: file
  })
}

module.exports = {
  run,
  runFile,
  loadConfig,
  defaultAdvancedOptions
}

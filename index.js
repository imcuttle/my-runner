/**
 * Run script in sandbox with customized style
 * @author imcuttle
 */

const name = require('./package').name
const cosmiconfig = require('cosmiconfig')
const fs = require('fs')
const nps = require('path')
const { runScriptAdvanced } = require('./lib/runScriptAdvanced')

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

const runner = {
  loadConfig,
  run: (code, { myrunnerrc = true, ...opts } = {}) => {
    if (myrunnerrc) {
      opts = {
        ...loadConfig(opts.rootDir),
        ...opts
      }
    }
    return runScriptAdvanced(code, opts)
  },
  runFile: (file, opts = {}) => {
    file = nps.resolve(opts.rootDir || process.cwd(), file)
    return runner.run(String((opts.fs || fs).readFileSync(file)), {
      ...opts,
      filename: file
    })
  }
}

module.exports = runner

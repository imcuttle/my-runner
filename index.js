/**
 * Run script in sandbox with customized style
 * @author imcuttle
 */

const name = require('./package').name
const cosmiconfig = require('cosmiconfig')
const nps = require('path')
const { runScriptAdvanced } = require('./lib/runScriptAdvanced')

const explorer = cosmiconfig(name)

module.exports = (code, { myrunnerrc = true, ...opts } = {}) => {
  const searchedFor = explorer.searchSync()

  if (searchedFor.config) {
    opts = {
      rootDir: nps.dirname(searchedFor.filepath),
      ...searchedFor.config,
      ...opts
    }
  }

  return runScriptAdvanced(code, opts)
}

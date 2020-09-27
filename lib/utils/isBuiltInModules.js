const { builtinModules } = require('module')
const { isCore } = require('resolve')

module.exports = function isBuiltIn(name) {
  if (builtinModules) {
    return builtinModules.includes(name)
  }
  return isCore(name)
}

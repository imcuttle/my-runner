/**
 * @file resolvePath
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/26
 *
 */
const nps = require('path')
const resolve = require('resolve')

const angleBracketsReplacer = require('./angleBracketsReplacer')

function resolvePath(path, { basedir, moduleDirectories, moduleFileExtensions, modulePaths, browser = false } = {}) {
  return resolve.sync(path, {
    basedir,
    extensions: moduleFileExtensions,
    moduleDirectory: moduleDirectories,
    paths: modulePaths,
    packageFilter: (pkg, dir) => {
      // Respect Browserify's "browser" field in package.json when resolving modules.
      if (browser) {
        pkg.main = pkg.browser || pkg.main
      }
      return pkg
    }
  })
}

module.exports = resolvePath

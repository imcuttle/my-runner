/**
 * @file resolvePath
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/26
 *
 */
const nps = require('path')
const resolve = require('resolve')
const browserResolve = require('browser-resolve')

const angleBracketsReplacer = require('./angleBracketsReplacer')

const getOptsFromFs = fs => {
  return {
    readFileSync: fs.readFileSync.bind(fs),
    isFile: function isFile(file) {
      try {
        var stat = fs.statSync(file)
      } catch (e) {
        if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false
        throw e
      }
      return stat.isFile() || stat.isFIFO()
    },
    isDirectory: function isDirectory(dir) {
      try {
        var stat = fs.statSync(dir)
      } catch (e) {
        if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false
        throw e
      }
      return stat.isDirectory()
    },
    realpathSync: function realpathSync(file) {
      try {
        var realpath = typeof fs.realpathSync.native === 'function' ? fs.realpathSync.native : fs.realpathSync
        return realpath(file)
      } catch (realPathErr) {
        if (realPathErr.code !== 'ENOENT') {
          throw realPathErr
        }
      }
      return file
    }
  }
}

function resolvePath(
  path,
  {
    basedir,
    filename,
    fs,
    moduleDirectories,
    moduleFileExtensions,
    preserveSymlinks,
    modulePaths,
    browser = false
  } = {}
) {
  const resolveOpts = {
    ...getOptsFromFs(fs),
    filename,
    basedir,
    extensions: moduleFileExtensions,
    moduleDirectory: moduleDirectories,
    preserveSymlinks,
    paths: modulePaths
  }
  if (browser) {
    return browserResolve.sync(path, resolveOpts)
  }

  return resolve.sync(path, resolveOpts)
}

module.exports = resolvePath

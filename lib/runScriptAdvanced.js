/**
 * @file runScript
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/25
 *
 */
const resolve = require('resolve')
const nps = require('path')
const debug = require('debug')('my-runner')

const resolvePath = require('./utils/resolvePath')
const { match, regExpReplace } = require('./utils/match')
const angleBracketsReplacer = require('./utils/angleBracketsReplacer')
const { runScript, defaultOptions } = require('./runScript')

function normalizeOptions(advancedOptions) {
  advancedOptions = Object.assign(
    {
      fs: defaultOptions.fs,
      vm: defaultOptions.vm
    },
    advancedOptions
  )
  const parameters = { rootDir: advancedOptions.rootDir }

  function overwriteValue(target, key, { disableResolvePath, getKey, getTarget } = {}) {
    let tar = target
    let innKey = key
    if (typeof getKey === 'function') {
      innKey = getKey(target, key)
    }
    if (typeof getTarget === 'function') {
      tar = getTarget(target, key)
    }

    if (typeof tar[innKey] === 'string') {
      if (!disableResolvePath && parameters.rootDir) {
        tar[innKey] = nps.resolve(parameters.rootDir, tar[innKey])
      }
      tar[innKey] = angleBracketsReplacer(tar[innKey], parameters)
    }
  }
  function overwriteArray(target, key, opts) {
    if (target[key]) {
      target[key].forEach((val, index) => {
        overwriteValue(target[key], index, opts)
      })
    }
  }
  function overwriteMap(target, key, opts) {
    if (target && key && target[key]) {
      Object.keys(target[key]).forEach(innerKey => {
        overwriteValue(target[key], innerKey, opts)
      })
    }
  }

  const configOpts = {
    getKey: (target, key) => {
      if (typeof target[key] === 'string') {
        return key
      }
      if (target[key] && target[key]['name']) {
        return 'name'
      }
      return key
    },
    getTarget: (target, key) => {
      if (typeof target[key] === 'string') {
        return target
      }
      if (target[key] && target[key]['name']) {
        return target[key]
      }
      return target
    }
  }

  overwriteValue(advancedOptions, 'preset', configOpts)
  overwriteValue(advancedOptions, 'filename')
  overwriteArray(advancedOptions, 'modulePaths')
  overwriteArray(advancedOptions, 'moduleDirectories')
  overwriteArray(advancedOptions, 'modulePathIgnorePatterns')
  overwriteMap(advancedOptions, 'moduleNameMapper')
  overwriteValue(advancedOptions, 'globalSetup')
  overwriteArray(advancedOptions, 'transformIgnorePatterns')
  overwriteMap(advancedOptions, 'transform', configOpts)
  return advancedOptions
}

function callIfCallable(fn, ...argv) {
  if (typeof fn === 'function') {
    return fn(...argv)
  }
  return fn
}

function normalizeFuncifyConfig(config) {
  if (!config) return config
  if (typeof config === 'function') return config
  if (typeof config === 'string') {
    return callIfCallable(require(config))
  }

  if (typeof config.name === 'string') {
    return callIfCallable(require(config.name), config.options)
  }
}

const defaultAdvancedOptions = {
  moduleFileExtensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.node'],
  moduleDirectories: ['node_modules'],
  transformIgnorePatterns: ['/node_modules/'],
  global: { ...defaultOptions.global },
  browser: false,
  modulePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(';') : []
}

function runScriptAdvanced(code, advancedOptions = {}) {
  const parameters = { rootDir: advancedOptions.rootDir }
  if (advancedOptions.preset) {
    let preset = advancedOptions.preset
    if (typeof advancedOptions.preset === 'string') {
      preset = resolvePath(angleBracketsReplacer(preset, parameters), { basedir: advancedOptions.rootDir })
    }
    if (preset && preset.name) {
      preset = {
        ...preset,
        name: resolvePath(angleBracketsReplacer(preset.name, parameters), { basedir: advancedOptions.rootDir })
      }
    }

    preset = normalizeFuncifyConfig(preset)
    if (typeof preset === 'function') {
      preset = preset()
    }

    advancedOptions = Object.assign({}, preset, advancedOptions)
  }
  advancedOptions = normalizeOptions(advancedOptions)

  debug('normalizeOptions: %O', advancedOptions)

  const {
    moduleNameMapper = {},
    resolver,
    modulePathIgnorePatterns = [],
    modulePaths = defaultAdvancedOptions.modulePaths,
    moduleFileExtensions = defaultAdvancedOptions.moduleFileExtensions,
    moduleDirectories = defaultAdvancedOptions.moduleDirectories,
    browser = defaultAdvancedOptions.browser,
    transformIgnorePatterns = defaultAdvancedOptions.transformIgnorePatterns,
    transform = {},
    globalSetup = null,
    globals = {},
    rootDir = process.cwd(),
    filename,
    transformContext,
    global = { ...defaultAdvancedOptions.global },
    fs,
    vm,
    moduleMain,
    moduleCache
  } = advancedOptions

  const moduleNameMapperKeys = Object.keys(moduleNameMapper || {})
  const transformKeys = Object.keys(transform || {})

  const options = {
    fs,
    vm,
    filename,
    resolvePath: (moduleName, ctx) => {
      // Deals with `moduleNameMapper` / `modulePathIgnorePatterns`
      if (modulePathIgnorePatterns && match(moduleName, modulePathIgnorePatterns)) {
        debug('modulePathIgnorePatterns: %s', moduleName)
        return null
      }
      const matchedRule = match(moduleName, moduleNameMapperKeys)
      const replacer = matchedRule && moduleNameMapper[matchedRule]
      if (replacer) {
        debug('moduleNameMapper: %s', moduleName)
        moduleName = regExpReplace(moduleName, matchedRule, replacer)
        debug('     =>', moduleName)
      }

      // Deals with `moduleDirectories` / `moduleFileExtensions` / `modulePaths` / `resolver` / `browser`
      const wrappedOptions = {
        filename: ctx.options.filename,
        basedir: ctx.basedir,
        browser,
        defaultResolver: (name, options) => {
          if (resolve.isCore(name)) {
            return require.resolve(name)
          } else {
            return resolvePath(moduleName, {
              moduleFileExtensions: options.extensions,
              moduleDirectories: options.moduleDirectory,
              modulePaths: options.paths,
              browser: options.browser,
              basedir: options.basedir,
              filename: options.filename
            })
          }
        },
        extensions: moduleFileExtensions,
        moduleDirectory: moduleDirectories,
        paths: modulePaths,
        rootDir
      }

      if (typeof resolver === 'function') {
        return resolver(moduleName, wrappedOptions)
      } else {
        return wrappedOptions.defaultResolver(moduleName, wrappedOptions)
      }
    },
    transform: (code, options) => {
      const filename = options.filename
      // Deals with `transformIgnorePatterns` / `transform`
      if (!filename || match(filename, transformIgnorePatterns)) {
        debug('transformIgnorePatterns: %s', filename)
        return code
      }

      // Replaces
      const matchedTransformKey = match(filename, transformKeys)
      let matchedTransform = matchedTransformKey && transform[matchedTransformKey]
      if (typeof matchedTransform === 'string') {
        matchedTransform = regExpReplace(filename, matchedTransformKey, matchedTransform)
      }
      matchedTransform = normalizeFuncifyConfig(transform[matchedTransformKey])
      if (typeof matchedTransform === 'function') {
        debug('transform: %s', filename)
        code = matchedTransform(code, options)
      }
      return code
    },
    global: Object.assign(global || {}, globals, {}),
    transformContext,
    moduleCache,
    moduleMain
  }

  if (globalSetup && typeof globalSetup === 'string' && filename && fs.existsSync(filename)) {
    code = `
    if (typeof require(${JSON.stringify(globalSetup)}) === 'function') {
      Promise.resolve(require(${JSON.stringify(globalSetup)})())
        .then(function () {
          module.exports = require(${JSON.stringify(filename)});
        })
    } else {
      module.exports = require(${JSON.stringify(filename)});
    }`
    delete options.filename
  }

  return runScript(code, options)
}

function runScriptAdvancedFile(filename, advancedOptions) {
  advancedOptions = normalizeOptions(advancedOptions)
  filename = nps.resolve(filename)
  return runScriptAdvanced(
    String(advancedOptions.fs.readFileSync(filename)),
    Object.assign({}, advancedOptions, { filename })
  )
}

module.exports = {
  defaultAdvancedOptions,
  runScriptAdvanced,
  runScriptAdvancedFile,
  normalizeOptions
}

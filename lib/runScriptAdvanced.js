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

  function overwriteValue(target, key, { disableResolvePath } = {}) {
    if (typeof target[key] === 'string') {
      if (!disableResolvePath && parameters.rootDir) {
        target[key] = nps.resolve(parameters.rootDir, target[key])
      }
      target[key] = angleBracketsReplacer(target[key], parameters)
    }
  }
  function overwriteArray(target, key, opts) {
    if (target[key]) {
      target[key].forEach((val, index) => {
        overwriteValue(target[key], index, opts)
      })
    }
  }
  function overwriteMap(target, key, { getTarget, getInnerKey, ...opts } = {}) {
    if (target && key && target[key]) {
      Object.keys(target[key]).forEach(innerKey => {
        let tar = target[key]
        let innKey = innerKey
        if (typeof getInnerKey === 'function') {
          innKey = getInnerKey(target[key], innerKey)
        }
        if (typeof getTarget === 'function') {
          tar = getTarget(target[key], innerKey)
        }
        overwriteValue(tar, innKey, opts)
      })
    }
  }

  overwriteValue(advancedOptions, 'preset')
  overwriteValue(advancedOptions, 'filename')
  overwriteArray(advancedOptions, 'modulePaths')
  overwriteArray(advancedOptions, 'moduleDirectories')
  overwriteArray(advancedOptions, 'modulePathIgnorePatterns')
  overwriteMap(advancedOptions, 'moduleNameMapper')
  overwriteValue(advancedOptions, 'globalSetup')
  overwriteArray(advancedOptions, 'transformIgnorePatterns')
  overwriteMap(advancedOptions, 'transform', {
    getInnerKey: (target, key) => {
      if (typeof target[key] === 'string') {
        return key
      }
      if (target[key] && target[key]['name']) {
        return 'name'
      }
    },
    getTarget: (target, key) => {
      if (typeof target[key] === 'string') {
        return target
      }
      if (target[key] && target[key]['name']) {
        return target[key]
      }
    }
  })
  return advancedOptions
}

function normalizeFuncifyConfig(config) {
  if (!config) return config
  if (typeof config === 'function') return config
  if (typeof config === 'string') {
    return require(config)()
  }

  if (typeof config.name === 'string') {
    return require(config.name)(config.options)
  }
}

function runScriptAdvanced(code, advancedOptions = {}) {
  const parameters = { rootDir: advancedOptions.rootDir }
  if (advancedOptions.preset) {
    const preset = angleBracketsReplacer(advancedOptions.preset, parameters)
    advancedOptions = Object.assign(
      {},
      require(resolvePath(preset, { basedir: advancedOptions.rootDir })),
      advancedOptions
    )
  }
  advancedOptions = normalizeOptions(advancedOptions)

  debug('normalizeOptions: %O', advancedOptions)

  const {
    moduleNameMapper = {},
    resolver,
    modulePathIgnorePatterns = [],
    modulePaths = [],
    moduleFileExtensions = ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
    moduleDirectories = ['/node_modules/'],
    browser = false,
    transformIgnorePatterns = [],
    transform = {},
    globalSetup = null,
    globals = {},
    rootDir = process.cwd(),
    filename,
    fs,
    vm
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
        basedir: ctx.basedir,
        browser,
        defaultResolver: (name, options) => {
          if (resolve.isCore(name)) {
            return require.resolve(name)
          } else {
            return resolvePath(moduleName, options)
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
      // Deals with `transformIgnorePatterns` / `transform`
      if (match(options.filename, transformIgnorePatterns)) {
        debug('transformIgnorePatterns: %s', options.filename)
        return code
      }

      // Replaces
      const matchedTransformKey = match(options.filename, transformKeys)
      let matchedTransform = matchedTransformKey && transform[matchedTransformKey]
      if (typeof matchedTransform === 'string') {
        matchedTransform = regExpReplace(options.filename, matchedTransformKey, matchedTransform)
      }
      matchedTransform = normalizeFuncifyConfig(transform[matchedTransformKey])
      if (typeof matchedTransform === 'function') {
        debug('transform: %s', options.filename)
        code = matchedTransform(code, options)
      }
      return code
    },
    global: Object.assign({}, defaultOptions.global, globals)
  }

  if (globalSetup && typeof globalSetup === 'string') {
    code = `if (typeof require(${JSON.stringify(globalSetup)}) === 'function') {
      Promise.resolve(require(${JSON.stringify(globalSetup)})())
        .then(function () {
          ${code}
        })
    } else {
      ${code}
    }`
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
  runScriptAdvanced,
  runScriptAdvancedFile,
  normalizeOptions
}

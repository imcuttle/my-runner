/**
 * @file runScript
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/25
 *
 */

const vm = require('vm')
const nps = require('path')
const fs = require('fs')
const NativeModule = require('module')
const resolvePath = require('./utils/resolvePath')
const isCore = require('./utils/isBuiltInModules')
const { SourceMap, SourceMapTree } = require('./utils/source-map')
const debug = require('debug')('my-runner')

function addValue(target, prop, value) {
  Object.defineProperty(target, prop, {
    value: value,
    enumerable: true,
    writable: false,
    configurable: true
  })
}

const defaultOptions = {
  fs,
  vm,
  transform: (code, options) => code,
  resolvePath: (moduleName, ctx) => {
    let name = moduleName
    if (isCore(moduleName)) {
      name = require.resolve(moduleName)
    } else if (ctx.basedir) {
      name = resolvePath(moduleName, {
        basedir: ctx.basedir,
        fs: ctx.options.fs
      })
    }
    return name
  },
  require: (id, opts) => {
    if (!opts.fs.existsSync(id)) {
      return require(id)
    }
    if (['.node', '.json'].includes(nps.extname(id))) {
      return require(id)
    }
    return opts.defaultRequire(id)
  },
  global: {
    ...global
  },
  transformContext: ctx => ctx,
  moduleMain: null,
  moduleCache: null
}

function isEmpty(obj) {
  return !obj
}

function runScript(code, options) {
  options = Object.assign({}, defaultOptions, options)
  let { fs, vm, sourceMapTree, filename, parentFilename, enableSourceMap = true } = options

  if (isEmpty(options.moduleCache)) {
    options.moduleCache = {}
  }

  if (filename) {
    debug('filename: %s', filename)
  }

  if (enableSourceMap && !sourceMapTree && options.filename) {
    sourceMapTree = new SourceMapTree()
  }

  const mockRequire = Object.assign(
    function(moduleName) {
      moduleName = mockRequire.resolve(moduleName)
      function myRequire(moduleName) {
        if (moduleName === null) {
          return {}
        }

        return options.require(moduleName, {
          ...options,
          defaultRequire: moduleName => {
            if (fs.existsSync(moduleName)) {
              const ctx = runScript(fs.readFileSync(moduleName).toString(), {
                ...options,
                sourceMapTree,
                parentFilename: filename,
                filename: moduleName
              })
              return ctx.module.exports
            }
          }
        })
      }

      let exports = myRequire(moduleName)
      if (!thisModule.children.includes(mockRequire.cache[moduleName])) {
        thisModule.children.push(mockRequire.cache[moduleName])
      }
      return exports
    },
    {
      resolve: moduleName =>
        options.resolvePath(moduleName, {
          basedir: options.filename && nps.dirname(options.filename),
          defaultResolvePath: defaultOptions.resolvePath,
          options
        }),
      cache: options.moduleCache,
      extensions: {}
    }
  )

  const basedir = options.filename && nps.dirname(options.filename)

  const myRunnerExtension = {
    requireActual: moduleName => {
      const filename = defaultOptions.resolvePath(moduleName, {
        basedir,
        defaultResolvePath: defaultOptions.resolvePath,
        options
      })
      return require(filename)
    }
  }
  const global = options.global

  function createContext(module) {
    let newSandbox = {
      global,
      require: mockRequire,
      module: module
      // exports: module.exports
    }
    if (options.filename) {
      addValue(newSandbox, '__filename', options.filename)
      addValue(newSandbox, '__dirname', nps.dirname(options.filename))
    }
    if (typeof options.transformContext === 'function') {
      newSandbox = options.transformContext(newSandbox, code, options)
    }

    return vm.createContext(newSandbox)
  }

  const cacheModule = mockRequire.cache[filename]
  if (filename && cacheModule) {
    return {
      ...createContext(cacheModule),
      module: cacheModule,
      exports: cacheModule.exports
    }
  }

  function createNewModule() {
    return new NativeModule(filename, parentFilename ? mockRequire.cache[parentFilename] : null)
  }
  const thisModule = (mockRequire.cache[filename] = mockRequire.cache[filename] || createNewModule())
  if (isEmpty(options.moduleMain)) {
    options.moduleMain = thisModule
  }
  mockRequire.main = options.moduleMain

  const transformed = options.transform(code, options)
  if (false === transformed && options.filename) {
    return options.require(options.filename)
  }
  code =
    typeof transformed === 'string'
      ? transformed
      : (transformed && typeof transformed === 'object' && transformed.code) || transformed
  const map = transformed && typeof transformed === 'object' && transformed.map

  const HEAD_WRAP = '(function (exports, require, module, __filename, __dirname, myRunner) {\n'
  let sourceMap
  if (enableSourceMap && options.filename) {
    sourceMap = new SourceMap({ fs })
    sourceMap.map = map
    sourceMap.code = code
    sourceMap.filename = options.filename

    const lines = HEAD_WRAP.split('\n')
    sourceMap.offset = {
      line: Math.max(lines.length - 1, 0),
      col: 0
    }
    sourceMapTree.tree.set(sourceMap.filename, sourceMap)
  }

  code = HEAD_WRAP + code + '\n});'
  const script = new vm.Script(code, {
    filename: filename
  })

  const runContext = createContext(thisModule)
  if (runContext.global) {
    runContext.global.global = runContext.global
  }

  try {
    script
      .runInContext(vm.createContext(runContext.global), options)
      .call(
        runContext.module.exports,
        runContext.module.exports,
        runContext.require,
        runContext.module,
        runContext.__filename,
        runContext.__dirname,
        myRunnerExtension
      )
  } catch (err) {
    delete mockRequire.cache[filename]
    if (err.name === 'Error' || err instanceof Error) {
      err.toSourceMapString = async () => {
        try {
          return await sourceMapTree.transformError(err)
        } catch (e) {
          return String(e)
        }
      }
      throw err
    }
    throw err
  }

  if (filename) {
    Object.assign(thisModule, {
      loaded: true
    })
  }
  runContext.sourceMap = sourceMap
  runContext.sourceMapTree = sourceMapTree
  return runContext
}

function runScriptFile(filename, options) {
  options = Object.assign({}, defaultOptions, options)
  // filename = nps.join(options.rootDir, filename)
  return runScript(String(options.fs.readFileSync(filename)), Object.assign({}, options, { filename }))
}

module.exports = {
  runScript,
  runScriptFile,
  defaultOptions
}

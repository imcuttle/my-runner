/**
 * @file runScript
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/25
 *
 */

const vm = require('vm')
const nps = require('path')
const fs = require('fs')
const resolve = require('resolve')
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
    if (resolve.isCore(moduleName)) {
      name = require.resolve(moduleName)
    } else if (ctx.basedir) {
      name = resolve.sync(moduleName, {
        basedir: ctx.basedir
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
  const { fs, vm, filename, parentFilename } = options

  if (isEmpty(options.moduleCache)) {
    options.moduleCache = {}
  }

  if (filename) {
    debug('filename: %s', filename)
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

  // Injects extensions
  const global = Object.assign(options.global, {
    myRunner: {
      requireActual: moduleName => {
        const filename = defaultOptions.resolvePath(moduleName, {
          basedir: options.filename && nps.dirname(options.filename)
        })
        return require(filename)
      }
    }
  })

  function createContext(module) {
    let newSandbox = {
      global,
      require: mockRequire,
      module: module,
      exports: module.exports
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
    return {
      id: filename,
      filename,
      parent: parentFilename && mockRequire.cache[parentFilename],
      children: [],
      exports: {},
      loaded: false
    }
  }
  const thisModule = (mockRequire.cache[filename] = mockRequire.cache[filename] || createNewModule())
  if (isEmpty(options.moduleMain)) {
    options.moduleMain = thisModule
  }
  mockRequire.main = options.moduleMain

  code = options.transform(code, options)
  if (false === code && options.filename) {
    return options.require(options.filename)
  }

  code = ['(function (exports, require, module, __filename, __dirname) { ', code, '\n});'].join('\n')
  const script = new vm.Script(code, {
    filename: filename
  })

  const runContext = createContext(thisModule)
  if (runContext.global) {
    runContext.global.global = runContext.global
  }
  script.runInContext(vm.createContext(runContext.global), options)(
    runContext.exports,
    runContext.require,
    runContext.module,
    runContext.__filename,
    runContext.__dirname
  )

  if (filename) {
    Object.assign(thisModule, {
      loaded: true
    })
  }
  return runContext
}

function runScriptFile(filename, options) {
  options = Object.assign({}, defaultOptions, options)
  filename = nps.resolve(filename)
  return runScript(String(options.fs.readFileSync(filename)), Object.assign({}, options, { filename }))
}

module.exports = {
  runScript,
  runScriptFile,
  defaultOptions
}

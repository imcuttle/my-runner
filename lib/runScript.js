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

function addReadonlyValue(target, prop, value) {
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
  require: require,
  global: {
    ...global
  },
  transformContext: ctx => ctx
}

function runScript(code, options) {
  options = Object.assign({}, defaultOptions, options)
  const fs = options.fs
  const vm = options.vm

  const mockRequire = Object.assign(
    function(moduleName) {
      const filename = mockRequire.resolve(moduleName)
      if (filename === null) {
        return {}
      }

      if (fs.existsSync(filename)) {
        const ctx = runScript(fs.readFileSync(filename).toString(), {
          ...options,
          filename
        })
        return ctx.module.exports
      }
      return options.require(filename)
    },
    {
      resolve: moduleName =>
        options.resolvePath(moduleName, {
          basedir: options.filename && nps.dirname(options.filename),
          defaultResolvePath: defaultOptions.resolvePath,
          options
        }),
      cache: {},
      main: {},
      extensions: {}
    }
  )

  let _exports = {}
  let newSandbox = {}

  const presetCtx = {
    ...options.global,
    require: mockRequire,
    module: {
      exports: _exports
    },
    exports: _exports
  }

  if (options.filename) {
    addReadonlyValue(newSandbox, '__filename', options.filename)
    addReadonlyValue(newSandbox, '__dirname', nps.dirname(options.filename))
  }
  addReadonlyValue(newSandbox, 'global', options.global)

  newSandbox = options.transformContext(Object.assign(newSandbox, presetCtx), code, options)

  const runContext = vm.createContext(newSandbox)
  code = options.transform(code, options)
  if (false === code && options.filename) {
    return options.require(options.filename)
  }
  const script = new vm.Script(code)
  script.runInContext(runContext, options)

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

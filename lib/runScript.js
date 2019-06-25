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
  transform: (code, options) => code,
  resolvePath: (moduleName, options) => {
    let name = moduleName
    if (resolve.isCore(moduleName)) {
      name = require.resolve(moduleName)
    } else if (options.filename) {
      name = resolve.sync(moduleName, {
        basedir: nps.dirname(options.filename)
      })
    }
    return name
  },
  require: require,
  global: global,
  transformContext: ctx => ctx
}

function runScript(code, options) {
  options = Object.assign({}, defaultOptions, options)

  const mockRequire = Object.assign(
    function(moduleName) {
      const filename = mockRequire.resolve(moduleName)
      if (filename === null) {
        return filename
      }

      if (fs.existsSync(filename)) {
        return runScript(fs.readFileSync(filename).toString(), {
          ...options,
          filename
        })
      }
      return options.require(filename)
    },
    {
      resolve: moduleName => options.resolvePath(moduleName, options),
      cache: {},
      main: {},
      extensions: {}
    }
  )

  let _exports = {}
  let newSandbox = {}
  if (options.filename) {
    addReadonlyValue(newSandbox, '__filename', options.filename)
    addReadonlyValue(newSandbox, '__dirname', nps.dirname(options.filename))
  }

  const presetCtx = {
    global: options.global,
    ...options.global,
    require: mockRequire,
    module: {
      exports: _exports
    },
    exports: _exports
  }

  newSandbox = options.transformContext(Object.assign(newSandbox, presetCtx), code, options)

  const runContext = vm.createContext(newSandbox)
  code = options.transform(code, options)
  if (false === code && options.filename) {
    return options.require(options.filename)
  }
  const script = new vm.Script(code)
  script.runInContext(runContext, options)

  return runContext.module.exports
}

function runScriptFile(filename, options) {
  filename = nps.resolve(filename)
  return runScript(String(fs.readFileSync(filename)), Object.assign({}, options, { filename }))
}

module.exports = {
  runScript,
  runScriptFile,
  defaultOptions
}

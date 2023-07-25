const path = require('path')
const sm = require('source-map')
const stackTrace = require('stack-trace')

class SourceMapTree {
  constructor({ fs = require('fs'), baseDir } = {}) {
    this.fs = fs
    this.tree = new Map()
    this.offset = {
      line: 0,
      col: 0
    }
    this.baseDir = baseDir
  }

  _parseCode({ code, filename }) {
    //# sourceMappingURL=index.js.map
    const [, mapFile] = code.match(/\/\/\# sourceMappingURL=(.+)\s*$/) || []
    const basedir = path.dirname(filename)
    if (mapFile && basedir) {
      const mapFilename = path.resolve(basedir, mapFile)

      return new Promise((resolve, reject) => {
        this.fs.readFile(mapFilename, async (err, content) => {
          if (err) {
            reject(err)
          } else {
            resolve(await new sm.SourceMapConsumer(JSON.parse(String(content))))
          }
        })
      })
    }
  }

  getSourceMapConsumer(filename) {
    const data = this.tree.get(filename)
    if (!data) {
      return
    }

    if (data._sourceMapPromise) {
      return data._sourceMapPromise
    }

    data._sourceMapPromise = this._parseCode(data).catch(err => {
      delete data._sourceMapPromise
      throw err
    })
    return data._sourceMapPromise
  }

  async _transformError(error) {
    const { line = 0, col = 0 } = Object.assign(
      {
        line: 0,
        col: 0
      },
      this.offset || {}
    )

    const stack = stackTrace.parse(error).map(meta => {
      const lineNo = meta.lineNumber
      meta.lineNumber -= line
      if (lineNo < line) {
        meta.columnNumber -= col
      }
      return meta
    })

    const base = this.baseDir

    const getFirstString = async () => {
      return stack[0] ? getErrorSource(base, await this.getSourceMapConsumer(stack[0].fileName), stack[0]) : ''
    }

    const getStackString = async () => {
      const list = await Promise.all(
        stack.map(async frame => {
          return '\n    at ' + wrapCallSite(base, await this.getSourceMapConsumer(frame.fileName), frame)
        })
      )
      return list.join('')
    }

    const arr = await Promise.all([getFirstString(), Promise.resolve(String(error)), getStackString()])

    return arr.join('')
  }

  transformError(error) {
    return this._transformError(error)
  }
}

module.exports = {
  SourceMapTree
}

function getErrorSource(base, map, topFrame) {
  if (!map) {
    return ''
  }
  var position = getPosition(map, topFrame)
  var original = map.sourceContentFor(position.source)
  if (original == null) {
    return ''
  }
  var code = original.split(/(?:\r\n|\r|\n)/)[position.line - 1]
  return (
    path.resolve(path.join(base, position.source)) +
    ':' +
    position.line +
    '\n' +
    code +
    '\n' +
    new Array(position.column + 3).join(' ') +
    '^\n\n'
  )
}

function wrapCallSite(base, map, frame) {
  frame = cloneCallSite(frame)
  var source = frame.getFileName()
  if (!map || !source) return frame
  if (source !== 'evalmachine.<anonymous>' && !map.sourceContentFor(source, true)) return frame
  var position = getPosition(map, frame)
  if (!position.source) return frame
  frame.getFileName = function() {
    return path.resolve(path.join(base, position.source))
  }
  frame.getLineNumber = function() {
    return position.line
  }
  frame.getColumnNumber = function() {
    return position.column + 1
  }
  frame.getScriptNameOrSourceURL = function() {
    return position.source
  }
  return frame
}

function getPosition(map, frame) {
  var source = frame.getFileName()
  var line = frame.getLineNumber()
  var column = frame.getColumnNumber() - 1
  // Fix position in Node where some (internal) code is prepended.
  // See https://github.com/evanw/node-source-map-support/issues/36
  if (line === 1) {
    column -= 62
  }

  const input = {
    source: source,
    line: line,
    column: column
  }
  const ret = map.originalPositionFor(input)
  if (ret.source) {
    return ret
  }
  return input
}

function cloneCallSite(frame) {
  var object = {}
  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
    object[name] = /^(?:is|get)/.test(name)
      ? function() {
          return frame[name].call(frame)
        }
      : frame[name]
  })
  object.toString = CallSiteToString
  return object
}

// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
// implementation of wrapCallSite() used to just forward to the actual source
// code of CallSite.prototype.toString but unfortunately a new release of V8
// did something to the prototype chain and broke the shim. The only fix I
// could find was copy/paste.
function CallSiteToString() {
  var fileName
  var fileLocation = ''
  if (this.isNative()) {
    fileLocation = 'native'
  } else {
    fileName = (this.scriptNameOrSourceURL && this.scriptNameOrSourceURL()) || this.getFileName()
    if (!fileName && this.isEval && this.isEval()) {
      fileLocation = this.getEvalOrigin()
      fileLocation += ', ' // Expecting source position to follow.
    }

    if (fileName) {
      fileLocation += fileName
    } else {
      // Source code does not originate from a file and is not native, but we
      // can still get the source position inside the source string, e.g. in
      // an eval string.
      fileLocation += '<anonymous>'
    }
    var lineNumber = this.getLineNumber()
    if (lineNumber != null) {
      fileLocation += ':' + lineNumber
      var columnNumber = this.getColumnNumber()
      if (columnNumber) {
        fileLocation += ':' + columnNumber
      }
    }
  }

  var line = ''
  var functionName = this.getFunctionName()
  var addSuffix = true
  var isConstructor = this.isConstructor && this.isConstructor()
  var methodName = this.getMethodName()
  var typeName = this.getTypeName()
  var isMethodCall = methodName && !((this.isToplevel && this.isToplevel()) || isConstructor)
  if (isMethodCall && functionName) {
    if (functionName) {
      if (typeName && functionName.indexOf(typeName) != 0) {
        line += typeName + '.'
      }
      line += functionName
      if (methodName && functionName.indexOf('.' + methodName) != functionName.length - methodName.length - 1) {
        line += ' [as ' + methodName + ']'
      }
    } else {
      line += typeName + '.' + (methodName || '<anonymous>')
    }
  } else if (typeName && !functionName) {
    line += typeName + '.' + (methodName || '<anonymous>')
  } else if (isConstructor) {
    line += 'new ' + (functionName || '<anonymous>')
  } else if (functionName) {
    line += functionName
  } else {
    line += fileLocation
    addSuffix = false
  }
  if (addSuffix) {
    line += ' (' + fileLocation + ')'
  }
  return line
}

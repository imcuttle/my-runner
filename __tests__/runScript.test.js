/**
 * @file runScript
 * @author Cuttle Cong
 * @date 2019/6/25
 * @description
 */
const MemoryFs = require('memory-fs')
const { dirname } = require('path')
const { fixture } = require('./helper')
const { runScriptFile } = require('../lib/runScript')

describe('runScript', function() {
  it('should runScript - spec', async () => {
    expect(await runScriptFile(fixture('runScript/spec/index.js')).module.exports).toMatchInlineSnapshot(`
Array [
  Array [
    "aaa",
  ],
  "bbb",
]
`)
  })

  it('should runScript - spec modules', async () => {
    const { cache, main } = runScriptFile(fixture('runScript/spec/index.js')).require
    expect(main).toBe(cache[main.id])
    expect(main.id).toBe(fixture('runScript/spec/index.js'))
    expect(main.children.map(x => x.id)).toEqual([
      fixture('runScript/spec/op.js'),
      fixture('runScript/spec/a.js'),
      fixture('runScript/spec/b.js')
    ])
  })

  it('should runScript - global', async () => {
    expect(
      await runScriptFile(fixture('runScript/global/index.js'), {
        global: {
          foo: 'foo'
        }
      }).module.exports
    ).toMatchInlineSnapshot(`"foo"`)
  })

  it('should runScript - transformContext', async () => {
    expect(
      await runScriptFile(fixture('runScript/global/index.js'), {
        global: {
          foo: 'foo'
        },
        transformContext: ctx => {
          ctx.global.foo = 'ctxFoo'
          return ctx
        }
      }).module.exports
    ).toMatchInlineSnapshot(`"ctxFoo"`)
  })

  it('should runScript - transform', () => {
    const transform = jest.fn((code, options) => "module.exports = 'duang'")

    expect(
      runScriptFile(fixture('runScript/global/index.js'), {
        transform
      }).module.exports
    ).toMatchInlineSnapshot(`"duang"`)

    expect(transform).toBeCalledTimes(1)
  })

  it('should runScript - require', () => {
    const fakeRequire = jest.fn(modulePath => 'bar')
    expect(
      runScriptFile(fixture('runScript/global/index.js'), {
        transform: (code, options) => "module.exports = require('./bar')",
        require: fakeRequire,
        resolvePath: path => path
      }).module.exports
    ).toMatchInlineSnapshot(`"bar"`)

    expect(fakeRequire).toBeCalledTimes(1)
  })

  it('should circle supports', function() {
    let chunks = []
    const spy = jest.spyOn(console, 'log').mockImplementation((...argv) => {
      chunks.push(argv)
    })

    const exps = runScriptFile(fixture('runScript/circle/1.js'), {}).module.exports
    expect(exps).toEqual(require(fixture('runScript/circle/1.js')))
    expect(chunks).toMatchSnapshot()
  })

  it('should circle-2 supports', function() {
    let chunks = []
    const spy = jest.spyOn(console, 'log').mockImplementation((...argv) => {
      chunks.push(argv)
    })

    const exps = runScriptFile(fixture('runScript/circle-2/1.js'), {}).module.exports
    expect(exps).toEqual(require(fixture('runScript/circle-2/1.js')))
    expect(chunks).toMatchSnapshot()
  })

  it('should require.cache supports', function() {
    let chunks = []
    const spy = jest.spyOn(console, 'log').mockImplementation((...argv) => {
      chunks.push(argv)
    })

    const exps = runScriptFile(fixture('runScript/require-cache/1.js'), {
      moduleCache: {
        [fixture('runScript/require-cache/1.js')]: {
          exports: 'fake',
          loaded: true
        }
      }
    }).module.exports
    expect(exps).toEqual('fake')
    expect(chunks).toMatchSnapshot()

    chunks = []
    expect(runScriptFile(fixture('runScript/require-cache/1.js'), {}).module.exports).toEqual(1)
    expect(chunks).toMatchSnapshot()
  })

  it('should moduleCache === require.cache supports', function() {
    const moduleCache = {}
    const cache = runScriptFile(fixture('runScript/require-cache/1.js'), {
      moduleCache
    }).require.cache
    expect(cache).toBe(moduleCache)
    expect(Object.keys(moduleCache).length).toBe(1)
  })

  it('should source-map', async function() {
    const moduleCache = {}
    try {
      const ret = runScriptFile(fixture('runScript/source-map/runtime_commons.js'), {
        moduleCache
      })
    } catch (err) {
      const errorString = await err.toSourceMapString()
      expect(errorString).toMatch(/__webpack_require__.m = __webpack_modules__;/)
    }
  })

  it('should async exports', function() {
    expect(runScriptFile(fixture('runScript/async-exports/index.js'), {}).module.exports()).toMatchInlineSnapshot(
      `Object {}`
    )
    expect(require(fixture('runScript/async-exports/index.js'))()).toMatchInlineSnapshot(`Object {}`)

    const fn = runScriptFile(fixture('runScript/async-exports/index.js'), {}).module.exports
    const gn = require(fixture('runScript/async-exports/index.js'))()
    setTimeout(() => {
      expect(fn()).toMatchInlineSnapshot(`Object {}`)
      expect(gn()).toMatchInlineSnapshot(`Object {}`)
    }, 100)
  })

  describe('memoryFs', function() {
    let memoryFs
    function writeFiles(files) {
      for (const [name, data] of Object.entries(files)) {
        memoryFs.mkdirpSync(dirname(name))
        memoryFs.writeFileSync(name, String(data))
      }
    }
    beforeEach(() => {
      memoryFs = new MemoryFs()
    })

    it('should require path in memory', function() {
      writeFiles({
        '/index.js': `module.exports = require('./op')(require('./left'), require('./right'))`,
        '/left.js': `module.exports = { value: 'left' }`,
        '/right.js': `module.exports = { value: 'right' }`,
        '/op.js': `module.exports = (left, right) => left.value + right.value`
      })

      expect(runScriptFile('/index.js', { fs: memoryFs }).module.exports).toMatchInlineSnapshot(`"leftright"`)
    })
  })
})

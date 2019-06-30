/**
 * @file runScript
 * @author Cuttle Cong
 * @date 2019/6/25
 * @description
 */
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
          return {
            ...ctx,
            foo: 'ctxFoo'
          }
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
    expect(fakeRequire).toBeCalledWith('./bar')
  })
})

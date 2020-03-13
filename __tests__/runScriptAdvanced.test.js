/**
 * @file runAdvanced
 * @author Cuttle Cong
 * @date 2019/6/30
 * @description
 */
const { fixture } = require('./helper')
const { runScriptAdvanced, runScriptAdvancedFile, normalizeOptions } = require('../lib/runScriptAdvanced')

describe('runScriptAdvanced', function() {
  it('should mutable-global', () => {
    const global = {}
    const result = runScriptAdvancedFile(fixture('runScriptAdvanced/mutable-global/index.js'), {
      global
    })
    expect(result.module.exports).toMatchInlineSnapshot(`"(() => {})"`)
    expect(result.global).toBe(global)
    expect(typeof global._i).toBe('function')
  })

  it('should globals', () => {
    expect(
      runScriptAdvancedFile(fixture('runScriptAdvanced/globals/index.js'), {
        globals: {
          foo: 'bar'
        }
      }).module.exports
    ).toBe('barbar')
  })

  it('should globalSetup', () => {
    expect(
      runScriptAdvancedFile(fixture('runScriptAdvanced/globalSetup/index.js'), {
        globalSetup: fixture('runScriptAdvanced/globalSetup/setup.js')
      }).module.exports
    ).toBe('barbar')
  })

  it('should moduleNameMapper', () => {
    expect(
      runScriptAdvancedFile(fixture('runScriptAdvanced/moduleNameMapper/index.js'), {
        moduleNameMapper: {
          'real-(.+)': 'fake-$1'
        }
      }).module.exports
    ).toBe('c-ab')
  })

  it('should resolver', function() {
    const resolver = jest.fn(id => {
      if (id === 'fake-path') {
        return 'path'
      }
    })
    expect(
      runScriptAdvanced('module.exports = require("fake-path")', {
        resolver
      }).module.exports
    ).toBe(require('path'))
    expect(resolver).toBeCalledTimes(1)
  })

  it('should modulePathIgnorePatterns', function() {
    expect(
      runScriptAdvanced('module.exports = require("./fake-path")', {
        modulePathIgnorePatterns: ['./']
      }).module.exports
    ).toEqual({})
  })

  it('should modulePathIgnorePatterns', function() {
    expect(
      runScriptAdvanced('module.exports = require("./fake-path")', {
        modulePathIgnorePatterns: ['./']
      }).module.exports
    ).toEqual({})
  })

  it('should transform', function() {
    const transform = jest.fn((code, options) => {
      return 'module.exports = "tran"'
    })
    expect(
      runScriptAdvanced('module.exports = require("./fake-path")', {
        transform: {
          '**': transform
        },
        filename: '/fake/path'
      }).module.exports
    ).toEqual('tran')
  })

  it('should transform works on object', function() {
    expect(
      runScriptAdvanced('module.exports = require("./fake-path")', {
        transform: {
          '**': {
            name: './trans',
            options: {
              abc: null
            }
          }
        },
        rootDir: fixture('runScriptAdvanced/transform'),
        filename: '/fake/path'
      }).module.exports
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "abc": null,
  },
  "/fake/path",
]
`)
  })
})

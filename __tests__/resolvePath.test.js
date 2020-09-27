/**
 * @file resolvePath
 * @author Cuttle Cong
 * @date 2019/6/26
 * @description
 */
const fs = require('fs')
const MemoryFs = require('memory-fs')
const { dirname } = require('path')
const { fixture } = require('./helper')
const resolvePath = require('../lib/utils/resolvePath')

describe('resolvePath', function() {
  it('should resolvePath spec', () => {
    expect(fixture('./resolvePath/spec/index.js')).toBe(
      resolvePath('./spec', {
        fs,
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath extensions', () => {
    expect(fixture('./resolvePath/spec/index.jsx')).toBe(
      resolvePath('./spec', {
        fs,
        moduleFileExtensions: ['.jsx', '.js'],
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath moduleDirectories', () => {
    expect(fixture('./resolvePath/modules/foo.js')).toBe(
      resolvePath('foo', {
        fs,
        moduleDirectories: ['modules'],
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath moduleDirectories array', () => {
    expect(fixture('./resolvePath/high-modules/foo.js')).toBe(
      resolvePath('foo', {
        fs,
        moduleDirectories: ['high-modules', 'modules'],
        basedir: fixture('./resolvePath')
      })
    )

    expect(fixture('./resolvePath/modules/bar.js')).toBe(
      resolvePath('bar', {
        fs,
        moduleDirectories: ['high-modules', 'modules'],
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath browser', () => {
    expect(fixture('./resolvePath/browser/main.js')).toBe(
      resolvePath('.', {
        fs,
        basedir: fixture('./resolvePath/browser')
      })
    )

    expect(fixture('./resolvePath/browser/browser.js')).toBe(
      resolvePath('./', {
        browser: true,
        fs,
        basedir: fixture('./resolvePath/browser')
      })
    )
  })

  it('should resolvePath - modulePaths', () => {
    expect(fixture('./resolvePath/paths/modules/foo.js')).toBe(
      resolvePath('foo', {
        fs,
        modulePaths: [fixture('./resolvePath/paths/modules')],
        basedir: fixture('./resolvePath/paths')
      })
    )
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

    it('should resolvePath - normal', function() {
      writeFiles({
        '/index.js': ' '
      })

      expect('/index.js').toBe(
        resolvePath('./index.js', {
          basedir: '/',
          fs: memoryFs
        })
      )
    })

    it('should resolvePath - browser', function() {
      writeFiles({
        '/node_modules/foo/package.json': JSON.stringify({
          name: 'foo',
          browser: {
            './index.js': 'index.browser.js'
          }
        }),
        '/node_modules/foo/index.js': ' ',
        '/node_modules/foo/index.browser.js': ' '
      })

      expect('/node_modules/foo/index.browser.js').toBe(
        resolvePath('foo', {
          browser: true,
          basedir: '/',
          fs: memoryFs
        })
      )
    })
  })
})

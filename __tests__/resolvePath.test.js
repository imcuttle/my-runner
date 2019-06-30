/**
 * @file resolvePath
 * @author Cuttle Cong
 * @date 2019/6/26
 * @description
 */
const { fixture } = require('./helper')
const resolvePath = require('../lib/utils/resolvePath')

describe('resolvePath', function() {
  it('should resolvePath spec', () => {
    expect(fixture('./resolvePath/spec/index.js')).toBe(
      resolvePath('./spec', {
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath extensions', () => {
    expect(fixture('./resolvePath/spec/index.jsx')).toBe(
      resolvePath('./spec', {
        moduleFileExtensions: ['.jsx', '.js'],
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath moduleDirectories', () => {
    expect(fixture('./resolvePath/modules/foo.js')).toBe(
      resolvePath('foo', {
        moduleDirectories: ['modules'],
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath moduleDirectories array', () => {
    expect(fixture('./resolvePath/high-modules/foo.js')).toBe(
      resolvePath('foo', {
        moduleDirectories: ['high-modules', 'modules'],
        basedir: fixture('./resolvePath')
      })
    )

    expect(fixture('./resolvePath/modules/bar.js')).toBe(
      resolvePath('bar', {
        moduleDirectories: ['high-modules', 'modules'],
        basedir: fixture('./resolvePath')
      })
    )
  })

  it('should resolvePath browser', () => {
    expect(fixture('./resolvePath/browser/main.js')).toBe(
      resolvePath('.', {
        basedir: fixture('./resolvePath/browser')
      })
    )

    expect(fixture('./resolvePath/browser/browser.js')).toBe(
      resolvePath('./', {
        browser: true,
        basedir: fixture('./resolvePath/browser')
      })
    )
  })

  it('should resolvePath - modulePaths', () => {
    expect(fixture('./resolvePath/paths/modules/foo.js')).toBe(
      resolvePath('foo', {
        modulePaths: [fixture('./resolvePath/paths/modules')],
        basedir: fixture('./resolvePath/paths')
      })
    )
  })
})

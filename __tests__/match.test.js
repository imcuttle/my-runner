/**
 * @file match
 * @author Cuttle Cong
 * @date 2019/6/30
 * @description
 */
const { match, regExpReplace } = require('../lib/utils/match')

describe('match', function() {
  it('should match glob', () => {
    expect(match('abc/asdad', 'abc*')).toBeTruthy()
    expect(match('abc/asdad', 'abcd')).toBeFalsy()
    expect(match('abc/asdad', ['abcd', 'abc*'])).toBeTruthy()
  })

  it('should match regexp', () => {
    expect(match('123/aaa', '\\d+/a+')).toBeTruthy()
    expect(match('123/aaa', '\\d+/a$')).toBeFalsy()
  })

  it('should regExpReplace', function() {
    expect(
      regExpReplace('module_name_foo', 'module_name_(.*)', '<rootDir>/substituted_module_$1.js')
    ).toMatchInlineSnapshot(`"<rootDir>/substituted_module_foo.js"`)
  })
})

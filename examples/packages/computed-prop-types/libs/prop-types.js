/**
 * @file style-useable
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
const propTypes = myRunner.requireActual('prop-types')

const mockPropTypes = {}
function wrapCheckFn(fn, key, argvs) {
  return Object.assign(
    function() {
      const checkFnOrResult = fn.apply(this, arguments)
      if (typeof checkFnOrResult === 'function') {
        return wrapCheckFn(checkFnOrResult, key, Array.prototype.slice.call(arguments))
      }
      return checkFnOrResult
    },
    {
      checkType: key,
      arg: argvs && argvs[0]
    }
  )
}

Object.keys(propTypes).forEach(key => {
  const fn = propTypes[key]
  if (typeof fn === 'function') {
    mockPropTypes[key] = wrapCheckFn(fn, key)
  } else {
    mockPropTypes[key] = fn
  }
})

module.exports = mockPropTypes

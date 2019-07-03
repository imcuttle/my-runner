/**
 * @file 1
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
console.log(require.main.exports)
module.exports = [1, require('./2')]
console.log('module.loaded', module.loaded)
console.log('sync 1.js', module.exports)
console.log(require.main.exports)
// console.log(require.cache)
setTimeout(() => {
  console.log('async 1.js', module.exports)
})

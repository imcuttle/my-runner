/**
 * @file 1
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
module.exports = [4, require('./2')]
console.log('sync 4.js', module.exports)
setTimeout(() => {
  console.log('async 4.js', module.exports)
})

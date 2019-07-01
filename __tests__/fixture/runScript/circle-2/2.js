/**
 * @file 1
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
module.exports = [2, require('./3')]
console.log('sync 2.js', module.exports)
setTimeout(() => {
  console.log('async 2.js', module.exports)
})

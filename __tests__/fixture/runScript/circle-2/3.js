/**
 * @file 1
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
module.exports = [3, require('./4')]
console.log('sync 3.js', module.exports)
setTimeout(() => {
  console.log('async 3.js', module.exports)
})

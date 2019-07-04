/**
 * @file a.js
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/3
 *
 */
console.log('b.js exports entry', module.exports)
module.exports = {
  a: require('./a'),
  b: 'b'
}
console.log('b.js exports', module.exports)

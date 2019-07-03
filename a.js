/**
 * @file a.js
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/3
 *
 */
console.log('a.js exports entry', module.exports)
module.exports = {
  b: require('./b'),
  a: 'a'
}
console.log('a.js exports', module.exports)

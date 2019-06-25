/**
 * @file index
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/25
 *
 */

module.exports = (a, b) =>
  new Promise(resolve => {
    setTimeout(resolve, 100, [a, b])
  })

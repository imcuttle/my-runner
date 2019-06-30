/**
 * @file angleBracketsReplacer
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/26
 *
 */

function replacer(string, obj) {
  if (!obj) return string

  return string.replace(/<(.+?)>/, (_, $1) => {
    if (obj.hasOwnProperty($1)) {
      return obj[$1]
    }
    return _
  })
}

module.exports = replacer

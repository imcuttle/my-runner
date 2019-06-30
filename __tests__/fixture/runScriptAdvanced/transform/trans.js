/**
 * @file trans
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/30
 *
 */

module.exports = opts => {
  return (code, { filename }) => {
    return `module.exports = [${JSON.stringify(opts)}, ${JSON.stringify(filename)}]`
  }
}

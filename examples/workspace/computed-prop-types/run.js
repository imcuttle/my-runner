/**
 * @file run
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
// process.env.DEBUG = 'my-runner'
const nps = require('path')
const { runFile } = require('../../..')

console.log(
  JSON.stringify(runFile(nps.join(__dirname, 'Button/index.jsx')).module.exports.default.propTypes, null, 2),

  runFile(nps.join(__dirname, 'index.jsx')).module.exports
)

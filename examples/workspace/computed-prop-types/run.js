/**
 * @file run
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
// process.env.DEBUG = 'my-runner'
const nps = require('path')
const { runFile } = require('../../..')

console.log(runFile(nps.join(__dirname, 'Button/index.jsx')).module.exports.default.propTypes)

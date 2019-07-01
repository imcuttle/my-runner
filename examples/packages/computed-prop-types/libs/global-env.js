/**
 * @file global-setup
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */
const { JSDOM } = require('jsdom')

const dom = new JSDOM(``, {
  runScripts: 'dangerously',
  url: 'http://localhost'
})

module.exports = dom.window.document.defaultView

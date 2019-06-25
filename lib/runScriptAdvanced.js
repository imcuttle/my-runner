/**
 * @file runScript
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/25
 *
 */

const resolve = require('resolve')
const run = require('./runScript')

function runScript(
  code,
  {
    preset = null,
    moduleNameMapper = null,
    resolver = () => {},
    modulePathIgnorePatterns: [],
    modulePaths: [],
    moduleFileExtensions = ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
    moduleDirectories = ['node_modules'],
    transformIgnorePatterns = [],
    testEnvironment = [],
    setupFiles = [],
    unmockedModulePathPatterns = [],
    transform = {},
    browser = false,
    globals = {}
  } = {}
) {
  run.runScript()
}

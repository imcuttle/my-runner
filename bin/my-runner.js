#!/usr/bin/env node
const { defaultAdvancedOptions, run, runFile } = require('..')
const concat = require('concat-stream')
const parseArgs = require('minimist')
const nps = require('path')
const debug = require('debug')('my-runner:cli')
const objectKeys = ['transform', 'globals', 'moduleNameMapper']
const arrayKeys = [
  'modulePathIgnorePatterns',
  'modulePaths',
  'moduleFileExtensions',
  'moduleDirectories',
  'transformIgnorePatterns'
]

const argv = parseArgs(process.argv.slice(2), {
  string: [
    'filename',
    'preset',
    'rootDir',
    'globalSetup',
    'transformIgnorePatterns',
    'moduleDirectories',
    'moduleFileExtensions',
    'modulePaths',
    'modulePathIgnorePatterns'
  ].concat(objectKeys),
  boolean: ['browser', 'logExports', 'myrunnerrc'],
  default: {
    myrunnerrc: true,
    logExports: false,
    help: false
  }
})

function parseVal(string) {
  try {
    return JSON.parse(string)
  } catch (e) {
    return string
  }
}

arrayKeys.forEach(name => {
  const val = argv[name]
  if (val != null && !Array.isArray(val)) {
    argv[name] = [val]
  }
})
objectKeys.forEach(name => {
  let array = argv[name]
  if (array != null && !Array.isArray(array)) {
    array = [array]
  }

  if (array) {
    argv[name] = array.reduce((obj, string) => {
      if (/^(.*?)=(.*)$/.test(string)) {
        const name = RegExp.$1
        obj[name] = parseVal(RegExp.$2)
      }
      return obj
    }, {})
  }
})

const opts = Object.assign(
  {
    cwd: process.cwd()
  },
  argv
)
delete opts._
delete opts.logExports
delete opts.help

debug('opts: %O', opts)

if (argv.version) {
  console.log(require('../package').version)
  process.exit()
}

if (argv.help) {
  console.log(`
  Usage
    $ my-runner [options] <file>

  Options
  
    --help                        Show the help
    
    --version                     Show the version
    
    --logExports                  Should console.log(module.exports)
                                  [Default: false]
                                  
    --myrunnerrc                  Whether or not to look up .myrunnerrc or myrunner.config.js file. 
    
    --moduleNameMapper            A map from regular expressions to module names that allow to stub out resources, like images or styles with a single module. 
                                  (eg. --moduleNameMapper="*.less=./less-module")
    
    --modulePathIgnorePatterns    An array of regexp pattern strings that are matched against all module paths before those paths are to be considered 'visible' to the module loader.
                             
    --modulePaths                 An array of absolute paths to additional locations to search when resolving modules. Use NODE_PATH env variable by default.    
                                  [Default: ${JSON.stringify(defaultAdvancedOptions.modulePaths)}]
                             
    --moduleFileExtensions        An array of file extensions your modules use.
                                  [Default: ${JSON.stringify(defaultAdvancedOptions.moduleFileExtensions)}]
                             
    --moduleDirectories           An array of directory names to be searched recursively up from the requiring module's location.
                                  [Default: ${JSON.stringify(defaultAdvancedOptions.moduleDirectories)}]
                             
    --browser                     Respect Browserify's "browser" field in package.json when resolving modules.
                                  [Default: ${defaultAdvancedOptions.browser}]
    
    --transformIgnorePatterns     An array of regexp pattern strings that are matched against all source file paths before transformation. If the test path matches any of the patterns, it will not be transformed.
                                  [Default: ${JSON.stringify(defaultAdvancedOptions.transformIgnorePatterns)}]
                                  
    --transform                   A map from regular expressions to paths to transformers. A transformer is a module that provides a synchronous function for transforming source files.
    
    --globalSetup                 This option allows the use of a custom global setup module which exports an async function that is triggered once.
                                  
    --globals                     A set of global variables that need to be available in environments.
    
    --filename                    The filename for running script.
                             
  Examples
  
    $ cat file.js | my-runner --filename=file.js
    
    $ my-runner file.js
`)
  process.exit()
}

if (argv._.length) {
  const filename = argv._[0]
  const exports = runFile(filename, opts).module.exports
  if (argv.logExports) {
    console.log(exports)
  }
} else {
  process.stdin.pipe(
    concat(function(buf) {
      const exports = run(
        String(buf),
        Object.assign({}, opts, {
          filename: opts.filename || nps.join(opts.cwd, '<repl>')
        })
      ).module.exports
      if (argv.logExports) {
        console.log(exports)
      }
    })
  )
}

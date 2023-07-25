# my-runner

[![Build status](https://img.shields.io/travis/imcuttle/my-runner/master.svg?style=flat-square)](https://travis-ci.org/imcuttle/my-runner)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/my-runner.svg?style=flat-square)](https://codecov.io/github/imcuttle/my-runner?branch=master)
[![NPM version](https://img.shields.io/npm/v/my-runner.svg?style=flat-square)](https://www.npmjs.com/package/my-runner)
[![NPM Downloads](https://img.shields.io/npm/dm/my-runner.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/my-runner)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

> Run CommonJS script in sandbox with customized style

## How it works?

my-runner uses [vm](https://nodejs.org/api/vm.html) module for mocking an CommonJS's script environment. So we can make the environment as your wish.

For example, [jest](https://jestjs.io) uses customized environment for running test files. And we could use it running browser's script.

## Installation

```bash
npm install my-runner
# or use yarn
yarn add my-runner
```

## Usage

### Package

```javascript
const myRunner = require('my-runner')

myRunner.runFile('/path/to/file.js').module.exports
```

### Cli

```bash
npm i my-runner -g
my-runner --help
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### run

[index.js:53-69](https://github.com/imcuttle/my-runner/blob/df4d245ed13f7ce9bf314f165e6f78947c47212a/index.js#L53-L69 'Source code on GitHub')

Run code script

#### Parameters

- `code` {string}
- `opts` {{}} (optional, default `{}`)
  - `opts.rootDir` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The run environment's root directory path.
  - `opts.myrunnerrc` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** Whether or not to look up .my-runnerrc or my-runner.config.js file.
  - `opts.preset` **({} | [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) | {name: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), options: any})?** A preset that is used as a base for configuration.
  - `opts.moduleNameMapper` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** A map from regular expressions to module names that allow to stub out resources, like images or styles with a single module.
  - `opts.modulePathIgnorePatterns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** An array of regexp pattern strings that are matched against all module paths before those paths are to be considered 'visible' to the module loader.
  - `opts.modulePaths` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** An array of absolute paths to additional locations to search when resolving modules. Use NODE_PATH env variable by default.
  - `opts.moduleFileExtensions` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** An array of file extensions your modules use. (optional, default `['.js','.json','.jsx','.ts','.tsx','.node']`)
  - `opts.moduleDirectories` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** An array of directory names to be searched recursively up from the requiring module's location. (optional, default `['node_modules']`)
  - `opts.preserveSymlinks` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** preserveSymlinks
  - `opts.resolver` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?** This option allows the use of a custom resolver. More information see [jest](https://jestjs.io/docs/en/configuration#resolver-string).
  - `opts.browser` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Respect Browserify's "browser" field in package.json when resolving modules. (optional, default `false`)
  - `opts.transformIgnorePatterns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** An array of regexp pattern strings that are matched against all source file paths before transformation. If the test path matches any of the patterns, it will not be transformed. (optional, default `['/node_modules/']`)
  - `opts.transform` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), ([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) | {name: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), options: any})>** A map from regular expressions to paths to transformers. A transformer is a module that provides a synchronous function for transforming source files. (optional, default `{}`)
  - `opts.globalSetup` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** This option allows the use of a custom global setup module which exports an async function that is triggered once.
  - `opts.globals` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** A set of global variables that need to be available in environments.
  - `opts.transformContext` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?** A sync function for transforming context.
  - `opts.global` **any** The reference on global environment. (optional, default `{...global}`)
  - `opts.moduleCache` **{}?** The reference of `require.cache`
  - `opts.moduleMain` **{}?** The reference of `require.main`
  - `opts.fs` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The fs module. (optional, default `require('fs')`)
  - `opts.vm` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The vm module. (optional, default `require('vm')`)

Returns **[RunResult](#runresult)**

### runFile

[index.js:78-84](https://github.com/imcuttle/my-runner/blob/df4d245ed13f7ce9bf314f165e6f78947c47212a/index.js#L78-L84 'Source code on GitHub')

Run file script

#### Parameters

- `filename` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
- `opts` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Same as `run` options parameter. (optional, default `{}`)

Returns **[RunResult](#runresult)**

### RunResult

[index.js:97-106](https://github.com/imcuttle/my-runner/blob/df4d245ed13f7ce9bf314f165e6f78947c47212a/index.js#L86-L95 'Source code on GitHub')

Type: {module: {exports}, exports, require, global}

### defaultAdvancedOptions

[index.js:105-105](https://github.com/imcuttle/my-runner/blob/df4d245ed13f7ce9bf314f165e6f78947c47212a/index.js#L105-L105 'Source code on GitHub')

The default options

## How to mock module?

my-runner had injected `myRunner` in global.

for example, [Mocking `prop-types`](examples/packages/computed-prop-types/libs/prop-types.js) and setting `moduleNameMapper` to be `{"^prop-types$": "/path/to/mock-prop-types.js"}`

### `myRunner`

#### `requireActual`

Requires the actual module rather than the mock module.

- Type: `Function`

## Contributing

- Fork it!
- Create your new branch:  
  `git checkout -b feature-new` or `git checkout -b fix-which-bug`
- Start your magic work now
- Make sure npm test passes
- Commit your changes:  
  `git commit -am 'feat: some description (close #123)'` or `git commit -am 'fix: some description (fix #123)'`
- Push to the branch: `git push`
- Submit a pull request :)

## Authors

This library is written and maintained by imcuttle, <a href="mailto:moyuyc95@gmail.com">moyuyc95@gmail.com</a>.

## License

MIT - [imcuttle](https://github.com/imcuttle) 🐟

const babel = require('babel-core')

module.exports = {
  moduleNameMapper: {
    '\\.less$': require.resolve('./libs/style-useable'),
    '^prop-types$': require.resolve('./libs/prop-types')
  },
  transform: {
    '\\.jsx?$': (code, { filename }) => {
      code = babel.transform(code, {
        filename,
        presets: [
          [
            require.resolve('babel-preset-env'),
            {
              exclude: ['transform-regenerator']
            }
          ],
          require.resolve('babel-preset-react')
        ],
        plugins: [
          require.resolve('babel-plugin-transform-class-properties'),
          require.resolve('babel-plugin-transform-object-rest-spread')
        ]
      }).code

      return code
    }
  },
  transformContext: context => {
    return {
      ...require('./libs/global-env'),
      ...context
    }
  }
}

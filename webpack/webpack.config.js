const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '~components': path.resolve(__dirname, '../src/components'),
      '~context': path.resolve(__dirname, '../src/context'),
      '~data': path.resolve(__dirname, '../src/data'),
      '~images': path.resolve(__dirname, '../src/images'),
      '~pages': path.resolve(__dirname, '../src/pages'),
      '~scss': path.resolve(__dirname, '../src/scss'),
      '~templates': path.resolve(__dirname, '../src/templates'),
      '~utilities': path.resolve(__dirname, '../src/utilities'),
    }
  }
}

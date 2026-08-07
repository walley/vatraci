// vue.config.js
const path = require('path');
const config = require('./src/config/config.js');

module.exports = {
  // Build files go to dist/<version> (e.g. dist/v4). The version comes from
  // the single VERSION constant in src/config/config.js.
  outputDir: path.resolve(__dirname, `dist/${config.version}`),

  // All JS, CSS, images etc. will be directly inside dist/<version>/ (no extra folder)
  assetsDir: '',

  // The app is served at /fad-fe/<version>/ - must match the nginx location.
  publicPath: `/fad-fe/${config.version}/`,

  configureWebpack: {
    devtool: 'source-map',
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 500000,
    },
  },

  transpileDependencies: ['vuetify'],
};

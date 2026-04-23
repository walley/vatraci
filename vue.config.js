// vue.config.js
const path = require('path');

module.exports = {
  // Build files will now go to dist/v3 instead of dist
  outputDir: path.resolve(__dirname, 'dist/v3'),

  // All JS, CSS, images etc. will be directly inside dist/v3/ (no extra folder)
  assetsDir: '',

  // This was already in your original file and is still needed because your app is served at /fad-fe/v3/
  publicPath: '/fad-fe/v3/',

  configureWebpack: {
    devtool: 'source-map',
  },

  transpileDependencies: ['vuetify'],
};

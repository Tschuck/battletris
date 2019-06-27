// initializers/stuffInit.js

const { Initializer, api } = require('actionhero');
const webpackConfig = require('../webpack.config.js');
const webpack = require('webpack');

module.exports = class FrontendBuilder extends Initializer {
  constructor () {
    super()
    this.name = 'FrontendBundler'
    this.loadPriority = 1000
    this.startPriority = 1000
    this.stopPriority = 1000
  }

  async initialize () {
    this.compiler = webpack(webpackConfig);

    new webpack.ProgressPlugin().apply(this.compiler);

    if (process.env.NODE_ENV === 'production') {
      this.compiler.run((err, stats) => {
        if (err) {
          api.log(err, 'error');
        } else if (stats.compilation.errors.length) {
          stats.compilation.errors.forEach(err => {
            api.log(err.message, 'error');
          });
          throw stats.compilation.errors[0].message;
        }
      });
    } else {
      this.watching = this.compiler.watch({}, (err, stats) => {
        if (err) {
          api.log(err, 'error');
          return;
        } else if (stats.compilation.errors.length) {
          stats.compilation.errors.forEach(err => {
            api.log(err.message, 'error');
          });
          return;
        }

        api.log('Bundled Frontend.');
      });
    }
  }

  async stop() {
    await new Promise((res, rej) => {
      this.watching.close(() => {
        api.log('watcher closed.');
        res();
      });
    });
  }
}
require('babel-register')({
    presets: ['env']
});

module.exports = require('./build-server/src/index.js')


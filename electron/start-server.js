require('babel-register')({
    presets: ['env']
});

module.exports = require('./build-server/index.js')


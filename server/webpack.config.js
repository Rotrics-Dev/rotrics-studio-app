const path = require("path")
const fs = require("fs");

const nodeModules = {};
fs.readdirSync('./node_modules')
    .filter((x) => {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach((mod) => {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    // devtool: 'source-map',
    entry: './src/index.js',
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: path.resolve(__dirname, "build-server"),
        filename: "startLocalServer.js",
        libraryTarget: "commonjs"
    },
    externals: nodeModules
};

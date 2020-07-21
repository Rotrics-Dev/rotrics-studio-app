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
    mode: 'development', //development, production
    devtool: 'source-map',
    entry: './src/index.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "localServer.js",
        libraryTarget: "commonjs"
    },
    externals: nodeModules
};

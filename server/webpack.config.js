const path = require('path');

module.exports = {
    entry: "./src/index.js",
    // devtool: 'source-map',
    output: {
        path: __dirname + "/build",
        filename: "server.js"
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ]
                    }
                }
            }
        ]
    }
};

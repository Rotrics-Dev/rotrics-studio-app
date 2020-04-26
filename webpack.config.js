var path = require('path');

module.exports = {
    entry: "./web/main.js",
    // devtool: 'source-map',
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(css|less)$/,
                include: /node_modules/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                }],
            },
            {
                test: /\.(css|less)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: '[path][name]__[local]--[hash:base64:5]',
                        },
                    }
                }],
            },
            {
                test: /\.(gif|png|jpg|ico|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: './asset/image/[hash].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "build")
    }
};

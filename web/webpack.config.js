const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODd
module.exports = {
    // devtool: 'source-map',
    entry: "./src/index.jsx",
    output: {
        path: __dirname + "/build-web",
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
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
            },
            {
                test: /\.worker\.js$/,
                use: {loader: 'worker-loader'}
            }
        ]
    },
    devServer: {
        port: 8080,
        compress: true,
        open:true,
        hot: true,
        contentBase: path.join(__dirname, "build-web")
    }
};

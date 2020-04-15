var path = require('path');

module.exports = {
    devtool: 'source-map',
    entry:  "./app/main.js",
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
                test: /\.css$/,
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        },
                    }
                ],
            },
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "build")
    }
};

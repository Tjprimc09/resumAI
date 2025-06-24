const path= require('path');
module.exports= {
    entry: path.resolve(__dirname, '../client/src/index.js'),
    output: {
        path: path.resolve(__dirname, '../client'),
        filename: 'bundle.js',
    },
module: {
    rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            },
        },
    ],
},
resolve: {
    extensions: ['.js', '.jsx'],
},
};
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entryPath = path.resolve(__dirname, '../src/index.js');
const outputPath = path.resolve(__dirname, '../dist');

console.log('BUILD CONFIG:');
console.log('  __dirname       =', __dirname);
console.log('  entry           =', entryPath);
console.log('  output.path     =', outputPath);

module.exports = {
  entry: entryPath,
  output: {
    path: outputPath,
    filename: 'bundle.js',
    clean: true,
  },
  devServer: {
    static: outputPath,
    port: 8081,
  },
  resolve: {
    extensions: ['.js', '.scss'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      // JS and JSX files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },

      // Unified SCSS handling (CSS Modules and global)
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.s[ac]ss$/i,
              },
              esModule: true,
            },
          },
          'sass-loader',
        ],
      },

      // Regular global CSS
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html'),
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin(),
  ],
  mode: 'development',
};

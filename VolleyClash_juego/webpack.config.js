const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: { directory: path.join(__dirname, 'public') },
    hot: true,
    port: 8080,

    proxy: [
      {
        context: ['/api', '/socket.io'],
        target: 'http://localhost:3000',
        ws: true
      }
    ]
  },
  externals: {
    phaser: 'Phaser'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: false
    })
  ],
  resolve: {
    extensions: ['.js']
  }
};
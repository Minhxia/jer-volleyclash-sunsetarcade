const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: ''
  },
  mode: 'production',
  devtool: 'inline-source-map',
  devServer: {
    static: { directory: path.join(__dirname, 'public') },
    hot: true,
    open: true,
    port: 3000,

    proxy: [
      {
        context: ['/api', '/socket.io'],
        target: 'http://localhost:8080',
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
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'public/ASSETS', // Origen
          to: 'ASSETS'          // Destino en dist/ASSETS
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.js']
  }
};
const path = require('path');
const isDevelopment = process.env.NODE_ENV === 'development';
const CopyPlugin = require('copy-webpack-plugin');
 
module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
            'style-loader', 'css-loader',
            {
                loader: 'sass-loader',
                options: {
                            sourceMap: isDevelopment
                        }
            }
        ]
    }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.scss' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    watchContentBase: true,
    port: 9000,
    hot: false,
    liveReload: false,
    writeToDisk: true
  },
  plugins: [
      new CopyPlugin([
          {
            from: './src/index.html',
            to: path.join(__dirname, 'dist') + '/index.html',
          },
          {
            from: './src/assets/',
            to: path.join(__dirname, 'dist') + '/assets/',
          }

      ])
    ]
};
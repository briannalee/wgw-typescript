const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { "zlib": require.resolve("browserify-zlib"), },
  },
  fallback: { "zlib": require.resolve("browserify-zlib"), },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
};
var path = require('path');

module.exports = {
  entry: './src/app.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  externals: [
    // Don't bundle pixi.js, assume it'll be included in the HTML via a script
    // tag, and made available in the global variable PIXI.
    {
      "pixi.js": "PIXI"
    }
  ]

};
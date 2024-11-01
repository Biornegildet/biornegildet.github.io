const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');

// Load environment variables from the specified file
const envFile = path.resolve(__dirname, 'baseurl.txt');
const envContent = fs.readFileSync(envFile, 'utf-8');

// Parse environment variables from the file content
const env = envContent.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    acc[key.trim()] = value.trim();
  }
  return acc;
}, {});

// Custom function to convert JavaScript values to Sass values
function jsToSassString(value) {
  return new (require('sass').types.String)(value);
}

module.exports = {
  mode: 'production',
  performance: {
    hints: false
  },
  entry: {
    main: [
      './_src/main.js',
      './_src/scss/main.scss'
    ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'static'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                functions: {
                  "env($variable)": variable => {
                    const key = variable.getValue().toUpperCase();
                    const value = env[key];
                    if (value) {
                      return jsToSassString(value);
                    } else {
                      throw new Error(`Environment variable ${key} not found`);
                    }
                  }
                }
              }
            },
          },
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    })
  ]
};

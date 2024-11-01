const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';
const envFilePath = isProduction ? 'baseurl.production.txt' : 'baseurl.development.txt';

console.log(`Loading environment variables from ${envFilePath}`);

// Load environment variables from the specified file
const envFile = path.resolve(__dirname, envFilePath);
const envContent = fs.readFileSync(envFile, 'utf-8');

// Parse environment variables from the file content
const env = envContent.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value !== undefined) {
    acc[key.trim()] = value.trim();
  }
  return acc;
}, {});

// Custom function to convert JavaScript values to Sass values
function jsToSassString(value) {
  return new (require('sass').types.String)(value);
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
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
                    if (value !== undefined) {
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
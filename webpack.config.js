const path = require('path')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const chunkManifest = require('./src/route-chunk-manifest.json')
const htmlTemplate = require('./public/index')

module.exports = (_, { mode }) => {
  const production = mode === 'production'

  return {
    devServer: {
      historyApiFallback: true,
      port: 3000,
      devMiddleware: { stats: 'errors-warnings' }
    },
    cache: { type: 'filesystem' },
    devtool: production ? undefined : 'source-map',
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: { transpileOnly: true }
            }
          ]
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.svg$/i,
          type: 'asset',
          resourceQuery: /url/
        },
        {
          test: /\.svg$/i,
          resourceQuery: { not: [/url/] },
          use: [{ loader: '@svgr/webpack', options: { dimensions: false } }]
        },
        {
          test: /\.(png|jpe?g|gif|bmp|webp)$/i,
          type: 'asset/resource',
          generator: { filename: 'images/[name].[hash:6][ext]' }
        }
      ]
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'js/[name].[contenthash:6].js',
      clean: true
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'initial',
        minSize: 40000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
          }
        }
      }
    },
    plugins: [
      ...(production ? [] : [new ForkTsCheckerPlugin()]),
      new ESLintPlugin(),
      ...chunkManifest.map(
        ({ name, data }) =>
          new HtmlPlugin({
            filename: `${name}.html`,
            scriptLoading: 'module',
            templateContent: ({ compilation }) => {
              const script = compilation
                .getAssets()
                .find(({ name: assetName }) => assetName.includes(`/${name}.`) && assetName.endsWith('.js')).name

              if (data && !Array.isArray(data)) data = [data]

              return htmlTemplate(script, data)
            }
          })
      ),
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: { ignore: ['**/index.js'] }
          }
        ]
      })
    ]
  }
}

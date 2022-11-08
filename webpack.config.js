const path = require('path')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const pagesManifest = require('./src/pages-manifest.json')
const htmlTemplate = require('./public/index')

module.exports = (_, { mode }) => {
  const production = mode === 'production'

  return {
    devServer: {
      historyApiFallback: true,
      port: 3000,
      devMiddleware: { stats: 'errors-warnings' }
    },
    devtool: production ? 'source-map' : 'inline-source-map',
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
              options: {
                getCustomTransformers: () => ({
                  before: production ? [] : [ReactRefreshTypeScript()]
                }),
                transpileOnly: true
              }
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
      publicPath: '/',
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
            chunks: 'all',
            name: (module, chunks) => {
              const allChunksNames = chunks.map(({ name }) => name).join('.')
              const moduleName = (module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]

              return `${moduleName}.${allChunksNames}`
            }
          }
        }
      }
    },
    plugins: [
      ...(production ? [] : [new ReactRefreshPlugin()]),
      ...(production ? [] : [new ForkTsCheckerPlugin()]),
      new ESLintPlugin(),
      ...pagesManifest.map(
        ({ chunk, path, data }) =>
          new HtmlPlugin({
            filename: `${path.slice(1).replace(':', '') || 'index'}.html`,
            inject: false,
            templateContent: ({ htmlWebpackPlugin, compilation }) => {
              const assets = compilation.getAssets()
              const mainAssets = htmlWebpackPlugin.files.js.map(file => decodeURIComponent(file).slice(1))
              const scripts = [
                ...mainAssets.map(asset => assets.find(({ name }) => asset === name)),
                ...assets.filter(({ name }) => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))
              ].map(({ name, source }) => ({ name, source: source._children[0]._value }))

              if (data && !Array.isArray(data)) data = [data]

              return htmlTemplate({ path, scripts, data })
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

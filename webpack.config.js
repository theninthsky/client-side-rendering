const path = require('path')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const { InjectManifest } = require('workbox-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin')
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
    cache: { type: 'filesystem' },
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
      filename: 'scripts/[name].[contenthash:6].js',
      clean: true
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'initial',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            minSize: 100000,
            name: (module, chunks) => {
              const allChunksNames = chunks.map(({ name }) => name).join('.')
              const moduleName = (module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]

              return `${moduleName}.${allChunksNames}`.replace('@', '')
            }
          }
        }
      }
    },
    plugins: [
      ...(production
        ? [
            new InjectManifest({
              include: [/fonts\//, /scripts\/.+\.js$/],
              swSrc: path.join(__dirname, 'public', 'service-worker.js')
            })
          ]
        : [new ReactRefreshPlugin(), new ForkTsCheckerPlugin(), new ESLintPlugin()]),
      new HtmlPlugin({
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const assets = compilation.getAssets().map(({ name }) => name)
          const pages = pagesManifest.map(({ chunk, path, data }) => {
            const scripts = assets.filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

            if (data && !Array.isArray(data)) data = [data]

            return { path, scripts, data }
          })

          return htmlTemplate(pages)
        }
      }),
      new HtmlInlineScriptPlugin({ scriptMatchPattern: [/runtime.+[.]js$/] }),
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

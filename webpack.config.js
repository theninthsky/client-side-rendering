import path from 'node:path'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ForkTsCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import { InjectManifest } from 'workbox-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import HtmlInlineScriptPlugin from 'html-inline-script-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

import pagesManifest from './src/pages-manifest.js'
import htmlTemplate from './public/index.js'

const __dirname = import.meta.dirname

export default (_, { mode }) => {
  const production = mode === 'production'

  return {
    devServer: {
      historyApiFallback: true,
      port: 3000,
      devMiddleware: { stats: 'errors-warnings' }
    },
    cache: { type: 'filesystem' },
    experiments: { lazyCompilation: !production },
    devtool: production ? 'source-map' : 'inline-source-map',
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
      path: path.join(__dirname, 'build'),
      publicPath: '/',
      filename: 'scripts/[name].[contenthash:6].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/i,
          exclude: /(node_modules)/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: {
                  react: { runtime: 'automatic', refresh: true }
                },
                target: 'es2017',
                preserveAllComments: true
              }
            }
          }
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
        : [
            new ReactRefreshPlugin(),
            new ForkTsCheckerPlugin(),
            new ESLintPlugin({ extensions: ['js', 'ts', ' jsx', 'tsx'] })
          ]),
      new HtmlPlugin({
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const assets = compilation.getAssets().map(({ name }) => name)
          const pages = pagesManifest.map(({ chunk, path, data }) => {
            const scripts = assets.filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

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

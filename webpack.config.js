import { join, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
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
    // cache: { type: 'filesystem', memoryCacheUnaffected: true },
    // experiments: { cacheUnaffected: true, lazyCompilation: !production },
    devtool: production ? 'source-map' : 'inline-source-map',
    resolve: {
      modules: [resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
      path: join(__dirname, 'build'),
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
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { modules: true }
            }
          ]
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
      realContentHash: false,
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
        ? ['prefetch', 'swr'].map(
            swType =>
              new InjectManifest({
                include: [/fonts\//, /scripts\/.+\.js$/],
                swSrc: join(__dirname, 'public', `${swType}-service-worker.js`)
              })
          )
        : [
            new ReactRefreshPlugin(),
            new ForkTsCheckerPlugin(),
            new ESLintPlugin({ extensions: ['js', 'ts', ' jsx', 'tsx'] })
          ]),
      new HtmlPlugin({
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const rawAssets = compilation.getAssets()
          const assets = rawAssets.map(({ name }) => name)

          const fullAssets = rawAssets
            .filter(({ name }) => name.startsWith('scripts/') && name.endsWith('.js'))
            .map(({ name, source }) => ({ name, source: source._children?.[0]._valueAsString }))

          writeFileSync(join(__dirname, 'public', 'assets.js'), JSON.stringify(fullAssets))

          const pages = pagesManifest.map(({ chunk, path, data }) => {
            const scripts = assets.filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

            return { path, scripts, data }
          })

          return htmlTemplate(pages)
        }
      }),
      // new HtmlInlineScriptPlugin({ scriptMatchPattern: [/runtime.+[.]js$/] }),
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

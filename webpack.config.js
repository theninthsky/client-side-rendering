import { join, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ForkTsCheckerPlugin from 'fork-ts-checker-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import { InjectManifest } from 'workbox-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
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
            minSize: 10000,
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
        ? ['precache', 'swr'].map(
            swType =>
              new InjectManifest({
                include: [/fonts\//, /scripts\/.+\.js$/],
                swSrc: join(__dirname, 'public', 'workers', `${swType}-service-worker.js`),
                swDest: `workers/${swType}-service-worker.js`
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
          const assets = compilation.getAssets()
          const pages = pagesManifest.map(({ chunk, path, data }) => {
            const scripts = assets
              .map(({ name }) => name)
              .filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

            return { path, scripts, data }
          })

          if (production) {
            const assetsWithSource = assets
              .filter(({ name }) => /^scripts\/.+\.js$/.test(name))
              .map(({ name, source }) => ({
                url: `/${name}`,
                source: source.source(),
                parentPaths: pages.filter(({ scripts }) => scripts.includes(name)).map(({ path }) => path)
              }))

            writeFileSync(join(__dirname, 'public', 'assets.js'), JSON.stringify(assetsWithSource))
          }

          return htmlTemplate(pages)
        }
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: { ignore: ['**/index.js', '**/workers/*'] },
            info: { minimized: true }
          }
        ]
      })
    ]
  }
}

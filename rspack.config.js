import { join, resolve } from 'node:path'
import rspack from '@rspack/core'
import ReactRefreshPlugin from '@rspack/plugin-react-refresh'
import ESLintPlugin from 'eslint-webpack-plugin'
import { InjectManifest } from '@aaroon/workbox-rspack-plugin'
import HtmlPlugin from 'html-webpack-plugin'

import InjectAssetsPlugin from './scripts/inject-assets-plugin.js'

const __dirname = import.meta.dirname

export default (_, { mode }) => {
  const production = mode === 'production'

  return {
    devServer: {
      historyApiFallback: true,
      port: 3000,
      devMiddleware: { stats: 'errors-warnings' }
    },
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
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: {
                  react: { runtime: 'automatic', development: !production, refresh: !production }
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
      new ReactRefreshPlugin(),
      new ESLintPlugin({ extensions: ['js', 'ts', ' jsx', 'tsx'] }),
      new HtmlPlugin({ template: 'public/index.html', scriptLoading: 'module' }),
      new rspack.CopyRspackPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: { ignore: ['**/index.html'] },
            info: { minimized: true }
          }
        ]
      }),
      new InjectManifest({
        include: [/fonts\//, /scripts\/.+\.js$/],
        swSrc: join(__dirname, 'public', 'service-worker.js'),
        compileSrc: false,
        maximumFileSizeToCacheInBytes: 10000000
      }),
      new InjectAssetsPlugin()
    ]
  }
}

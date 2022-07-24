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
      hot: true,
      historyApiFallback: true,
      port: 3000,
      devMiddleware: { stats: 'errors-warnings' }
    },
    cache: { type: 'filesystem' },
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
            name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
          }
        }
      }
    },
    plugins: [
      ...(production ? [] : [new ReactRefreshPlugin()]),
      ...(production ? [] : [new ForkTsCheckerPlugin()]),
      new ESLintPlugin(),
      new HtmlPlugin({
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const pages = pagesManifest.map(({ name, path, vendors, data }) => {
            const assets = compilation.getAssets().map(({ name }) => name)
            const script = assets.find(assetName => assetName.includes(`/${name}.`) && assetName.endsWith('.js'))
            const vendorScripts = vendors
              ? assets.filter(name => vendors.find(vendor => name.includes(`/${vendor}.`) && name.endsWith('.js')))
              : []

            if (data && !Array.isArray(data)) data = [data]

            return { name, path, scripts: [script, ...vendorScripts], data }
          })

          return htmlTemplate(pages)
        }
      }),
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

const path = require('path')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const htmlTemplate = require('./public/index')
const routes = require('./src/routes.json')

module.exports = (_, { mode }) => {
  const production = mode === 'production'

  return {
    devServer: {
      historyApiFallback: true,
      port: 3000,
      open: true,
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
      ...routes.map(
        route =>
          new HtmlPlugin({
            filename: `${route.slice(1)}.html`,
            scriptLoading: 'module',
            templateContent: ({ compilation }) => {
              const assets = compilation.getAssets().map(({ name }) => name)
              const pageScript = assets.find(name => name.includes(route) && name.endsWith('js'))
              let pageData

              try {
                require(`./public/json${route}.json`)

                pageData = `json${route}.json`
              } catch {}

              return htmlTemplate(pageScript, pageData)
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

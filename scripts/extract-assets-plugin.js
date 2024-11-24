import { join } from 'node:path'
import { writeFileSync } from 'node:fs'

import pagesManifest from '../src/pages.js'

const __dirname = import.meta.dirname

class ExtractAssetsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('ExtractAssetsPlugin', (compilation, callback) => {
      const assets = compilation.getAssets()

      const pages = pagesManifest.map(({ chunk, path, title, data }) => {
        const scripts = assets
          .map(({ name }) => name)
          .filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

        return { path, scripts, title, data }
      })

      const assetsWithSource = assets
        .filter(({ name }) => /^scripts\/.+\.js$/.test(name))
        .map(({ name, source }) => ({
          url: `/${name}`,
          source: source.source(),
          parentPaths: pages.filter(({ scripts }) => scripts.includes(name)).map(({ path }) => path)
        }))

      writeFileSync(join(__dirname, '..', 'public', 'assets.js'), JSON.stringify(assetsWithSource))

      const data = pages.map(({ scripts, ...rest }) => ({ ...rest }))

      writeFileSync(
        join(__dirname, '..', 'public', 'pages.js'),
        JSON.stringify(data, (_, value) => {
          return typeof value === 'function' ? `func:${value.toString()}` : value
        })
      )

      callback()
    })
  }
}

export default ExtractAssetsPlugin

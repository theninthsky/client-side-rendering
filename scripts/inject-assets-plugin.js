import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import HtmlPlugin from 'html-webpack-plugin'

import pagesManifest from '../src/pages.js'

const __dirname = import.meta.dirname

const getPages = rawAssets => {
  const pages = Object.entries(pagesManifest).map(([chunk, { path, title, data }]) => {
    const scripts = rawAssets.map(({ name }) => name).filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

    return { path, scripts, title, data }
  })

  return pages
}

class InjectAssetsPlugin {
  apply(compiler) {
    const production = compiler.options.mode === 'production'

    compiler.hooks.compilation.tap('InjectAssetsPlugin', compilation => {
      HtmlPlugin.getCompilationHooks(compilation).beforeEmit.tapAsync('InjectAssetsPlugin', (data, callback) => {
        const preloadAssets = readFileSync(join(__dirname, '..', 'scripts', 'preload-assets.js'), 'utf-8')

        const rawAssets = compilation.getAssets()
        const pages = getPages(rawAssets)
        const stringifiedPages = JSON.stringify(pages, (_, value) => {
          return typeof value === 'function' ? `func:${value.toString()}` : value
        })

        let { html } = data

        html = html.replace(
          '</title>',
          () => `</title><script id="preload-data">const pages=${stringifiedPages}\n${preloadAssets}</script>`
        )

        callback(null, { ...data, html })
      })
    })

    if (!production) return

    compiler.hooks.afterEmit.tapAsync('InjectAssetsPlugin', (compilation, callback) => {
      let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')
      let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')

      html = html
        .replace(/type=\"module\"/g, () => 'defer')
        .replace(/,"scripts":\s*\[(.*?)\]/g, () => '')
        .replace('preloadScripts(scripts)', () => '')

      const rawAssets = compilation.getAssets()
      const pages = getPages(rawAssets)
      const assets = rawAssets
        .filter(({ name }) => /^scripts\/.+\.js$/.test(name))
        .map(({ name, source }) => ({
          url: `/${name}`,
          source: source.source(),
          parentPaths: pages.filter(({ scripts }) => scripts.includes(name)).map(({ path }) => path)
        }))

      const initialScriptsString = html.match(/<script\s+defer[^>]*>([\s\S]*?)(?=<\/head>)/)[0]
      const initialScriptsStrings = initialScriptsString.split('</script>')
      const initialScripts = assets
        .filter(({ url }) => initialScriptsString.includes(url))
        .map(asset => ({ ...asset, order: initialScriptsStrings.findIndex(script => script.includes(asset.url)) }))
        .sort((a, b) => a.order - b.order)
      const asyncScripts = assets.filter(asset => !initialScripts.includes(asset))
      const documentEtag = createHash('sha256').update(html).digest('hex').slice(0, 16)

      worker = worker
        .replace('INJECT_INITIAL_SCRIPTS_STRING_HERE', () => JSON.stringify(initialScriptsString))
        .replace('INJECT_INITIAL_SCRIPTS_HERE', () => JSON.stringify(initialScripts))
        .replace('INJECT_ASYNC_SCRIPTS_HERE', () => JSON.stringify(asyncScripts))
        .replace('INJECT_HTML_HERE', () => JSON.stringify(html))
        .replace('INJECT_DOCUMENT_ETAG_HERE', () => JSON.stringify(documentEtag))

      writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)

      callback()
    })
  }
}

export default InjectAssetsPlugin

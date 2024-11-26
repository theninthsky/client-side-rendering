import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

import pagesManifest from '../src/pages.js'

const __dirname = import.meta.dirname

class InjectAssetsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('InjectAssetsPlugin', (compilation, callback) => {
      const preloadAssets = readFileSync(join(__dirname, '..', 'scripts', 'preload-assets.js'), 'utf-8')
      let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
      let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

      const rawAssets = compilation.getAssets()

      const pages = Object.entries(pagesManifest).map(([chunk, { path, title, data, preconnect }]) => {
        const scripts = rawAssets
          .map(({ name }) => name)
          .filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

        return { path, scripts, title, data, preconnect }
      })

      const assets = rawAssets
        .filter(({ name }) => /^scripts\/.+\.js$/.test(name))
        .map(({ name, source }) => ({
          url: `/${name}`,
          source: source.source(),
          parentPaths: pages.filter(({ scripts }) => scripts.includes(name)).map(({ path }) => path)
        }))

      const stringifiedPages = JSON.stringify(pages, (_, value) => {
        return typeof value === 'function' ? `func:${value.toString()}` : value
      })

      const initialModuleScriptsString = html.match(/<script\s+type="module"[^>]*>([\s\S]*?)(?=<\/head>)/)[0]
      const initialModuleScripts = initialModuleScriptsString.split('</script>')
      const initialScripts = assets
        .filter(({ url }) => initialModuleScriptsString.includes(url))
        .map(asset => ({ ...asset, order: initialModuleScripts.findIndex(script => script.includes(asset.url)) }))
        .sort((a, b) => a.order - b.order)
      const asyncScripts = assets.filter(asset => !initialScripts.includes(asset))
      const htmlChecksum = createHash('sha256').update(html).digest('hex')

      html = html.replace(
        '</title>',
        () => `</title><script id="preload-data">const pages=${stringifiedPages}\n${preloadAssets}</script>`
      )

      writeFileSync(join(__dirname, '..', 'build', 'index.html'), html)

      html = html
        .replace(/,"scripts":\s*\[(.*?)\]/g, () => '')
        .replace(/scripts\.forEach[\s\S]*?data\?\.\s*forEach/, () => 'data?.forEach')
        .replace(/preloadAssets/g, () => 'preloadData')

      worker = worker
        .replace('INJECT_INITIAL_MODULE_SCRIPTS_STRING_HERE', () => JSON.stringify(initialModuleScriptsString))
        .replace('INJECT_INITIAL_SCRIPTS_HERE', () => JSON.stringify(initialScripts))
        .replace('INJECT_ASYNC_SCRIPTS_HERE', () => JSON.stringify(asyncScripts))
        .replace('INJECT_HTML_HERE', () => JSON.stringify(html))
        .replace('INJECT_HTML_CHECKSUM_HERE', () => JSON.stringify(htmlChecksum))

      writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)

      callback()
    })
  }
}

export default InjectAssetsPlugin

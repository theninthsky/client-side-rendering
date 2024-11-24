import { join } from 'node:path'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'

const __dirname = import.meta.dirname

const assets = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8'))
const pages = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'pages.js'), 'utf-8'))
const preloadData = readFileSync(join(__dirname, '..', 'scripts', 'preload-data.js'), 'utf-8')
let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

const initialModuleScriptsString = html.match(/<script\s+type="module"[^>]*>([\s\S]*?)(?=<\/head>)/)[0]
const initialModuleScripts = initialModuleScriptsString.split('</script>')
const initialScripts = assets
  .filter(({ url }) => initialModuleScriptsString.includes(url))
  .map(asset => ({ ...asset, order: initialModuleScripts.findIndex(script => script.includes(asset.url)) }))
  .sort((a, b) => a.order - b.order)
const asyncScripts = assets.filter(asset => !initialScripts.includes(asset))
const htmlChecksum = createHash('sha256').update(html).digest('hex')

html = html.replace(
  '</head>',
  () => `<script id="preload-data">const pages=${JSON.stringify(pages)}\n${preloadData}</script></head>`
)

worker = worker
  .replace('INJECT_INITIAL_MODULE_SCRIPTS_STRING_HERE', () => JSON.stringify(initialModuleScriptsString))
  .replace('INJECT_INITIAL_SCRIPTS_HERE', () => JSON.stringify(initialScripts))
  .replace('INJECT_ASYNC_SCRIPTS_HERE', () => JSON.stringify(asyncScripts))
  .replace('INJECT_HTML_HERE', () => JSON.stringify(html))
  .replace('INJECT_HTML_CHECKSUM_HERE', () => JSON.stringify(htmlChecksum))

rmSync(join(__dirname, '..', 'public', 'assets.js'))
rmSync(join(__dirname, '..', 'public', 'pages.js'))
writeFileSync(join(__dirname, '..', 'build', 'index.html'), html)
writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)

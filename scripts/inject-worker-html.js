import { join } from 'node:path'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

const __dirname = import.meta.dirname

const assets = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8'))
let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

const initialScriptsString = html.match(/<script\s+type="module"[^>]*>([\s\S]*?)(?=<\/head>)/)[0]
const initialScripts = assets.filter(({ url }) => initialScriptsString.includes(url))
const asyncScripts = assets.filter(asset => !initialScripts.includes(asset))

html = html
  .replace(/,"scripts":\s*\[(.*?)\]/g, () => '')
  .replace(/scripts\.forEach[\s\S]*?data\?\.\s*forEach/, () => 'data?.forEach')
  .replace(/preloadAssets/g, () => 'preloadData')

worker = worker
  .replace('INJECT_INITIAL_SCRIPTS_STRING_HERE', () => JSON.stringify(initialScriptsString))
  .replace('INJECT_INITIAL_SCRIPTS_HERE', () => JSON.stringify(initialScripts))
  .replace('INJECT_ASYNC_SCRIPTS_HERE', () => JSON.stringify(asyncScripts))
  .replace('INJECT_HTML_HERE', () => JSON.stringify(html))
  .replace('</body>', () => '<!-- INJECT_SCRIPTS_HERE --></body>')

rmSync(join(__dirname, '..', 'public', 'assets.js'))
writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)

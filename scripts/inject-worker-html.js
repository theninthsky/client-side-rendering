import { join } from 'node:path'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

const __dirname = import.meta.dirname

const assets = readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8')
let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

html = html
  .replace(/,"scripts":\s*\[(.*?)\]/g, () => '')
  .replace(/scripts\.forEach[\s\S]*?data\?\.\s*forEach/, () => 'data?.forEach')
  .replace(/preloadAssets/g, () => 'preloadData')

worker = worker.replace('INJECT_ASSETS_HERE', () => assets).replace('INJECT_HTML_HERE', () => JSON.stringify(html))

rmSync(join(__dirname, '..', 'public', 'assets.js'))
writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)

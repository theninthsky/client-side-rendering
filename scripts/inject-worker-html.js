import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const __dirname = import.meta.dirname

const pages = readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8')
const html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

worker = worker.replace('INJECT_PAGES_HERE', () => pages)
worker = worker.replace('INJECT_HTML_HERE', () => JSON.stringify(html))

writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)

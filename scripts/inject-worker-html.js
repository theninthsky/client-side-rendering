import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const __dirname = import.meta.dirname

const pages = readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8')
let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let workerFile = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

const cachedAssets = [
  '/scripts/runtime.2b555a.js',
  '/scripts/main.a37345.js',
  '/scripts/react-dom.main.1043d5.js',
  '/scripts/remix-run.main.f2f0dd.js',
  '/scripts/mui.main.d68ff2.js',
  '/scripts/423.2112bb.js'
]
const parsedPages = JSON.parse(pages)
const uncachedAssets = parsedPages.filter(({ url }) => !cachedAssets.includes(url))

uncachedAssets.forEach(({ url, source }) => {
  html = html.replace(
    `<script type="module" src="${url}"></script>`,
    () => `<script id="${url}" type="module">${source}</script>`
  )
})

// console.log(html)

writeFileSync(join(__dirname, '..', 'build', 'injected.html'), html)
// writeFileSync(join(__dirname, '..', 'build', '_worker.js'), workerFile.replace('INJECT_PAGES_HERE', pages))

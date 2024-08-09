import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const __dirname = import.meta.dirname

const pages = readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8')
let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let workerFile = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

const cachedAssets = [
  'scripts/runtime.2b555a.js',
  'scripts/main.31c5e7.js',
  'scripts/react-dom.main.1043d5.js',
  'scripts/remix-run.main.f2f0dd.js',
  'scripts/mui.main.d68ff2.js',
  'scripts/423.2112bb.js'
  // 'scripts/core-web-vitals.d084d8.js',
  // 'scripts/moment.lorem-ipsum.pokemon.pokemon-info.comparison.core-web-vitals.ec4557.js',
  // 'scripts/lodash.lorem-ipsum.pokemon.pokemon-info.comparison.core-web-vitals.100cc9.js',
  // 'scripts/jquery.lorem-ipsum.pokemon.pokemon-info.comparison.core-web-vitals.34f47f.js',
  // 'scripts/mui.home.35ba8f.js',
  // 'scripts/tanstack.comparison.9530b6.js'
]
const parsedPages = JSON.parse(pages)
const uncachedAssets = parsedPages.filter(({ name }) => !cachedAssets.includes(name))

uncachedAssets.forEach(({ name, source }) => {
  html = html.replace(
    `<script type="module" src="/${name}"></script>`,
    () => `<script id="${name}" type="module">${source}</script>`
  )
})

// console.log(html)

writeFileSync(join(__dirname, '..', 'build', 'injected.html'), html)
// writeFileSync(join(__dirname, '..', 'build', '_worker.js'), workerFile.replace('INJECT_PAGES_HERE', pages))

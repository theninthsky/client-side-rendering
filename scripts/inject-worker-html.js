import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const __dirname = import.meta.dirname

const pages = readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8')
let htmlFile = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let workerFile = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

const cachedAssets = ['scripts/main.31c5e7.js', 'scripts/react-dom.main.1043d5.js']
const parsedPages = JSON.parse(pages)
const uncachedAssets = parsedPages.filter(({ name }) => !cachedAssets.includes(name))

uncachedAssets.forEach(({ name, source }) => {
  // console.log(`<script type="module" src="/${name}"></script>`)

  htmlFile = htmlFile.replace(
    `<script type="module" src="/${name}"></script>`,
    `<script type="module">${source}</script>`
  )
})

// for (const { name, source } of uncachedAssets) {
//   htmlFile = htmlFile.replace(
//     `<script type="module" src="/${name}"></script>`,
//     `<script type="module">${source}</script>`
//   )
// }

// console.log(htmlFile)

writeFileSync(join(__dirname, '..', 'build', '_worker.js'), workerFile.replace('INJECT_PAGES_HERE', pages))

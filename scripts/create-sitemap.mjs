import { Readable } from 'stream'
import { writeFile } from 'fs/promises'
import { SitemapStream, streamToPromise } from 'sitemap'

import pagesManifest from '../src/pages-manifest.json' assert { type: 'json' }

const dynamicMaps = {
  '/pokemon/:': ['pichu', 'pikachu', 'raichu']
}

const staticPaths = pagesManifest.filter(({ path }) => !path.includes(':')).map(({ path }) => path)
const dynamicPaths = Object.keys(dynamicMaps).reduce(
  (acc, path) => [...acc, ...dynamicMaps[path].map(value => path.replace(':', value))],
  []
)
const paths = [...staticPaths, ...dynamicPaths]

const stream = new SitemapStream({ hostname: 'https://client-side-rendering.pages.dev' })
const links = paths.map(path => ({ url: path, changefreq: 'daily' }))

streamToPromise(Readable.from(links).pipe(stream))
  .then(data => data.toString())
  .then(res => writeFile('public/sitemap.xml', res))
  .then(() => console.log(`Sitemap created with the following paths: \n\n${paths.join('\n')}\n`))
  .catch(console.log)

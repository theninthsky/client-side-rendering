import { Readable } from 'stream'
import { writeFile } from 'fs/promises'
import axios from 'axios'
import { SitemapStream, streamToPromise } from 'sitemap'

import pagesManifest from '../src/pages-manifest.js'

const rawPokemon = await axios('https://pokeapi.co/api/v2/pokemon?limit=10000')
const pokemon = rawPokemon.data.results.map(({ name }) => name)

const dynamicMaps = {
  '/pokemon/:': pokemon
}

const staticPaths = pagesManifest.filter(({ path }) => !path.includes(':')).map(({ path }) => path)
const dynamicPaths = Object.keys(dynamicMaps).reduce(
  (acc, path) => [...acc, ...dynamicMaps[path].map(value => path.replace(':', value))],
  []
)
const paths = [...staticPaths, ...dynamicPaths]
const links = paths.map(path => ({ url: path, changefreq: 'weekly' }))
const stream = new SitemapStream({ hostname: 'https://client-side-rendering.pages.dev' })

streamToPromise(Readable.from(links).pipe(stream))
  .then(data => data.toString())
  .then(res => writeFile('public/sitemap.xml', res))
  .then(() => console.log('Sitemap created.'))
  .catch(console.log)

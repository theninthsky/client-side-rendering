import { Readable } from 'stream'
import { writeFile } from 'fs/promises'
import { SitemapStream, streamToPromise } from 'sitemap'

import pages from '../src/pages.js'

const pokemonResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
const rawPokemon = await pokemonResponse.json()
const pokemon = rawPokemon.results.map(({ name }) => name)

const dynamicMaps = {
  '/pokemon/:': pokemon
}

const staticPaths = Object.values(pages)
  .filter(({ path }) => !path.includes(':'))
  .map(({ path }) => path)
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

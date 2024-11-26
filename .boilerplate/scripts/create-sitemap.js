import { Readable } from 'stream'
import { writeFile } from 'fs/promises'
import { SitemapStream, streamToPromise } from 'sitemap'

import pages from '../src/pages.js'

const paths = Object.values(pages)
  .filter(({ path }) => !path.includes(':'))
  .map(({ path }) => path)
const stream = new SitemapStream({ hostname: 'https://example.com' })
const links = paths.map(path => ({ url: path, changefreq: 'weekly' }))

streamToPromise(Readable.from(links).pipe(stream))
  .then(data => data.toString())
  .then(res => writeFile('public/sitemap.xml', res))
  .then(() => console.log('Sitemap created.'))
  .catch(console.log)

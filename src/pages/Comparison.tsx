import type { FC } from 'react'
import { Meta } from 'frontend-essentials'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import { DESKTOP_VIEWPORT } from 'styles/constants'
import Title from 'components/common/Title'
import Subtitle from 'components/common/Subtitle'
import Info from 'components/common/Info'
import List from 'components/common/List'
import Table from 'components/common/Table'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

const { title, description } = pagesManifest.find(({ chunk }) => chunk === 'comparison') as any

const listData = {
  csr: {
    name: 'CSR',
    title: 'Client-side Rendering',
    pros: [
      {
        value: 'Loads independently from its data',
        description:
          'Since the app is completely decoupled from its data, the time it takes for the data to arrive from the server is irrelevant.\nWhen the static assets finish downloading, the browser will immidiately start rendering the app so it is visible to the user (usually showing spinners/skeletons)'
      },
      {
        value: 'Loads quickly once cached',
        description:
          'Since all assets static, they can be cached by the browser and load quickly.\nOnly the HTML request goes out to the server'
      },
      {
        value: 'Page transitions are instantaneous',
        description:
          'Since the entire app (shell) is downloaded, page transitions require no additional assets from the CDN since those are immediately served from the browser cache.\nThe data itself does require additional requsts, however these have no effect on how fast the page will transition.\nTransitions will even work when there is no internet connection at all'
      },
      {
        value: 'Unmatched performance with SWR',
        description: (
          <p>
            When using{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#the-swr-approach" target="_blank">
              SWR
            </a>{' '}
            for the app shell, the app loads instantly
          </p>
        )
      },
      {
        value: 'Is not affected by load',
        description:
          'Since static apps can be served entirely from CDNs that have an enormous amount of throughput (such as Cloudflare), the amount of concurrent requests to our app has no effect on how fast each one will be satisfied'
      },
      {
        value: 'Uses minimal data',
        description: (
          <p>
            When loading the app with a fully valid cache, the document will get a <em>304 Not Modified</em> status code
            from the CDN, so practically no additional data will be used in order to show the app (shell)
          </p>
        )
      },
      {
        value: 'Is very simple to develop',
        description:
          'Requires no conceptual separation between code that runs on the server to code that runs on the client.\nHas no compatibility issues with third-party packages nor the need to tweak those in order for them to work properly'
      },
      {
        value: 'Requires no dedicated server',
        description:
          'Since all assets are static, there is no need for a sophisticated server to render the app, and it can be served freely and limitlessly from a CDN'
      }
    ],
    cons: [
      {
        value: 'Initial load might be a bit slow',
        description: (
          <p>
            During the initial load (when no cache exists in the browser), all scripts have to be downloaded, parsed and
            executed before the page becomes visible.
            <br />
            This can be greatly improved by{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#code-splitting" target="_blank">
              code-splitting
            </a>
          </p>
        )
      },
      {
        value: 'Load time is suboptimal upon cache invalidation',
        description:
          'When some of the cache invalidates (as new assets are available), it will need to be redownloaded.\nThis slightly hurts performance'
      },
      {
        value: 'Delayed data fetching',
        description: (
          <p>
            The data is being fetched only when the app is rendered (after JS execution).
            <br />
            This can be completely overcome by{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#preloading-data" target="_blank">
              preloading data
            </a>
          </p>
        )
      },
      {
        value: 'Not great for SEO',
        description: (
          <p>
            The HTML document will contain no data, so SEO is heavily dependant on the ability of web crawlers to render
            JS (currently only <em>Googlebot</em> can do that).
            <br />
            Thus, a{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#prerendering" target="_blank">
              prerendering server
            </a>{' '}
            has to be set up to serve all crawlers
          </p>
        )
      }
    ]
  },
  ssr: {
    name: 'SSR',
    title: 'Server-side Rendering',
    pros: [
      {
        value: 'Great for SEO',
        description:
          'Pages initially contain all of their data, so all web crawlers will be able to properly crawl and index them'
      },
      {
        value: 'Potentially loads fast',
        description:
          'Pages have the potential to load quickly (provided their data fetches swiftly and the CSS is inlined in the document), since their visibility is independent of JS.\nIn such cases, the FCP will be generally low'
      }
    ],
    cons: [
      {
        value: 'Heavily depends on data to render',
        description:
          'The initial page response time heavily depends on how fast the API server responds with the data.\nThis means that page visibility is strongly coupled with both proximity to the server and query time, as users will see absolutely nothing until the page fully renders on the server and then sent to them'
      },
      {
        value: 'Delayed interactivity',
        description: (
          <p>
            Until all JS downloads and executes (
            <em>
              <a href="https://www.builder.io/blog/hydration-is-pure-overhead" target="_blank">
                hydration
              </a>
            </em>
            ), the page remians noninteractive (meaning it will not react to any user event that involves JS)
          </p>
        )
      },
      {
        value: 'Slow page transitions',
        description:
          'Page transitions are slow since they are data dependant, and data takes time to fetch and render on the server'
      },
      {
        value: 'Cannot prefetch pages',
        description:
          "Since pages have embedded data, it's impossible to prefetch or cache all pages without applying excessive load on the rendering and API servers"
      },
      {
        value: 'Cannot be a real PWA',
        description:
          'As an extension to the previews con, even if we have very few pages, caching them for offline use will make them show potentially stale data (since no fetch occurs in them, it only occurs in the server)'
      },
      {
        value: 'Greatly impacted by load',
        description: (
          <p>
            Since rendering is serial (
            <em>
              <a
                href="https://web.dev/rendering-on-the-web/#server-side-rendering-versus-static-rendering"
                target="_blank"
              >
                renderToString
              </a>
            </em>
            ), the rendering of concurrent requests will not be handled in parallel
          </p>
        )
      },
      {
        value: 'Is more complicated to develop',
        description: (
          <p>
            Since the code runs both on the server and on the client, it is crucial to verify which object are usable on
            each plafrom (see{' '}
            <em>
              <a
                href="https://stackoverflow.com/questions/55151041/window-is-not-defined-in-next-js-react-app"
                target="_blank"
              >
                window is not defined
              </a>
            </em>
            ).
            <br />
            In addition, some tools are not optimized for SSR or require some modification in order to work
          </p>
        )
      },
      {
        value: 'Uses more data',
        description: (
          <p>
            Since an SSR page consists of both complete HTML page and the scripts to render it (used for hydration),
            users are downloading more data than they should.
            <br />
            Additionally, SSR pages cannot return a <em>304 Not Modified</em> status code, every page has to be
            downloaded entirely on every single navigation
          </p>
        )
      },
      {
        value: 'Requires a dedicated server',
        description:
          'While there are many platforms that allow for easy deployment of servers (such as Vercel), these services are limited of what they can offer freely'
      }
    ]
  },
  ssg: {
    name: 'SSG',
    title: 'Static Site Generation',
    pros: [
      {
        value: 'Great for SEO',
        description:
          'Pages initially contain all of their data, so all web crawlers will be able to properly crawl and index them'
      },
      {
        value: 'Loads very quickly',
        description:
          'Since pages are pre-generated, they are immediately served from the CDN.\nAnd since they require no JS to be visible, they show up very quickly (especially when CSS is inlined)'
      },
      {
        value: 'Uses little data',
        description: (
          <p>
            When loading a pre-visited page with a fully valid cache, the document will get a <em>304 Not Modified</em>{' '}
            status code from the CDN, so practically no additional data will be used in order to show that page
          </p>
        )
      },
      {
        value: 'Requires no dedicated server',
        description:
          'Since all assets are static, there is no need for a sophisticated server to render the app, and it can be served freely and limitlessly from a CDN'
      }
    ],
    cons: [
      {
        value: 'Has very limited use cases',
        description: (
          <p>
            Since the vast majority of modern web apps include constnatly changing (and personalized) data, SSG serves
            as a poor option for them (in many apps in can be used solely for the <em>About</em> and <em>Login</em>{' '}
            pages)
          </p>
        )
      },
      {
        value: 'Will potentially show stale data',
        description: 'Many pregenerated pages have to be updated very frequently or they will show stale data'
      },
      {
        value: 'Prone to layout shifts',
        description: (
          <p>
            All JS-dependant visuals will only kick-in after JS have been loaded, causing a layout shift (
            <a href="https://death-to-ie11.com/" target="_blank">
              example
            </a>
            )
          </p>
        )
      },
      {
        value: 'Pages have to be stored in the CDN',
        description:
          'Since all pages are pre-generated (or incrementaly generated), they have to be stored in the CDN, which may lead to extra fees'
      },
      {
        value: 'Same SSR cons as #2, #4 and #5',
        description: 'While some pages can be prefetched, surely not all pages in large websites can be'
      }
    ]
  },
  streamingSsr: {
    name: 'Streaming SSR (RSC)',
    title: 'Streaming SSR (React Server Components)',
    pros: [
      {
        value: 'Great for SEO',
        description:
          'The rendering server does not return a status code until all data is fetched and streamed to the browser.\nThus all web crawlers will be able to properly crawl and index the pages'
      },
      {
        value: 'Loads independently from its data',
        description:
          'Since the document is streamed even before the data fetches on the server, the page load is completely decoupled from the API server response times'
      },
      {
        value: '"Zero Bundle Size"',
        description: (
          <p>
            Server components will not send any JS to the browser.{' '}
            <a href="https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components" target="_blank">
              Article
            </a>
          </p>
        )
      }
    ],
    cons: [
      {
        value: 'More complicated',
        description: (
          <p>
            More complicated than regular SSR (requires actual separation between client components and server
            components).{' '}
            <a href="https://phryneas.de/react-server-components-controversy" target="_blank">
              Article
            </a>
          </p>
        )
      },
      {
        value: 'Incompatible with many libraries',
        description: (
          <p>
            Many libraries (even fundamental ones) cannot be used with server components.{' '}
            <a href="https://github.com/emotion-js/emotion/issues/2978#issuecomment-1587020120" target="_blank">
              Article
            </a>
          </p>
        )
      },
      {
        value: '"Infinite Bundle Size"',
        description: (
          <p>
            The entire code-split JS template is downloaded upon each navigation.{' '}
            <a href="https://remix.run/blog/react-server-components#zero-bundle-or-infinite-bundle" target="_blank">
              Article
            </a>
          </p>
        )
      },
      {
        value: 'All SSR cons except for #1 and #3',
        description: 'Since they are very similar, Streaming SSR has most of SSR cons'
      }
    ]
  }
}

const tableNotes = [
  'Ratings assume deployment on Cloudflare network (with Workers)',
  'Ratings are relative to what is expected from each network speed and each category (repeated loads are expected to be faster than the initial load. Navigations are expected to be the fastest)',
  'Ratings consider visibility + intractability (for visibility only and on Slow Network, all non-CSR ratings should be at least B)',
  'Ratings assume good implementation (low bundle size; route-based code-splitting; prefetch of all scripts)',
  'Ratings assume the usage of React (48kb gzipped)',
  'Ratings exclude data fetching (except for SSR which has embedded data)',
  'SSR ratings heavily depend on server caching, query times and DB server proximity (hence "or lower")',
  "SSG might show stale data while the others won't",
  'A+ rating means near-instant load. S rating means instant load'
]

const columns = [
  { accessorKey: 'type', header: 'Type', cell: type => <span className={style.typeCell}>{type.getValue()}</span> },
  { accessorKey: 'initialLoad', header: 'Initial Load' },
  { accessorKey: 'repeatedLoads', header: 'Repeated Loads' },
  { accessorKey: 'navigations', header: 'Navigations' }
]

const slowNetworkData = [
  { type: 'CSR', initialLoad: 'C', repeatedLoads: 'A (full cache), B (partial cache)', navigations: 'S' },
  { type: 'CSR (SWR)', initialLoad: 'C', repeatedLoads: 'S', navigations: 'S' },
  {
    type: 'SSG',
    initialLoad: 'C',
    repeatedLoads: 'A (full cache), B (partial cache)',
    navigations: 'S (page is cached), A (page is not cached)'
  },
  {
    type: 'SSR',
    initialLoad: 'C or lower',
    repeatedLoads: 'A or lower (full cache), B or lower (partial cache)',
    navigations: 'A or lower'
  },
  { type: 'SSSR (RSC)', initialLoad: 'B', repeatedLoads: 'A (full cache), B (partial cache)', navigations: 'A' }
]

const fastNetworkData = [
  { type: 'CSR', initialLoad: 'A', repeatedLoads: 'A+ (full cache), A (partial cache)', navigations: 'S' },
  { type: 'CSR (SWR)', initialLoad: 'A', repeatedLoads: 'S', navigations: 'S' },
  {
    type: 'SSG',
    initialLoad: 'A',
    repeatedLoads: 'A+',
    navigations: 'S (page is cached), A+ (page is not cached)'
  },
  {
    type: 'SSR',
    initialLoad: 'A or lower',
    repeatedLoads: 'A or lower',
    navigations: 'B or lower'
  },
  { type: 'SSSR (RSC)', initialLoad: 'A', repeatedLoads: 'A+ (full cache), A (partial cache)', navigations: 'A+' }
]

const Comparison: FC<{}> = () => {
  return (
    <div>
      <Meta title={`${title} | Client-side Rendering`} description={description} />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {Object.values(listData).map(({ name, title, pros, cons }) => (
          <div key={name} className={style.section}>
            <Subtitle className={style.subtitle} title={title}>
              {name}
            </Subtitle>

            <div className={style.lists}>
              <List name="Pros" items={pros} />
              <List className={style.consList} name="Cons" items={cons} />
            </div>
          </div>
        ))}

        <h2 className={style.tableTitle}>Speed Comparison</h2>

        <ul className={style.tableNotes}>
          {tableNotes.map(note => (
            <li key={note}>- {note}</li>
          ))}
        </ul>

        <Table className={style.table} name="Slow Network" columns={columns} data={slowNetworkData} />

        <Table className={style.table} name="Fast Network" columns={columns} data={fastNetworkData} />
      </main>
    </div>
  )
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  main: css`
    margin-top: 30px;
  `,
  subtitle: css`
    margin-bottom: 15px;
  `,
  section: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 20px 0 40px 0;
  `,
  lists: css`
    display: flex;
    flex-direction: column;

    a,
    a:visited {
      color: inherit;
    }

    @media ${DESKTOP_VIEWPORT} {
      flex-direction: row;
    }
  `,
  consList: css`
    margin-top: 20px;

    @media ${DESKTOP_VIEWPORT} {
      margin: 0;
      margin-left: 40px;
    }
  `,
  tableTitle: css`
    font-size: 28px;
    font-weight: 500;
    color: var(--primary-color);
  `,
  tableNotes: css`
    margin-top: 10px;
    list-style: none;

    li {
      padding: 5px;
    }
  `,
  table: css`
    max-width: 950px;
    margin-top: 30px;
  `,
  typeCell: css`
    font-weight: 500;
    color: var(--secondary-color);
  `
}

export default Comparison

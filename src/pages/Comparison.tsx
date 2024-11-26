import type { FC } from 'react'
import { Meta } from 'frontend-essentials'
import { css } from '@emotion/css'

import pages from 'pages'
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

const { title, description } = pages.comparison

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
          'Since all assets are static, they can be cached by the browser and load instantaneously.\nOnly the small HTML has to be download'
      },
      {
        value: 'Page transitions are instantaneous',
        description:
          'Since the entire app (shell) is downloaded, page transitions require no additional assets from the CDN since those are immediately served from the browser cache.\nThe data itself does require additional requsts, however these have no effect on how fast the page transitions.\nTransitions will even work when there is no internet connection at all'
      },
      {
        value: 'Can reuse data during navigations',
        description: (
          <p>
            Since rendering pages does not depend on a server response, data from main pages (e.g. "Posts") can be
            passed to sub-pages (e.g. "Post") immediately, allowing the transitioning page to display some of the passed
            shared data (or even all of it), long before the current page's data has been fetched.
            <br />
            An example for this can be found in the{' '}
            <a href="https://client-side-rendering.pages.dev/pokemon" target="_blank">
              Pokémon
            </a>{' '}
            page, where a chosen Pokémon immediately shows up with its name and index once selected.
          </p>
        )
      },
      {
        value: 'Unmatched performance with SWR',
        description: (
          <p>
            When using{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#the-swr-approach" target="_blank">
              SWR
            </a>{' '}
            for the app shell, the app always loads instantly
          </p>
        )
      },
      {
        value: 'Is completely free to host',
        description:
          'Some CDN vendors (such as Cloudflare Pages) host static apps without requiring any kind of fee and with no limits at all (unless the app has a very heavy traffic)'
      },
      {
        value: 'Uses minimal data',
        description: (
          <p>
            When loading the app with a fully valid cache, only the document is being fetched from the CDN (and most
            often it will receive a <em>304 Not Modified</em> status code), so practically no additional data will be
            used in order to show the app (shell)
          </p>
        )
      },
      {
        value: 'Is very simple to develop',
        description:
          'Requires no separation between code that runs on the server to code that runs on the client.\nHas no compatibility issues with third-party packages nor the need to tweak those in order for them to work properly'
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
        value: 'Loading is delayed upon cache invalidation',
        description: (
          <p>
            When some of the cache invalidates (as new assets are available), it will need to be redownloaded.
            <br />
            This slightly extends the time it takes for the app to become visible.
            <br />
            Refer to the{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#accelerating-unchanged-pages" target="_blank">
              Accelerating Unchanged Pages
            </a>{' '}
            section to see how this can be mitigated.
          </p>
        )
      },
      {
        value: 'Delayed data fetching',
        description: (
          <p>
            The data is being fetched only when the app is rendered (after JS execution).
            <br />
            This can be overcome by{' '}
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
            The HTML document contains no data, so SEO is heavily dependant on the ability of web crawlers to render JS
            (currently only <em>Googlebot</em> can do that).
            <br />
            Thus, a{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#prerendering" target="_blank">
              prerendering server
            </a>{' '}
            has to be set up to serve web crawlers
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
          'Pages initially contain all of their data, so all bots and web crawlers will be able to properly crawl and index them'
      },
      {
        value: 'Potentially fast initial load',
        description:
          'Pages have the potential to load quickly (provided their data takes very short time to fetch), since their visibility is independent of JS.\nIn such cases, the FCP will be generally low'
      }
    ],
    cons: [
      {
        value: 'Heavily depends on data to render',
        description:
          'The initial page response time heavily depends on how fast the API server responds with the data.\nThis means that page visibility is strongly coupled with both proximity to the server and query time, as users will see absolutely nothing until the page fully renders on the server and then is sent to them'
      },
      {
        value: 'Slow page transitions',
        description:
          'Page transitions are slow since they are server-dependant. Meaning a page request is sent to the server for each navigation, and the app has to wait for the server-rendered page before performing the navigation'
      },
      {
        value: 'Inaccurate initial viewport renders',
        description: (
          <p>
            Since the server has no way of telling the current viewport of the user's browser, it has to infer it from
            its User Agent string, which can only inform the server if the viewport is{' '}
            <a href="https://edge-user-agent-based-rendering.vercel.app" target="_blank">
              desktop or mobile
            </a>
            .
            <br />
            This will lead to{' '}
            <a href="https://web.dev/cls" target="_blank">
              CLS
            </a>{' '}
            when performing viewport-based rendering which rely on{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia" target="_blank">
              window.matchMedia
            </a>
          </p>
        )
      },
      {
        value: 'Delayed interactivity',
        description: (
          <p>
            Until all JS is downloaded and executed (
            <em>
              <a href="https://www.builder.io/blog/hydration-is-pure-overhead" target="_blank">
                hydration
              </a>
            </em>
            ), the page remians noninteractive (meaning it will not react to any user events that involve JS).
            <br />
            Moreover, since images are included in the HTML document, they will compete with uncached scripts for
            bandwith, delaying interactivity even further
          </p>
        )
      },
      {
        value: 'Mostly cannot prefetch pages',
        description:
          "Since pages have embedded data, it's impossible to prefetch or cache all pages without applying unnecessary load on the API servers"
      },
      {
        value: 'Cannot reuse data during navigations',
        description:
          'Since rendering pages depends on a server response, data from main pages (e.g. "Posts") cannot be passed to sub-pages (e.g. "Post") as the response contains all the HTML of the transitioning page'
      },
      {
        value: 'Cannot be a real PWA',
        description:
          'As an extension to the previews con, even if we have very few pages, caching them for offline use will make them show potentially stale data, since no fetch occurs in them (it only occurs in the server)'
      },
      {
        value: 'Is more complicated to develop',
        description: (
          <p>
            SSR is so complicated to implement that it requires the usage of a meta-framework (such as Next.js) to be
            accessible to most developers.
            <br />
            Even when using a meta-framework, since the code runs both on the server and on the client, it is crucial to
            verify which object are usable on each platform (see{' '}
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
            users download more data than they should.
            <br />
            Additionally, SSR pages cannot return a <em>304 Not Modified</em> status code, so every page has to be
            downloaded entirely on every single navigation
          </p>
        )
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
            as a poor option for them (in many apps in can be used solely for pages such as <em>About</em> and{' '}
            <em>Login</em>)
          </p>
        )
      },
      {
        value: 'Will potentially show stale data',
        description:
          'Many pre-generated pages have to be updated very frequently or else the data they show will be stale'
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
        value: 'All pages have to be stored in the CDN',
        description:
          'Since all pages are pre-generated (or incrementaly generated), they have to be stored in the CDN, which may lead to extra fees'
      },
      {
        value: 'Same SSR cons as #3, #4, #7, #8 and #9',
        description: '#3: static pages cannot even distinguish between desktop and mobile viewports'
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
            Server components' JS will not be sent to the browser (although it will probably be no more than a few KBs,
            so this is negligible).{' '}
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
        value: 'Critical CSS cannot be inlined',
        description: (
          <p>
            Inlining critical CSS in the document is one of the most important performance optimizations in the SSR
            realm.
            <br />
            However, due to the nature of streaming, it is currently unsupported.{' '}
            <a href="https://github.com/vercel/next.js/discussions/59989" target="_blank">
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
        value: 'All SSR cons except for #1 and #2',
        description: 'Since they are very similar, Streaming SSR has most of SSR cons'
      }
    ]
  }
}

const tableNotes = [
  'Ratings consider visibility + intractability (for visibility only and on "Slow Network", all non-CSR ratings should be at least B)',
  'CSR and SSG are assumed to be deployed on a CDN (such as Cloudflare)',
  'SSR and SSSR are assumed to be deployed on a serverless environment (such as Vercel cloud)',
  'Ratings are relative to what is expected from each network speed and each category (repeated loads are expected to be faster than the initial load. Navigations are expected to be the fastest)',
  'Ratings assume good implementation (low bundle size; route-based code-splitting; prefetching of all scripts and stylesheets)',
  'Ratings assume the usage of React (48kb gzipped)',
  'Ratings exclude data fetching (except for SSR which has embedded data)',
  'SSR ratings heavily depend on server caching, query times and DB server proximity (hence "or lower")',
  "SSG might show stale data while the others won't",
  'A+ rating means near-instant load. S rating means instant load',
  '"Slow Network": 1.6Mbps 150ms. "Fast Network": 10Mbps 40ms'
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
  { type: 'SSSR (RSC)', initialLoad: 'C', repeatedLoads: 'A (full cache), B (partial cache)', navigations: 'A' }
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

        <h2 className={style.tableTitle}>Approximated Speed Comparison</h2>

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

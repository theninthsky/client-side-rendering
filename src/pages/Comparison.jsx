import { Meta } from 'frontend-essentials'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import { DESKTOP_VIEWPORT } from 'styles/constants'
import Title from 'components/common/Title'
import Info from 'components/common/Info'
import Tooltip from 'components/common/Tooltip'
import List from 'components/common/List'

/* Bloat */
import { ApolloClient, InMemoryCache } from '@apollo/client'
import moment from 'moment'
import _ from 'lodash'

// Does nothing, is meant to bloat the page's bundle size to simulate real-life app weight
new ApolloClient({ uri: '', cache: new InMemoryCache() })
_.isDate(moment().toDate())

const { title, description } = pagesManifest.find(({ chunk }) => chunk === 'comparison')

const listData = {
  csr: {
    pros: [
      {
        value: 'Loads independently from its data',
        description:
          'Since the app is completely decoupled from its data, the time it takes for the data to arrive from the server is irrelevant.\nWhen the static assets finish downloading, the browser will immidiately start rendering the app so it is visible to the user (usually showing spinners/skeletons)'
      },
      {
        value: 'Loads quickly once cached',
        description:
          'Since all assets static, they can be cached by the browser and load instantly.\nOnly the HTML request goes out to the server'
      },
      {
        value: 'Page transitions are instantaneous',
        description:
          'Since the entire app (shell) is downloaded, page transitions require no additional requests to the server and are immediately served from the browser cache.\nThe data itself does require additional requsts, however these have no effect on how fast the page will transition.\nTransitions will even work when there is no internet connection at all'
      },
      {
        value: 'Requires no dedicated server',
        description:
          'Since all assets are static, there is no need for a sophisticated server to render the app, and it can be served freely and limitlessly from a CDN'
      },
      {
        value: 'Is not affected by load',
        description:
          'Since static apps can be served entirely from CDNs that have an enormous amount of throughput (such as Cloudflare), the amount of concurrent requests to our app has no effect on how fast each one will be satisfied'
      },
      {
        value: 'Is very simple to develop',
        description:
          'Requires no conceptual separation between code that runs on the server to code that runs on the client.\nHas no compatibility issues with third-party packages nor the need to tweak those in order for them to work properly'
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
            The HTML document will contain no data, so SEO is heavily dependant on the ability of the crawler to render
            JS (currently only <em>Googlebot</em> can do that).
            <br />
            Thus, a{' '}
            <a href="https://github.com/theninthsky/client-side-rendering#prerendering" target="_blank">
              prerendering server
            </a>{' '}
            has to be set up to serve other crawlers (such as <em>Bingbot</em>)
          </p>
        )
      }
    ]
  }
}

const Comparison = () => {
  return (
    <div>
      <Meta title={`${title} | Client-side Rendering`} description={description} />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        <div className={style.section}>
          <Tooltip title="Client-side Rendering" placement="top">
            <h2 className={style.subtitle}>CSR</h2>
          </Tooltip>

          <div className={style.lists}>
            <List name="Pros" items={listData.csr.pros} />
            <List className={style.consList} name="Cons" items={listData.csr.cons} />
          </div>
        </div>
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
    font-size: 26px;
    font-weight: 500;
  `,
  section: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 20px;
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
  `
}

export default Comparison

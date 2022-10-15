import { Meta, usePersistedState, useFetch } from 'frontend-essentials'
import { css, cx } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import { ApolloClient, InMemoryCache } from '@apollo/client'
import moment from 'moment'
import { isDate } from 'lodash'

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'lorem-ipsum')

const LoremIpsum = () => {
  const [loremIpsum, setLoremIpsum] = usePersistedState('loremIpsum')

  useFetch(data.url, {
    credentials: 'include',
    mode: 'no-cors',
    manual: !!loremIpsum,
    onSuccess: ({ data }) => setLoremIpsum(data)
  })

  // Does nothing, is meant to bloat the page's bundle size to simulate real-life app weight
  new ApolloClient({ uri: '', cache: new InMemoryCache() })
  isDate(moment().toDate())

  return (
    <div>
      <Meta
        title={`${title} | Client-side Rendering`}
        description={description}
        image={`${window.location.origin}/icons/og-lorem-ipsum.png`}
      />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {loremIpsum ? (
          loremIpsum.split('\n').map((paragraph, ind) => (
            <p key={ind} className={style.paragraph}>
              {paragraph}
            </p>
          ))
        ) : (
          <MainSkeleton />
        )}
      </main>
    </div>
  )
}

const MainSkeleton = () => {
  return new Array(30)
    .fill()
    .map((_, ind) => (
      <Skeleton
        className={cx(style.skeleton, { [style.paragraph]: ind % 5 === 0 })}
        key={ind}
        variant="text"
        height={20}
        animation={false}
      />
    ))
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  main: css`
    margin-top: 20px;
  `,
  skeleton: css`
    background-color: rgba(0, 0, 0, 0.05);
  `,
  paragraph: css`
    :not(:first-child) {
      margin-top: 20px;
    }
  `
}

export default LoremIpsum

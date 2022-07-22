import { useState, useEffect } from 'react'
import { isDate } from 'moment'
import { persistState, getPersistedState, If, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ name }) => name === 'lorem-ipsum')

const LoremIpsum = () => {
  const [loremIpsum, setLoremIpsum] = useState(getPersistedState('loremIpsum'))

  useFetch(data.url, {
    credentials: 'include',
    mode: 'no-cors',
    manual: !!loremIpsum,
    onSuccess: ({ data }) => setLoremIpsum(data)
  })

  useEffect(() => {
    if (loremIpsum) persistState('loremIpsum', loremIpsum)
  }, [loremIpsum])

  console.log(isDate(new Date()))

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        <If condition={loremIpsum}>
          {loremIpsum?.split('\n').map((paragraph, ind) => (
            <p key={ind} className={style.paragraph}>
              {paragraph}
            </p>
          ))}
        </If>
      </main>
    </div>
  )
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  main: css`
    margin-top: 20px;
  `,
  paragraph: css`
    :not(:first-child) {
      margin-top: 20px;
    }
  `
}

export default LoremIpsum

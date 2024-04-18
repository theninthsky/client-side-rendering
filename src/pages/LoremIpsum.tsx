import type { FC } from 'react'
import { Meta, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

const {
  title,
  description,
  data: [loremIpsumData]
} = pagesManifest.find(({ chunk }) => chunk === 'lorem-ipsum')!

const LoremIpsum: FC<{}> = () => {
  const { data: loremIpsum } = useFetch(loremIpsumData.url, {
    credentials: 'include',
    mode: 'no-cors',
    uuid: 'loremIpsum',
    immutable: true
  })

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
        {loremIpsum &&
          loremIpsum.split('\n').map((paragraph, ind) => (
            <p key={ind} className={style.paragraph}>
              {paragraph}
            </p>
          ))}
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

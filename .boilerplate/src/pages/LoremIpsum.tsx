import { useState, useEffect, FC } from 'react'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest'
import Title from 'components/common/Title'

const {
  title,
  data: [data]
} = pagesManifest.find(({ chunk }) => chunk === 'lorem-ipsum')!

const LoremIpsum: FC<{}> = () => {
  const [loremIpsum, setLoremIpsum] = useState<string>()

  useEffect(() => {
    const fetchLoremIpsum = async () => {
      const res = await fetch(data.url as string)
      const json = await res.json()

      setLoremIpsum(json)
    }

    fetchLoremIpsum()
  }, [])

  return (
    <div>
      <Title>{title}</Title>

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

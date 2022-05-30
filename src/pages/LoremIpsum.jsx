import { isDate } from 'moment'
import { useFetch } from 'frontend-essentials'
import { css, cx } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ name }) => name === 'lorem-ipsum')

const LoremIpsum = () => {
  const { loading: fetchingLoremIpsum, data: loremIpsum } = useFetch(data.url, {
    credentials: 'include',
    mode: 'no-cors'
  })

  console.log(isDate(new Date()))

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {fetchingLoremIpsum ? (
          <MainSkeleton />
        ) : (
          loremIpsum?.split('\n').map((paragraph, ind) => (
            <p key={ind} className={style.paragraph}>
              {paragraph}
            </p>
          ))
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

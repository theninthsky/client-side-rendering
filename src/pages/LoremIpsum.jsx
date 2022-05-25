import { useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ name }) => name === 'lorem-ipsum')

const LoremIpsum = () => {
  const { data: loremIpsum } = useFetch(data.url, { credentials: 'include', mode: 'no-cors' })

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      {loremIpsum?.split('\n').map((paragraph, ind) => (
        <p key={ind} className={style.paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  )
}
const style = {
  info: css`
    margin-top: 20px;
  `,
  paragraph: css`
    margin-top: 20px;
  `
}

export default LoremIpsum

import { useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import routeManifest from 'route-chunk-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, data } = routeManifest.find(({ name }) => name === 'lorem-ipsum')

const LoremIpsum = () => {
  const { data: loremIpsum } = useFetch(data.url, { credentials: 'include', mode: 'no-cors' })

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>
        This page demostrates a large amount of static text that is pre-generated and fetched in parallel to other
        assets.
      </Info>

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

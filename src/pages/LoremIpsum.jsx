import { useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import routeManifest from 'route-chunk-manifest.json'
import Title from 'components/common/Title'

const { title, data } = routeManifest.find(({ name }) => name === 'lorem-ipsum')

const LoremIpsum = () => {
  const { data: loremIpsum } = useFetch(data.url, { credentials: 'include', mode: 'no-cors' })

  return (
    <div>
      <Title>{title}</Title>

      {loremIpsum?.split('\n').map((paragraph, ind) => (
        <p
          key={ind}
          className={css`
            margin-top: 20px;
          `}
        >
          {paragraph}
        </p>
      ))}
    </div>
  )
}

export default LoremIpsum

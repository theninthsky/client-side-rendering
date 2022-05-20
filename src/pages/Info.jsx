import { If, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import Title from 'components/common/Title'

const Info = () => {
  const { data } = useFetch('json/info.json', { credentials: 'include', mode: 'no-cors' })

  return (
    <div>
      <Title>Info</Title>

      <If condition={data}>
        {data?.map((paragraph, ind) => (
          <p
            key={ind}
            className={css`
              margin-top: 20px;
            `}
          >
            {paragraph}
          </p>
        ))}
      </If>
    </div>
  )
}

export default Info

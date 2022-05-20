import { If } from 'frontend-essentials'
import { css } from '@emotion/css'

import useFetch from 'hooks/useFetch'
import Title from 'components/common/Title'

const Quotes = () => {
  const { data } = useFetch('json/quotes.json', { credentials: 'include', mode: 'no-cors' })

  return (
    <div>
      <Title>Quotes</Title>

      <If condition={data}>
        {data?.map(({ q, a }) => (
          <blockquote className={style.block}>
            <p className={style.quote}>"{q}"</p>

            <span className={style.author}>~ {a}</span>
          </blockquote>
        ))}
      </If>
    </div>
  )
}

const style = {
  block: css`
    margin-top: 25px;
  `,
  quote: css`
    font-size: 18px;
  `,
  author: css`
    display: block;
    margin-top: 4px;
    font-size: 14px;
  `
}

export default Quotes

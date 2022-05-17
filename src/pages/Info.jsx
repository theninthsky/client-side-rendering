import { useAxios } from 'frontend-essentials'
import { css } from '@emotion/css'

const Info = () => {
  const { data } = useAxios({ method: 'get', baseURL: '', url: 'json/lorem-ipsum.json' })

  if (!data) return null

  return (
    <div>
      {data.map((paragraph, ind) => (
        <p
          key={ind}
          className={css`
            margin-top: 14px;
          `}
        >
          {paragraph}
        </p>
      ))}
    </div>
  )
}

export default Info

import { isDate } from 'moment'
import { useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ name }) => name === 'pokemon')

const Pokemon = () => {
  const { data: { pokemon: type1 = [] } = {} } = useFetch(data[0].url)
  const { data: { pokemon: type2 = [] } = {} } = useFetch(data[1].url)
  const { data: { pokemon: type3 = [] } = {} } = useFetch(data[2].url)

  const pokemon = [...type1, ...type2, ...type3]

  console.log(isDate(new Date()))

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {type1.length && type2.length && type3.length ? (
          pokemon.map(({ pokemon }, ind) => (
            <span className={style.pokemon} key={ind}>
              {pokemon.name}
            </span>
          ))
        ) : (
          <MainSkeleton />
        )}
      </main>
    </div>
  )
}

const MainSkeleton = () => {
  return new Array(30)
    .fill()
    .map((_, ind) => (
      <Skeleton className={style.skeleton} key={ind} variant="text" width={75} height={20} animation={false} />
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
    margin-top: 5px;
    background-color: rgba(0, 0, 0, 0.05);
  `,
  pokemon: css`
    display: block;

    :not(:first-child) {
      margin-top: 10px;
    }
  `
}

export default Pokemon

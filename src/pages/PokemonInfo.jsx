import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { persistState, getPersistedState, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon-info')

const PokemonInfo = () => {
  const { name } = useParams()

  const [pokemonInfo, setPokemonInfo] = useState(getPersistedState(`${name}Info`))

  useFetch(data.url.replace('$', name), {
    onSuccess: ({ data: { data } }) => setPokemonInfo(data.pokemon)
  })

  useEffect(() => {
    if (pokemonInfo) persistState(`${name}Info`, pokemonInfo)
  }, [pokemonInfo])

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {pokemonInfo ? (
          <div>
            {pokemonInfo.id} - {pokemonInfo.name}
          </div>
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
      <Skeleton className={style.skeleton} key={ind} variant="text" width={60} height={20} animation={false} />
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
  `
}

export default PokemonInfo

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
  const { name: nameParam } = useParams()

  const [pokemonInfo, setPokemonInfo] = useState(getPersistedState(`${nameParam}Info`) || {})

  const { id, name, types } = pokemonInfo

  useFetch(data.url.replace('$', nameParam), {
    onSuccess: ({ data: { data } }) => setPokemonInfo(data.pokemon)
  })

  useEffect(() => {
    if (pokemonInfo) persistState(`${nameParam}Info`, pokemonInfo)
  }, [pokemonInfo])

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {id ? (
          <div>
            {id} - {name} - {types.map(({ type: { name } }) => name).join(', ')}
          </div>
        ) : (
          <Skeleton className={style.skeleton} variant="text" width={100} height={20} animation={false} />
        )}
      </main>
    </div>
  )
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

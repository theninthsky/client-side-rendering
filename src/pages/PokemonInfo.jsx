import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { persistState, getPersistedState, useFetch } from 'frontend-essentials'
import startCase from 'lodash/startCase'
import toLower from 'lodash/toLower'
import { css } from '@emotion/css'
import { capitalize, Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import { setMetaTags } from 'utils/meta-tags'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon-info')

const PokemonInfo = () => {
  const { name: nameParam } = useParams()

  const [pokemonInfo, setPokemonInfo] = useState(getPersistedState(`${nameParam}Info`) || {})

  const { id, name, sprites } = pokemonInfo

  useFetch(data.url.replace('$', nameParam), {
    camelCasedKeys: true,
    onSuccess: ({ data }) => setPokemonInfo(data)
  })

  useEffect(() => {
    if (!id) return

    persistState(`${nameParam}Info`, pokemonInfo)
    setMetaTags({ title: `${capitalize(name)} | Pokémon Info`, image: sprites.other.officialArtwork.frontDefault })
  }, [id])

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {id ? (
          <div>
            <p>
              {id}. <strong>{startCase(toLower(name))}</strong>
            </p>

            <img className={style.image} src={sprites.other.officialArtwork.frontDefault} />
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
    font-size: 20px;
  `,
  image: css`
    max-width: 100%;
    margin-top: 10px;
  `,
  skeleton: css`
    margin-top: 5px;
    background-color: rgba(0, 0, 0, 0.05);
  `
}

export default PokemonInfo

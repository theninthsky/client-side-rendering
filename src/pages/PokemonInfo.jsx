import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { If, Meta, useFetch, persistState, getPersistedState } from 'frontend-essentials'
import startCase from 'lodash/startCase'
import toLower from 'lodash/toLower'
import { css, cx } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import { preconnect } from 'utils/preconnect'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon-info')

const PokemonInfo = () => {
  const { name: nameParam } = useParams()

  const [pokemonInfo, setPokemonInfo] = useState(getPersistedState(`${nameParam}Info`) || {})
  const [imageLoading, setImageLoading] = useState(true)

  const { id, name, sprites } = pokemonInfo

  useFetch(data.url.replace('$', nameParam), {
    camelCasedResponse: true,
    onSuccess: ({ data }) => setPokemonInfo(data)
  })

  useEffect(() => {
    preconnect(data.preconnectURL)
  }, [])

  useEffect(() => {
    if (name) persistState(`${nameParam}Info`, pokemonInfo)
  }, [name])

  return (
    <div>
      <Meta
        title={`${startCase(toLower(name || 'loading'))} | Pokémon Info`}
        image={sprites?.other.officialArtwork.frontDefault}
      />

      <Title backButton>Pokémon Info</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {id ? (
          <>
            <p>
              {id}. <strong>{startCase(toLower(name))}</strong>
            </p>

            <img
              className={cx(style.image, { hidden: imageLoading })}
              src={sprites.other.officialArtwork.frontDefault}
              onLoad={() => setImageLoading(false)}
            />
          </>
        ) : (
          <Skeleton className={style.skeleton} variant="text" width={100} height={24} animation={false} />
        )}

        <If condition={imageLoading}>
          <Skeleton className={cx(style.skeleton, style.image)} variant="rectangular" width={475} height={475} />
        </If>
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

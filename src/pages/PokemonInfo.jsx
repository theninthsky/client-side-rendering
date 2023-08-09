import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Meta, useFetch } from 'frontend-essentials'
import startCase from 'lodash/startCase'
import toLower from 'lodash/toLower'
import { css, cx } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

const { description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon-info')

const PokemonInfo = () => {
  const { name: nameParam } = useParams()
  const { state: selectedPokemon } = useLocation()

  const [imageLoading, setImageLoading] = useState(true)

  const { data: pokemonInfo } = useFetch(data.url.replace('$', nameParam), {
    manual: selectedPokemon?.id,
    camelCased: true
  })

  const { id, name, img, sprites } = pokemonInfo || selectedPokemon || {}
  const image = img || sprites?.other.officialArtwork.frontDefault

  return (
    <div>
      <Meta title={`${startCase(toLower(name || 'loading'))} | Pokémon Info`} image={image} />

      <Title back>Pokémon Info</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {id ? (
          <>
            <p>
              {id}. <strong>{startCase(toLower(name))}</strong>
            </p>

            <img
              className={cx(style.image, { hidden: imageLoading })}
              src={image}
              onLoad={() => setImageLoading(false)}
            />
          </>
        ) : (
          <Skeleton className={style.skeleton} variant="text" width={100} height={24} animation={false} />
        )}

        {imageLoading && (
          <Skeleton className={cx(style.skeleton, style.image)} variant="rectangular" width={475} height={475} />
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

import { FC } from 'react'
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

const { description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon-info')!

const PokemonInfo: FC<{}> = () => {
  const { name: nameParam } = useParams()
  const { state: selectedPokemon } = useLocation()

  const { data: pokemonInfo } = useFetch(data[0].url.replace('$', nameParam!), {
    // manual: selectedPokemon?.id,
    camelCased: true
  })

  const { data: pokemonSpecies } = useFetch(data[1].url.replace('$', nameParam!), {
    camelCased: true
  })

  const { id, name, img, sprites, types } = pokemonInfo || selectedPokemon || {}

  const image = img || sprites?.other.officialArtwork.frontDefault
  const flavorText = pokemonSpecies?.flavorTextEntries
    .find(({ language }) => language.name === 'en')
    ?.flavorText.replace('\f', ' ')

  return (
    <div>
      <Meta title={`${startCase(toLower(name || 'loading'))} | Pokémon Info`} image={image} />

      <Title back>Pokémon Info</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {id ? (
          <>
            <div className={style.head}>
              <p>
                {id}. <strong>{startCase(toLower(name))}</strong>
              </p>

              <div className="items-center">
                {types?.map(({ type: { name } }) => (
                  <img
                    key={name}
                    className={style.type}
                    title={startCase(name)}
                    src={`https://raw.githubusercontent.com/msikma/pokeresources/master/resources/types/gen8/${name}.svg`}
                    alt={startCase(name)}
                  />
                ))}
              </div>
            </div>

            <img className={style.image} src={image} />
          </>
        ) : (
          <>
            <Skeleton className={style.skeleton} variant="text" width={100} height={30} animation={false} />

            <Skeleton className={cx(style.skeleton, style.image)} variant="rectangular" width={475} height={475} />
          </>
        )}

        {flavorText ? (
          <div>{flavorText}</div>
        ) : (
          <Skeleton className={style.skeleton} variant="text" width={1000} height={30} animation={false} />
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
  head: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    width: 475px;
    height: 30px;
  `,
  type: css`
    width: 30px;
    margin-left: 5px;
  `,
  image: css`
    max-width: 100%;
    height: minmax(475px, 100vw);
    margin: 10px 0;
  `,
  skeleton: css`
    margin-top: 5px;
    background-color: rgba(0, 0, 0, 0.05);
  `
}

export default PokemonInfo

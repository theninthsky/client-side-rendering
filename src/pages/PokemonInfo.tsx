import { useMemo, FC } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Meta, useFetch } from 'frontend-essentials'
import { css, cx } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pages from 'pages'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

const {
  description,
  data: [pokemonInfoData, pokemonSpeciesData]
} = pages['pokemon-info']

type Pokemon = {
  id: number
  name: string
  types: string[]
  artwork: string
}

const formatPokemonInfo = ({ id, name, types, sprites }): Pokemon => ({
  id,
  name,
  types: types.map(({ type }) => type.name),
  artwork: sprites.other.officialArtwork.frontDefault
})

const getFlavorText = ({ flavorTextEntries }): string => {
  return flavorTextEntries.find(({ language }) => language.name === 'en')?.flavorText.replace('\f', ' ')
}

const PokemonInfo: FC<{}> = () => {
  const { name: nameParam } = useParams()
  const { state: selectedPokemon } = useLocation()

  const { data: rawPokemonInfo } = useFetch(pokemonInfoData.url({ name: nameParam }), {
    manual: selectedPokemon,
    camelCased: true
  })

  const { data: pokemonSpecies } = useFetch(pokemonSpeciesData.url({ name: nameParam }), {
    camelCased: true
  })

  const pokemon = useMemo(() => (rawPokemonInfo ? formatPokemonInfo(rawPokemonInfo) : undefined), [rawPokemonInfo])

  const flavorText = useMemo(() => (pokemonSpecies ? getFlavorText(pokemonSpecies) : undefined), [pokemonSpecies])

  const { id, name, types, artwork } = pokemon || (selectedPokemon as Pokemon) || {}

  return (
    <div>
      <Meta
        title={`${_.startCase(_.toLower(name || 'loading'))} | Pokémon Info`}
        image={artwork}
        description={flavorText}
      />

      <Title back>Pokémon Info</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {id ? (
          <>
            <div className={style.head}>
              <p>
                {id}. <strong>{_.startCase(_.toLower(name))}</strong>
              </p>

              <div className="items-center">
                {types.map(type => (
                  <img
                    key={type}
                    className={style.type}
                    title={_.startCase(type)}
                    src={`https://raw.githubusercontent.com/msikma/pokeresources/master/resources/type-icons/gen8/${type}.svg`}
                    alt={_.startCase(type)}
                  />
                ))}
              </div>
            </div>

            <img className={style.image} src={artwork} />
          </>
        ) : (
          <>
            <Skeleton className={style.skeleton} variant="text" width={100} height={40} animation={false} />

            <Skeleton
              className={cx(style.skeleton, style.image)}
              variant="rectangular"
              width={475}
              height={475}
              animation={false}
            />
          </>
        )}

        <div className={style.flavorText}>
          {flavorText || (
            <Skeleton className={style.skeleton} variant="text" width={475} height={40} animation={false} />
          )}
        </div>
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
    width: 34px;
  `,
  image: css`
    max-width: 100%;
    max-height: calc(100vw - 40px);
    height: 475px;
    margin: 10px 0;
    border-radius: 4px;
  `,
  flavorText: css`
    max-width: 475px;
    text-align: center;
  `,
  skeleton: css`
    max-width: 80vw;
    opacity: 0.1;
    background-color: var(--text-color);
  `
}

export default PokemonInfo

import { useLayoutEffect, FC } from 'react'
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

const PokemonInfo: FC<{}> = () => {
  const { name: nameParam } = useParams()
  const { state: selectedPokemon } = useLocation()

  const { data: pokemonInfo, activate: fetchPokemonInfo } = useFetch('', { manual: true, camelCased: true })

  const { data: pokemonSpecies, activate: fetchPokemonSpecies } = useFetch('', { manual: true, camelCased: true })

  useLayoutEffect(() => {
    fetchPokemonInfo({ url: pokemonInfoData.url({ name: nameParam }) })
    fetchPokemonSpecies({ url: pokemonSpeciesData.url({ name: nameParam }) })
  }, [nameParam])

  const { id, name, img, sprites, types } = pokemonInfo || selectedPokemon || {}

  const image = img || sprites?.other.officialArtwork.frontDefault
  const flavorText = pokemonSpecies?.flavorTextEntries
    .find(({ language }) => language.name === 'en')
    ?.flavorText.replace('\f', ' ')

  return (
    <div>
      <Meta
        title={`${_.startCase(_.toLower(name || 'loading'))} | Pokémon Info`}
        image={image}
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
                {types?.map(({ type: { name } }) => (
                  <img
                    key={name}
                    className={style.type}
                    title={_.startCase(name)}
                    src={`https://raw.githubusercontent.com/msikma/pokeresources/master/resources/type-icons/gen8/${name}.svg`}
                    alt={_.startCase(name)}
                  />
                ))}
              </div>
            </div>

            <img className={style.image} src={image} />
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

import { useEffect, FC } from 'react'
import { NavLink } from 'react-router-dom'
import { Meta, LazyRender, useFetch } from 'frontend-essentials'
import startCase from 'lodash/startCase'
import toLower from 'lodash/toLower'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import preconnect from 'utils/preconnect'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon') as any
const { data: pokemonInfoData } = pagesManifest.find(({ chunk }) => chunk === 'pokemon-info') as any

const Pokemon: FC<{}> = () => {
  const { data: pokemon } = useFetch(data[0].url, {
    uuid: 'pokemon',
    immutable: true
  })

  useEffect(() => {
    preconnect(pokemonInfoData.preconnectURL)
  }, [])

  return (
    <div>
      <Meta
        title={`${title} | Client-side Rendering`}
        description={description}
        image={`${window.location.origin}/icons/og-pokemon.png`}
      />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {pokemon ? (
          <LazyRender uuid="pokemon" items={pokemon.results} batch={window['prerender'] ? Infinity : 50}>
            {({ name, url }) => {
              const id = url.split('/')[6]
              const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

              return (
                <NavLink key={name} className={style.pokemon} to={`/pokemon/${name}`} state={{ id, name, img }}>
                  <img className={style.pokemonImage} src={img} loading="lazy" />

                  <span>{startCase(toLower(name))}</span>
                </NavLink>
              )
            }}
          </LazyRender>
        ) : (
          <MainSkeleton />
        )}
      </main>
    </div>
  )
}

const MainSkeleton = () => {
  return new Array(100)
    .fill(undefined)
    .map((_, ind) => (
      <Skeleton className={style.skeleton} key={ind} variant="rectangular" width={200} height={222} animation={false} />
    ))
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  main: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 20px;
    font-size: 18px;
  `,
  skeleton: css`
    margin: 25px;
    background-color: rgba(0, 0, 0, 0.05);
  `,
  pokemon: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 25px;
    text-decoration: none;
    color: inherit;
  `,
  pokemonImage: css`
    width: 200px;
    height: 200px;
  `
}

export default Pokemon

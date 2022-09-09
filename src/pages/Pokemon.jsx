import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { isDate } from 'moment'
import { Meta, useFetch, persistState, getPersistedState } from 'frontend-essentials'
import startCase from 'lodash/startCase'
import toLower from 'lodash/toLower'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import { DESKTOP_VIEWPORT } from 'styles/constants'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon')

const Pokemon = () => {
  const [pokemon, setPokemon] = useState(getPersistedState('pokemon') || [])

  useFetch(data[0].url, {
    onSuccess: ({ data: { results } }) => setPokemon(results.map(({ name }) => name))
  })

  useEffect(() => {
    if (pokemon) persistState('pokemon', pokemon)
  }, [pokemon])

  console.log(isDate(new Date()))

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
        {pokemon.length ? (
          <ul className={style.list}>
            {pokemon.map(name => (
              <li key={name}>
                <NavLink className={style.pokemon} to={`/pokemon/${name}`}>
                  {startCase(toLower(name))}
                </NavLink>
              </li>
            ))}
          </ul>
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
    font-size: 18px;
  `,
  list: css`
    display: grid;
    grid-template-columns: 1fr;
    column-gap: 7.5px;
    list-style: none;

    @media ${DESKTOP_VIEWPORT} {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  `,
  skeleton: css`
    margin-top: 5px;
    background-color: rgba(0, 0, 0, 0.05);
  `,
  pokemon: css`
    display: inline-block;
    margin-top: 10px;
    text-decoration: none;
    color: inherit;
  `
}

export default Pokemon

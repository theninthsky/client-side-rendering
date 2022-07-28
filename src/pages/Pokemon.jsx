import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { isDate } from 'moment'
import { persistState, getPersistedState, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon')

const Pokemon = () => {
  const [pokemon, setPokemon] = useState(getPersistedState('pokemon') || [])

  useFetch(data[0].url, {
    onSuccess: ({ data: { data } }) => setPokemon(data.pokemons.results.sort((a, b) => a.name.localeCompare(b.name)))
  })

  useEffect(() => {
    if (pokemon) persistState('pokemon', pokemon)
  }, [pokemon])

  console.log(isDate(new Date()))

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <main className={style.main}>
        {pokemon.length ? (
          <ul className={style.list}>
            {pokemon.map(({ name }, ind) => (
              <NavLink className={style.pokemon} key={ind} to={`/pokemon/${name}`}>
                {name}
              </NavLink>
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
  `,
  list: css`
    list-style: none;
  `,
  skeleton: css`
    margin-top: 5px;
    background-color: rgba(0, 0, 0, 0.05);
  `,
  pokemon: css`
    display: block;
    text-decoration: none;
    color: inherit;

    :not(:first-child) {
      margin-top: 10px;
    }
  `
}

export default Pokemon

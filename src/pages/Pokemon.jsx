import { NavLink } from 'react-router-dom'
import { Meta, useFetch } from 'frontend-essentials'
import startCase from 'lodash/startCase'
import toLower from 'lodash/toLower'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pagesManifest from 'pages-manifest.json'
import { DESKTOP_VIEWPORT } from 'styles/constants'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import { ApolloClient, InMemoryCache } from '@apollo/client'
import moment from 'moment'
import { isDate } from 'lodash'

// Does nothing, is meant to bloat the page's bundle size to simulate real-life app weight
new ApolloClient({ uri: '', cache: new InMemoryCache() })
isDate(moment().toDate())

const { title, description, data } = pagesManifest.find(({ chunk }) => chunk === 'pokemon')

const Pokemon = () => {
  const { data: pokemon } = useFetch(data[0].url, {
    uuid: 'pokemon',
    immutable: true
  })

  // Does nothing, is meant to bloat the page's bundle size to simulate real-life app weight
  new ApolloClient({ uri: '', cache: new InMemoryCache() })
  isDate(moment().toDate())

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
        <ul className={style.list}>
          {pokemon ? (
            pokemon.results.map(({ name }) => (
              <li key={name}>
                <NavLink className={style.pokemon} to={`/pokemon/${name}`}>
                  {startCase(toLower(name))}
                </NavLink>
              </li>
            ))
          ) : (
            <MainSkeleton />
          )}
        </ul>
      </main>
    </div>
  )
}

const MainSkeleton = () => {
  return new Array(100)
    .fill()
    .map((_, ind) => (
      <Skeleton className={style.skeleton} key={ind} variant="text" width={80} height={32} animation={false} />
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
    row-gap: 10px;
    list-style: none;

    @media ${DESKTOP_VIEWPORT} {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  `,
  skeleton: css`
    background-color: rgba(0, 0, 0, 0.05);
  `,
  pokemon: css`
    display: inline-block;
    text-decoration: none;
    color: inherit;
  `
}

export default Pokemon

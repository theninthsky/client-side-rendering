import { FC } from 'react'
import { Meta, LazyRender, useFetch } from 'frontend-essentials'
import toLower from 'lodash/toLower'
import { css } from '@emotion/css'
import { Skeleton } from '@mui/material'

import pages from 'pages'
import preconnect from 'utils/preconnect'
import Title from 'components/common/Title'
import Info from 'components/common/Info'
import Link from 'components/common/Link'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

const {
  title,
  description,
  data: [pokemonData],
  preconnect: [imagesHost]
} = pages.pokemon

const disableLazyRender = /prerender|googlebot/i.test(navigator.userAgent)

preconnect(imagesHost)

const Pokemon: FC<{}> = () => {
  const { data: { data: { pokemons } = {} } = {} } = useFetch(pokemonData.url, {
    uuid: 'pokemon',
    immutable: true,
    ...pokemonData
  })

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
        {pokemons ? (
          <LazyRender uuid="pokemon" items={pokemons.results} batch={disableLazyRender ? Infinity : 50}>
            {({ id, name, artwork }) => (
              <Link key={name} className={style.pokemon} to={`/pokemon/${name}`} state={{ id, name, img: artwork }}>
                <img className={style.pokemonImage} src={artwork} alt={name} loading="lazy" />

                <span>{_.startCase(toLower(name))}</span>
              </Link>
            )}
          </LazyRender>
        ) : (
          <MainSkeleton />
        )}
      </main>
    </div>
  )
}

const MainSkeleton = () => {
  return new Array(50)
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
    border-radius: 4px;
    opacity: 0.1;
    background-color: var(--text-color);
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

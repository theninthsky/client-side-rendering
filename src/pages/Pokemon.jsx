import { If, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import Title from 'components/common/Title'

const Pokemon = () => {
  const { data: { pokemon } = {} } = useFetch('https://pokeapi.co/api/v2/type/3')

  return (
    <div>
      <Title>Pokémon</Title>

      <If condition={pokemon}>
        {pokemon?.map(({ pokemon }) => (
          <span className={style.pokemon}>{pokemon.name}</span>
        ))}
      </If>
    </div>
  )
}

const style = {
  pokemon: css`
    display: block;
    margin-top: 10px;
  `
}

export default Pokemon

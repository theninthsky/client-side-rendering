import { If, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import Title from 'components/common/Title'

const Pokemon = () => {
  const { data: { pokemon: type1 = [] } = {} } = useFetch('https://pokeapi.co/api/v2/type/1')
  const { data: { pokemon: type2 = [] } = {} } = useFetch('https://pokeapi.co/api/v2/type/2')
  const { data: { pokemon: type3 = [] } = {} } = useFetch('https://pokeapi.co/api/v2/type/3')

  const pokemon = [...type1, ...type2, ...type3]

  return (
    <div>
      <Title>Pokémon</Title>

      <If condition={pokemon}>
        {pokemon?.map(({ pokemon }, ind) => (
          <span className={style.pokemon} key={ind}>
            {pokemon.name}
          </span>
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

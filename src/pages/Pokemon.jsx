import { If, useFetch } from 'frontend-essentials'
import { css } from '@emotion/css'

import pagesManifest from 'pages-manifest.json'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

const { title, description, data } = pagesManifest.find(({ name }) => name === 'pokemon')

const Pokemon = () => {
  const { data: { pokemon: type1 = [] } = {} } = useFetch(data[0].url)
  const { data: { pokemon: type2 = [] } = {} } = useFetch(data[1].url)
  const { data: { pokemon: type3 = [] } = {} } = useFetch(data[2].url)

  const pokemon = [...type1, ...type2, ...type3]

  return (
    <div>
      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

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
  info: css`
    margin-top: 20px;
  `,
  pokemon: css`
    display: block;
    margin-top: 10px;

    :first-of-type {
      margin-top: 20px;
    }
  `
}

export default Pokemon

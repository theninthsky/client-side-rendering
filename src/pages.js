export default {
  home: {
    path: '/',
    title: 'Home',
    description: 'Demonstrated here is a simple page which all of its assets are fetched in parallel.'
  },
  'lorem-ipsum': {
    path: '/lorem-ipsum',
    title: 'Lorem Ipsum',
    description:
      "Demonstrated here is a large amount of static data that is pre-generated and fetched in parallel with all of the page's assets.",
    data: [
      {
        url: '/generated/lorem-ipsum.json',
        menuPreload: true
      }
    ]
  },
  pokemon: {
    path: '/pokemon',
    title: 'Pokémon',
    description:
      "Demonstrated here is dynamic data that is fetched in parallel with all of the page's assets and passed directly to its sub-pages.",
    data: [
      {
        url: 'https://beta.pokeapi.co/graphql/v1beta',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query getAllPokemons {
              pokemons: pokemon_v2_pokemonspecies(order_by: {id: asc}) {
                name
                id
                extra: pokemon_v2_pokemons {
                  types: pokemon_v2_pokemontypes {
                    type: pokemon_v2_type {
                      name
                    }
                  }
                  sprites: pokemon_v2_pokemonsprites {
                    officialArtwrok: sprites(path: "other.official-artwork.front_default")
                  }
                }
              }
            }
          `
        })
      }
    ],
    preconnect: ['https://raw.githubusercontent.com']
  },
  'pokemon-info': {
    path: '/pokemon/:name',
    description: "Demonstrated here is dynamic path data that is fetched in parallel with all of the page's assets.",
    data: [
      {
        url: ({ name }) => `https://pokeapi.co/api/v2/pokemon/${name}`
      },
      {
        url: ({ name }) => `https://pokeapi.co/api/v2/pokemon-species/${name}`
      }
    ],
    preconnect: ['https://raw.githubusercontent.com'],
    menuItem: false
  },
  comparison: {
    path: '/comparison',
    title: 'Comparison',
    description:
      'This page compares all rendering methods, listing their pros and cons.\nYou can click on each point to view a detailed explanation.'
  },
  'core-web-vitals': {
    path: '/web-vitals',
    title: 'Web Vitals',
    description: 'This page specifies the values of core web vitals.'
  }
}

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
        url: '/json/lorem-ipsum.json',
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
        method: 'post',
        url: 'https://graphql-pokeapi.graphcdn.app',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query pokemons($limit: Int, $offset: Int) {
            pokemons(limit: $limit, offset: $offset) {
              results {
                id
                url
                name
                artwork
              }
            }
          }`,
          variables: { limit: 2000, offset: 0 }
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

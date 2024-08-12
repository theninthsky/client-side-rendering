export default [
  {
    path: '/',
    title: 'Home',
    description: 'Demonstrated here is a simple page which all of its assets are fetched in parallel.'
  },
  {
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
  {
    path: '/pokemon',
    title: 'Pokémon',
    description:
      "Demonstrated here is dynamic data that is fetched in parallel with all of the page's assets and passed directly to its sub-pages.",
    data: [
      {
        url: 'https://pokeapi.co/api/v2/pokemon?limit=10000',
        crossorigin: 'anonymous',
        menuPreload: true
      }
    ]
  },
  {
    path: '/pokemon/:name',
    description: "Demonstrated here is dynamic path data that is fetched in parallel with all of the page's assets.",
    data: [
      {
        url: ({ name }) => `https://pokeapi.co/api/v2/pokemon/${name}`,
        crossorigin: 'anonymous',
        preconnectURL: 'https://raw.githubusercontent.com'
      },
      {
        url: ({ name }) => `https://pokeapi.co/api/v2/pokemon-species/${name}`,
        crossorigin: 'anonymous'
      }
    ],
    menuItem: false
  },
  {
    path: '/comparison',
    title: 'Comparison',
    description:
      'This page compares all rendering methods, listing their pros and cons.\nYou can click on each point to view a detailed explanation.'
  },
  {
    path: '/web-vitals',
    title: 'Web Vitals',
    description: 'This page specifies the values of core web vitals.'
  }
]

export default [
  {
    chunk: 'home',
    path: '/',
    title: 'Home',
    description: 'This page demonstrates a large amount of components that are rendered on the screen.'
  },
  {
    chunk: 'lorem-ipsum',
    path: '/lorem-ipsum',
    title: 'Lorem Ipsum',
    description:
      'This page demonstrates a large amount of static text that is pre-generated and fetched in parallel with other assets.',
    data: [
      {
        url: '/json/lorem-ipsum.json',
        menuPreload: true
      }
    ]
  },
  {
    chunk: 'pokemon',
    path: '/pokemon',
    title: 'Pokémon',
    description: 'This page demonstrates dynamic data that is fetched in parallel with other assets.',
    data: [
      {
        url: 'https://pokeapi.co/api/v2/pokemon?limit=10000',
        crossorigin: 'anonymous',
        menuPreload: true
      }
    ]
  },
  {
    chunk: 'pokemon-info',
    path: '/pokemon/:name',
    description: 'This page demonstrates a dynamic path data that is fetched in parallel with other assets.',
    data: [
      {
        url: 'https://pokeapi.co/api/v2/pokemon/$',
        dynamicPathIndexes: [2],
        crossorigin: 'anonymous',
        preconnectURL: 'https://raw.githubusercontent.com'
      },
      {
        url: 'https://pokeapi.co/api/v2/pokemon-species/$',
        dynamicPathIndexes: [2],
        crossorigin: 'anonymous'
      }
    ],
    menuItem: false
  },
  {
    chunk: 'comparison',
    path: '/comparison',
    title: 'Comparison',
    description:
      'This page compares all rendering methods, listing their pros and cons.\nYou can click on each point to view a detailed explanation.'
  },
  {
    chunk: 'core-web-vitals',
    path: '/web-vitals',
    title: 'Web Vitals',
    description: 'This page specifies the values of core web vitals.'
  }
]

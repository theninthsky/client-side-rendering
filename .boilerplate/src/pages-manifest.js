export default [
  {
    chunk: 'home',
    path: '/',
    title: 'Home'
  },
  {
    chunk: 'lorem-ipsum',
    path: '/lorem-ipsum',
    title: 'Lorem Ipsum',
    data: [
      {
        url: 'https://client-side-rendering.pages.dev/json/lorem-ipsum.json',
        crossorigin: 'anonymous'
      }
    ]
  }
]

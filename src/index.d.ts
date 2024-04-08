declare module 'react/jsx-runtime' {
  export default any
}

declare module '*.svg' {
  export default any
}

declare module 'pages-manifest' {
  const pages: [
    {
      chunk: string
      path: string
      title: string
      description: string
      data: {
        url: any
        dynamicPathIndexes: number[]
        crossorigin: string
        preconnectURL: string
        menuPreload: boolean
      }[]
      menuItem: boolean
    }
  ]

  export default pages
}

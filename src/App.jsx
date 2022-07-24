import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazyPrefetch } from 'frontend-essentials'

import pagesManifest from 'pages-manifest.json'
import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazyPrefetch(() => import(/* webpackChunkName: "index" */ 'pages/Home'))
const LoremIpsum = lazyPrefetch(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
const Pokemon = lazyPrefetch(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))

const pages = [Home, LoremIpsum, Pokemon]
const routes = pagesManifest.map(({ path }, ind) => {
  const Element = pages[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, description } =
      pagesManifest.find(({ path }) => pathname === path || pathname.startsWith(path.replace('/*', ''))) || {}

    document.title = title
    document.head.querySelector('meta[name="description"]').setAttribute('content', description)
  }, [pathname])

  return (
    <>
      <Navigation />

      <Layout>
        <Routes>
          {routes}

          <Route path="/*" element={<Navigate replace to="/" />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'

import pagesManifest from 'pages-manifest.json'
import lazyPrefetch from 'utils/lazy-prefetch'
import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazyPrefetch(() => import(/* webpackChunkName: "index" */ 'pages/Home'))
const LoremIpsum = lazyPrefetch(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
const Pokemon = lazyPrefetch(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))
const PokemonInfo = lazyPrefetch(() => import(/* webpackChunkName: "pokemon-info" */ 'pages/PokemonInfo'))
const WebVitals = lazyPrefetch(() => import(/* webpackChunkName: "core-web-vitals" */ 'pages/WebVitals'))

const pages = [Home, LoremIpsum, Pokemon, PokemonInfo, WebVitals]
const routes = pagesManifest.map(({ path }, ind) => {
  const Element = pages[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App = () => {
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

import type { FC } from 'react'
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import pagesManifest from 'pages-manifest.json'
import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazy(() => import(/* webpackChunkName: "home" */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
const Pokemon = lazy(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))
const PokemonInfo = lazy(() => import(/* webpackChunkName: "pokemon-info" */ 'pages/PokemonInfo'))
const WebVitals = lazy(() => import(/* webpackChunkName: "core-web-vitals" */ 'pages/WebVitals'))
const Comparison = lazy(() => import(/* webpackChunkName: "comparison" */ 'pages/Comparison'))

const pages = [Home, LoremIpsum, Pokemon, PokemonInfo, WebVitals, Comparison]
const routes = pagesManifest.map(({ path }, ind) => {
  const Element = pages[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App: FC<{}> = () => {
  return (
    <>
      <Navigation />

      <Layout>
        <Suspense>
          <Routes>
            {routes}

            <Route path="/*" element={<Navigate replace to="/" />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  )
}

export default App

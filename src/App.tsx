import { lazy, FC } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import pages from 'pages'
import Navigation from 'components/Navigation'
import ScrollToTop from 'components/common/ScrollToTop'
import Layout from 'components/Layout'

const Home = lazy(() => import(/* webpackChunkName: 'home' */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: 'lorem-ipsum' */ 'pages/LoremIpsum'))
const Pokemon = lazy(() => import(/* webpackChunkName: 'pokemon' */ 'pages/Pokemon'))
const PokemonInfo = lazy(() => import(/* webpackChunkName: 'pokemon-info' */ 'pages/PokemonInfo'))
const Comparison = lazy(() => import(/* webpackChunkName: 'comparison' */ 'pages/Comparison'))
const WebVitals = lazy(() => import(/* webpackChunkName: 'core-web-vitals' */ 'pages/WebVitals'))

const pageComponents = [Home, LoremIpsum, Pokemon, PokemonInfo, Comparison, WebVitals]
const routes = Object.values(pages).map(({ path }, ind) => {
  const Element = pageComponents[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App: FC<{}> = () => {
  return (
    <>
      <Navigation />

      <ScrollToTop />

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
